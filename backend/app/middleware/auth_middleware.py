import os
import logging
from functools import wraps
from flask import request, jsonify, g
import jwt as pyjwt

logger = logging.getLogger(__name__)


def require_auth(f):
    """Decorator that validates the Supabase JWT in the Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth_header.split("Bearer ", 1)[1].strip()
        jwt_secret = os.environ.get("SUPABASE_JWT_SECRET")
        if not jwt_secret:
            logger.error("SUPABASE_JWT_SECRET not configured")
            return jsonify({"error": "Server misconfiguration"}), 500

        try:
            payload = pyjwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            # Store user info on Flask's request context (g)
            g.user_id = payload.get("sub")
            g.user_email = payload.get("email", "")
            g.user_role = payload.get("role", "authenticated")
        except pyjwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except pyjwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT: {e}")
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated
