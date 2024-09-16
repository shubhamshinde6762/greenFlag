from flask import request, jsonify
from . import bp
from models.UserBehavior import UserBehavior
from models.VerificationLog import VerificationLog, MouseMetrics, KeyboardMetrics, ValidationResults
import requests
import ipaddress
import geoip2.database
from user_agents import parse
from scipy.spatial.distance import euclidean
from datetime import datetime
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta
import joblib

# model = joblib.load('path/to/your/isolation_forest_model.joblib')
# geoip_reader = geoip2.database.Reader('path/to/your/GeoLite2-City.mmdb')

def is_valid_ip(ip):
    try:
        ipaddress.ip_address(ip)
        return True
    except ValueError:
        return False

def calculate_entropy(data):
    _, counts = np.unique(data, return_counts=True)
    probabilities = counts / len(data)
    return -np.sum(probabilities * np.log2(probabilities))

def check_user_agent(user_agent):
    parsed_ua = parse(user_agent)
    if parsed_ua.is_bot or not parsed_ua.browser.family:
        return False
    return True

from datetime import datetime
from scipy.spatial.distance import euclidean
import numpy as np

def calculate_entropy(speeds):
    # Dummy implementation, replace with actual entropy calculation
    return np.mean(speeds) if speeds else 0

def analyze_mouse_movement(cursor_data):
    if len(cursor_data) < 2:
        return False, MouseMetrics()
    
    total_distance = 0
    total_time = 0
    speeds = []
    accelerations = []
    
    for i in range(1, len(cursor_data)):
        start = cursor_data[i-1]
        end = cursor_data[i]
        
        distance = euclidean((start['x'], start['y']), (end['x'], end['y']))
        time_diff = (datetime.fromisoformat(end['timestamp']) - datetime.fromisoformat(start['timestamp'])).total_seconds()
        
        if time_diff > 0:
            speed = distance / time_diff
            speeds.append(speed)
            if len(speeds) > 1:
                acceleration = (speed - speeds[-2]) / time_diff
                accelerations.append(acceleration)
        
        total_distance += distance
        total_time += time_diff
    
    average_speed = total_distance / total_time if total_time > 0 else 0
    max_speed = max(speeds) if speeds else 0
    average_acceleration = np.mean(accelerations) if accelerations else 0
    entropy = calculate_entropy(speeds)
    
    mouse_movement_valid = average_speed >= 1 and average_speed <= 500 and max_speed <= 1000
    print(mouse_movement_valid)
    mouse_metrics = MouseMetrics(
        total_distance=total_distance,
        total_time=total_time,
        average_speed=average_speed,
        max_speed=max_speed,
        acceleration=average_acceleration,
        entropy=entropy
    )
    print(type(mouse_movement_valid))
    return bool(mouse_movement_valid), mouse_metrics

def analyze_keyboard_input(keystroke_data):
    # Generate base timestamp
    base_timestamp = datetime.utcnow()

    # Add timestamps to the keystroke_data if missing
    for i, keystroke in enumerate(keystroke_data):
        # Increment timestamp for each keystroke
        # Assuming each keystroke happens consecutively
        keystroke['timestamp'] = (base_timestamp + timedelta(milliseconds=sum([k['duration'] for k in keystroke_data[:i]]))).isoformat() + "Z"

    if len(keystroke_data) < 5:
        return False, {'total_keystrokes': 0, 'average_interval': 0, 'entropy': 0}

    key_press_durations = []
    intervals = []

    for i in range(len(keystroke_data)):
        # Ensure 'keyPressDuration' and 'timestamp' keys exist before using them
        if 'keyPressDuration' in keystroke_data[i]:
            key_press_durations.append(keystroke_data[i]['keyPressDuration'])

        if i < len(keystroke_data) - 1:
            if 'timestamp' in keystroke_data[i] and 'timestamp' in keystroke_data[i + 1]:
                # Convert timestamp strings to datetime objects
                ts1 = datetime.fromisoformat(keystroke_data[i]['timestamp'].replace("Z", ""))
                ts2 = datetime.fromisoformat(keystroke_data[i + 1]['timestamp'].replace("Z", ""))
                intervals.append((ts2 - ts1).total_seconds() * 1000)  # Interval in milliseconds
            else:
                # Handle missing 'timestamp'
                print(f"Missing 'timestamp' in keystrokeData at index {i}")

    if not key_press_durations or not intervals:
        return False, {'total_keystrokes': 0, 'average_interval': 0, 'entropy': 0}

    entropy = calculate_entropy(key_press_durations)
    average_interval = np.mean(intervals) if intervals else 0

    # Return metrics as a dictionary
    metrics = {
        'total_keystrokes': len(keystroke_data),
        'average_interval': average_interval,
        'entropy': entropy
    }

    is_valid = entropy >= 1.0
    return is_valid, metrics


