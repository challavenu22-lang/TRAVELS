from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    CORS(app)
    
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import models here to ensure they are known to Flask-Migrate
    import models
    
    # Register blueprints (routes)
    from routes.auth_routes import auth_bp
    from routes.dashboard_routes import dashboard_bp
    from routes.history_routes import history_bp
    from routes.analytics_routes import analytics_bp
    from routes.template_routes import template_bp
    from routes.settings_routes import settings_bp
    from routes.generate_routes import generate_bp
    from routes.export_routes import export_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(history_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(template_bp, url_prefix='/api')
    app.register_blueprint(settings_bp, url_prefix='/api')
    app.register_blueprint(generate_bp, url_prefix='/api')
    app.register_blueprint(export_bp, url_prefix='/api')
    
    @app.route('/health')
    def health_check():
        return {'status': 'ok'}, 200

    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            print("DB initialization error:", e)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
