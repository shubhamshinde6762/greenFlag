from flask import Flask
from flask_cors import CORS
from mongoengine import connect
from dotenv import load_dotenv
import os
import sys
from routes import verify

def create_app():
    load_dotenv()
    app = Flask(__name__)
    sys.stdout.flush()
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    CORS(app)
    connect(host=os.getenv('MONGO_URI'))
    app.register_blueprint(verify.bp)

    @app.route('/')
    def home():
        return 'Flask running at 5000'
    
    return app

 