@bp.route('/verify', methods=['POST'])
def verify():
    try:
        data = request.json
        user_behavior_data = data.get('userBehaviorData')
        form_data = data.get('formData')

        verification_log = VerificationLog()
        validation_results = ValidationResults()

        ip_address = request.remote_addr
        verification_log.ip_address = ip_address
        validation_results.ip_valid = is_valid_ip(ip_address)
        if not validation_results.ip_valid:
            verification_log.validation_results = validation_results
            verification_log.notes = "Invalid IP address."
            verification_log.save()
            return jsonify({"message": "Invalid IP address."}), 400

        user_agent = request.headers.get('User-Agent')
        verification_log.user_agent = user_agent
        validation_results.user_agent_valid = check_user_agent(user_agent)
        if not validation_results.user_agent_valid:
            verification_log.validation_results = validation_results
            verification_log.notes = "Invalid User-Agent."
            verification_log.save()
            return jsonify({"message": "Invalid User-Agent."}), 400

        # Geolocation checks can be uncommented and adjusted as necessary
        # try:
        #     geo_response = geoip_reader.city(ip_address)
        #     verification_log.ip_latitude = geo_response.location.latitude
        #     verification_log.ip_longitude = geo_response.location.longitude
        #     verification_log.reported_latitude = user_behavior_data['geoLocation']['latitude']
        #     verification_log.reported_longitude = user_behavior_data['geoLocation']['longitude']
            
        #     validation_results.geolocation_match = (
        #         abs(verification_log.ip_latitude - verification_log.reported_latitude) <= 1 and
        #         abs(verification_log.ip_longitude - verification_log.reported_longitude) <= 1
        #     )
        #     if not validation_results.geolocation_match:
        #         verification_log.validation_results = validation_results
        #         verification_log.notes = "Geolocation mismatch."
        #         verification_log.save()
        #         return jsonify({"message": "Geolocation mismatch."}), 400
        # except Exception as e:
        #     print(f"GeoIP error: {e}")

        verification_log.browser_fingerprint = user_behavior_data.get('browserFingerprint')
        validation_results.fingerprint_present = bool(verification_log.browser_fingerprint)
        if not validation_results.fingerprint_present:
            verification_log.validation_results = validation_results    
            verification_log.notes = "Missing browser fingerprint."
            verification_log.save()
            return jsonify({"message": "Missing browser fingerprint."}), 400

        verification_log.time_on_page = user_behavior_data['timeOnPage']
        verification_log.idle_time = user_behavior_data['idleTime']
        validation_results.session_duration_valid = verification_log.time_on_page >= 5
        if not validation_results.session_duration_valid:
            verification_log.validation_results = validation_results
            verification_log.notes = "Suspiciously short session."
            verification_log.save()
            return jsonify({"message": "Suspiciously short session."}), 400

        print(validation_results)
        validation_results.mouse_movement_valid, verification_log.mouse_metrics = analyze_mouse_movement(user_behavior_data['cursorData'])
        if not isinstance(validation_results.mouse_movement_valid, bool):
            print("Error: mouse_movement_valid is not a boolean value.")
        if not validation_results.mouse_movement_valid:
            verification_log.validation_results = validation_results
            verification_log.notes = "Suspicious mouse movement."
            verification_log.save()
            return jsonify({"message": "Suspicious mouse movement."}), 400

        validation_results.keyboard_input_valid, verification_log.keyboard_metrics = analyze_keyboard_input(user_behavior_data['keystrokeData'])
        if not isinstance(validation_results.keyboard_input_valid, bool):
            print("Error: keyboard_input_valid is not a boolean value.")
        if not validation_results.keyboard_input_valid:
            verification_log.validation_results = validation_results
            verification_log.notes = "Suspicious keyboard input."
            verification_log.save()
            return jsonify({"message": "Suspicious keyboard input."}), 400

        if user_behavior_data['deviceInfo']['deviceType'] == 'mobile':
            orientation_data = user_behavior_data['deviceOrientation']
            validation_results.device_orientation_valid = len(set([orientation_data['alpha'], orientation_data['beta'], orientation_data['gamma']])) > 1
            if not isinstance(validation_results.device_orientation_valid, bool):
                print("Error: device_orientation_valid is not a boolean value.")
            if not validation_results.device_orientation_valid:
                verification_log.validation_results = validation_results
                verification_log.notes = "Suspicious device orientation data."
                verification_log.save()
                return jsonify({"message": "Suspicious device orientation data."}), 400

        verification_log.model_features = [
            len(user_behavior_data['cursorData']),
            len(user_behavior_data['clickData']),
            len(user_behavior_data['keystrokeData']),
            verification_log.time_on_page,
            verification_log.idle_time,
            len(user_behavior_data['copyPasteData']),
            user_behavior_data['zoomLevel'],
        ]

        # Uncomment if using a model for bot detection
        # verification_log.model_prediction = model.predict([verification_log.model_features])[0]
        # verification_log.is_bot = verification_log.model_prediction == -1  # Isolation Forest returns -1 for anomalies
        # if verification_log.is_bot:
        #     verification_log.notes = "Behavior classified as bot-like by the machine learning model."
        #     verification_log.save()
        #     return jsonify({"message": "Behavior classified as bot-like."}), 400

        user_behavior = UserBehavior(**user_behavior_data)
        user_behavior.save()

        verification_log.user_behavior_id = user_behavior.id
        verification_log.validation_results = validation_results
        verification_log.save()

        response = requests.post('http://localhost:4000/api/v1/test', json=data)

        return jsonify(response.json())

    except Exception as e:
        print("Error in verify controller:", e) 
        verification_log.notes = f"Error occurred: {str(e)}"
        verification_log.save()
        return jsonify({"message": "An error occurred while processing your request."}), 500



@bp.route('/admin/verification-logs', methods=['GET'])
def get_verification_logs():
    try:
        # You might want to add pagination here
        logs = VerificationLog.objects.order_by('-timestamp')
        return jsonify([log.to_mongo().to_dict() for log in logs])
    except Exception as e:
        print("Error retrieving verification logs:", e)
        return jsonify({"message": "An error occurred while retrieving verification logs."}), 500