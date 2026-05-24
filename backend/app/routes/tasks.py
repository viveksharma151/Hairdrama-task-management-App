import os
import logging
from flask import Blueprint, request, jsonify, g
from app.middleware.auth_middleware import require_auth
from app.services.supabase_client import get_supabase
from app.services.email_service import (
    send_task_assigned_email,
    send_task_completed_email,
)

logger = logging.getLogger(__name__)
tasks_bp = Blueprint("tasks", __name__)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


def _get_user(supabase, user_id: str) -> dict | None:
    """Fetch a user record by ID."""
    result = supabase.table("users").select("*").eq("id", user_id).maybe_single().execute()
    return result.data


@tasks_bp.route("/", methods=["GET"])
@require_auth
def list_tasks():
    """
    List tasks. Supports query filters:
      ?filter=mine        → tasks assigned to me
      ?filter=created     → tasks I created
      ?status=todo|in_progress|done
      ?priority=low|medium|high
    """
    supabase = get_supabase()
    filter_type = request.args.get("filter", "all")
    status = request.args.get("status")
    priority = request.args.get("priority")

    query = supabase.table("tasks").select(
        "*, creator:users!tasks_created_by_fkey(id, full_name, email, avatar_url), "
        "assignee:users!tasks_assigned_to_fkey(id, full_name, email, avatar_url)"
    )

    if filter_type == "mine":
        query = query.eq("assigned_to", g.user_id)
    elif filter_type == "created":
        query = query.eq("created_by", g.user_id)

    if status:
        query = query.eq("status", status)
    if priority:
        query = query.eq("priority", priority)

    result = query.order("created_at", desc=True).execute()
    return jsonify({"tasks": result.data or []}), 200


@tasks_bp.route("/", methods=["POST"])
@require_auth
def create_task():
    """Create a new task and notify the assigned user via email."""
    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    supabase = get_supabase()

    task_payload = {
        "title": data["title"],
        "description": data.get("description", ""),
        "status": data.get("status", "todo"),
        "priority": data.get("priority", "medium"),
        "created_by": g.user_id,
        "assigned_to": data.get("assigned_to") or None,
        "due_date": data.get("due_date") or None,
    }

    result = supabase.table("tasks").insert(task_payload).execute()
    if not result.data:
        return jsonify({"error": "Failed to create task"}), 500

    task = result.data[0]

    # Email notification — notify the assignee
    if task.get("assigned_to") and task["assigned_to"] != g.user_id:
        assignee = _get_user(supabase, task["assigned_to"])
        creator = _get_user(supabase, g.user_id)
        if assignee and creator:
            send_task_assigned_email(
                to_email=assignee["email"],
                assignee_name=assignee.get("full_name") or assignee["email"],
                task_title=task["title"],
                task_description=task.get("description", ""),
                creator_name=creator.get("full_name") or creator["email"],
                task_id=task["id"],
                frontend_url=FRONTEND_URL,
            )

    return jsonify({"task": task}), 201


@tasks_bp.route("/<task_id>", methods=["GET"])
@require_auth
def get_task(task_id: str):
    """Get a single task by ID with creator and assignee info."""
    supabase = get_supabase()
    result = (
        supabase.table("tasks")
        .select(
            "*, creator:users!tasks_created_by_fkey(id, full_name, email, avatar_url), "
            "assignee:users!tasks_assigned_to_fkey(id, full_name, email, avatar_url)"
        )
        .eq("id", task_id)
        .single()
        .execute()
    )

    if not result.data:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"task": result.data}), 200


@tasks_bp.route("/<task_id>", methods=["PUT"])
@require_auth
def update_task(task_id: str):
    """
    Update a task. Triggers email notifications:
    - If newly assigned: notify new assignee
    - If status changed to 'done': notify creator
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    supabase = get_supabase()

    # Fetch existing task
    existing_result = supabase.table("tasks").select("*").eq("id", task_id).single().execute()
    if not existing_result.data:
        return jsonify({"error": "Task not found"}), 404

    old_task = existing_result.data

    # Build update payload (only allow certain fields)
    allowed_fields = {"title", "description", "status", "priority", "assigned_to", "due_date"}
    update_payload = {k: v for k, v in data.items() if k in allowed_fields}

    result = supabase.table("tasks").update(update_payload).eq("id", task_id).execute()
    if not result.data:
        return jsonify({"error": "Failed to update task"}), 500

    new_task = result.data[0]

    # Email: newly assigned user
    new_assigned_to = new_task.get("assigned_to")
    old_assigned_to = old_task.get("assigned_to")
    if new_assigned_to and new_assigned_to != old_assigned_to and new_assigned_to != g.user_id:
        assignee = _get_user(supabase, new_assigned_to)
        creator = _get_user(supabase, g.user_id)
        if assignee and creator:
            send_task_assigned_email(
                to_email=assignee["email"],
                assignee_name=assignee.get("full_name") or assignee["email"],
                task_title=new_task["title"],
                task_description=new_task.get("description", ""),
                creator_name=creator.get("full_name") or creator["email"],
                task_id=task_id,
                frontend_url=FRONTEND_URL,
            )

    # Email: task completed → notify original creator
    if new_task.get("status") == "done" and old_task.get("status") != "done":
        creator = _get_user(supabase, new_task["created_by"])
        completer = _get_user(supabase, g.user_id)
        if creator and completer and creator["id"] != g.user_id:
            send_task_completed_email(
                to_email=creator["email"],
                creator_name=creator.get("full_name") or creator["email"],
                task_title=new_task["title"],
                completer_name=completer.get("full_name") or completer["email"],
                task_id=task_id,
                frontend_url=FRONTEND_URL,
            )

    return jsonify({"task": new_task}), 200


@tasks_bp.route("/<task_id>", methods=["DELETE"])
@require_auth
def delete_task(task_id: str):
    """Delete a task. Only the creator can delete it."""
    supabase = get_supabase()

    # Check ownership
    existing = supabase.table("tasks").select("created_by").eq("id", task_id).single().execute()
    if not existing.data:
        return jsonify({"error": "Task not found"}), 404

    if existing.data["created_by"] != g.user_id:
        return jsonify({"error": "Only the task creator can delete this task"}), 403

    supabase.table("tasks").delete().eq("id", task_id).execute()
    return jsonify({"message": "Task deleted"}), 200
