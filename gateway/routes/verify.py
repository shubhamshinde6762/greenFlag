from flask import request, jsonify
from . import bp

@bp.route('/verify', methods=['POST'])
def verify():
    print("Request Data:", request.json)

    data = request.json

    response = {
        "message" : "Success"
    }

    return jsonify(response)
