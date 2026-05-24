from flask import Blueprint, jsonify
from app.middleware.auth_middleware import require_auth
from app.services.supabase_client import get_supabase

users_bp = Blueprint("users", __name__)


@users_bp.route("/", methods=["GET"])
@require_auth
def list_users():
    """Returns all users. Used to populate assignment dropdowns."""
    supabase = get_supabase()
    result = (
        supabase.table("users")
        .select("id, email, full_name, avatar_url")
        .order("full_name")
        .execute()
    )
    return jsonify({"users": result.data or []}), 200
