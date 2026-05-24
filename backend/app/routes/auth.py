import os
from flask import Blueprint, request, jsonify, g
from app.middleware.auth_middleware import require_auth
from app.services.supabase_client import get_supabase

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/sync", methods=["POST"])
@require_auth
def sync_user():
    """
    Called by the frontend after a successful Google OAuth login.
    Creates or updates the user record in the public.users table.
    """
    data = request.get_json() or {}
    supabase = get_supabase()

    user_payload = {
        "id": g.user_id,
        "email": data.get("email", g.user_email),
        "full_name": data.get("full_name", ""),
        "avatar_url": data.get("avatar_url", ""),
    }

    result = (
        supabase.table("users")
        .upsert(user_payload, on_conflict="id")
        .execute()
    )

    if not result.data:
        return jsonify({"error": "Failed to sync user"}), 500

    return jsonify({"user": result.data[0]}), 200


@auth_bp.route("/me", methods=["GET"])
@require_auth
def get_me():
    """Returns the authenticated user's profile."""
    supabase = get_supabase()
    result = (
        supabase.table("users")
        .select("*")
        .eq("id", g.user_id)
        .single()
        .execute()
    )

    if not result.data:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": result.data}), 200
