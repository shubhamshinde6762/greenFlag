from flask import Flask
from flask_cors import CORS
from routes import verify
import sys

def create_app():
    app = Flask(__name__)
    sys.stdout.flush()
    CORS(app)  
    app.register_blueprint(verify.bp)
    @app.route('/')
    def home():
        return 'Flask running at 5000'
    
    return app 

 

