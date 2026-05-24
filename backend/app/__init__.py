import os
from flask import Flask
from flask_cors import CORS


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-me")

    # CORS — allow frontend origin
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    CORS(app, origins=[frontend_url, "http://localhost:3000"], supports_credentials=True)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.tasks import tasks_bp
    from app.routes.users import users_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "Hairdrama Task API is running"}

    return app
