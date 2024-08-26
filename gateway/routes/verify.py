from flask import request, jsonify
from . import bp
from models.UserBehavior import UserBehavior
import requests

@bp.route('/verify', methods=['POST'])
def verify():
    try:
        user_behavior_data = request.json.get('userBehaviorData')

        user_behavior = UserBehavior(**user_behavior_data)
        print(user_behavior)
        user_behavior.save()
        
        response = requests.post('http://localhost:4000/api/v1/test', json=request.json)
        print(response)
        return jsonify(response.json()) 

    except Exception as e:
        print("Error in verify controller:", e) 
        return jsonify({"message": "An error occurred while processing your request."}), 500
