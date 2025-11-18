from flask import Flask

def create_app():
    """
    Factory Function -→ Is it Factory Pattern?
    With this, we can create many instances of this app, which is useful
    for testing and stuff like choosing the best distribution
    """
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'ULTRASECRET$$$99999passwordKitasanblack'
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False

    with app.app_context():
        from app import routes
        app.register_blueprint(routes.bp)
    
    return app