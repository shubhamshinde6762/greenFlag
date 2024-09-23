from flask import request, jsonify
from bson import ObjectId
import random
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
    return bool(True), mouse_metrics

def analyze_keyboard_input(keystroke_data):
    # Generate base timestamp
    # base_timestamp = datetime.utcnow()

    # # Add timestamps to the keystroke_data if missing
    # for i, keystroke in enumerate(keystroke_data):
    #     # Increment timestamp for each keystroke
    #     # Assuming each keystroke happens consecutively
    #     keystroke['timestamp'] = (base_timestamp + timedelta(milliseconds=sum([k['duration'] for k in keystroke_data[:i]]))).isoformat() + "Z"

    # if len(keystroke_data) < 5:
    #     return False, {'total_keystrokes': 0, 'average_interval': 0, 'entropy': 0}

    # key_press_durations = []
    # intervals = []

    # for i in range(len(keystroke_data)):
    #     # Ensure 'keyPressDuration' and 'timestamp' keys exist before using them
    #     if 'keyPressDuration' in keystroke_data[i]:
    #         key_press_durations.append(keystroke_data[i]['keyPressDuration'])

    #     if i < len(keystroke_data) - 1:
    #         if 'timestamp' in keystroke_data[i] and 'timestamp' in keystroke_data[i + 1]:
    #             # Convert timestamp strings to datetime objects
    #             ts1 = datetime.fromisoformat(keystroke_data[i]['timestamp'].replace("Z", ""))
    #             ts2 = datetime.fromisoformat(keystroke_data[i + 1]['timestamp'].replace("Z", ""))
    #             intervals.append((ts2 - ts1).total_seconds() * 1000)  # Interval in milliseconds
    #         else:
    #             # Handle missing 'timestamp'
    #             print(f"Missing 'timestamp' in keystrokeData at index {i}")

    # if not key_press_durations or not intervals:
    #     return False, {'total_keystrokes': 0, 'average_interval': 0, 'entropy': 0}

    # entropy = calculate_entropy(key_press_durations)
    # average_interval = np.mean(intervals) if intervals else 0

    # # Return metrics as a dictionary
    random.seed(100)
    metrics = {
        'total_keystrokes': len(keystroke_data),
        'average_interval': random.random(),
        'entropy': random.random()
    }

    # is_valid = entropy >= 1.0
    return bool(True), {}


@bp.route('/verify', methods=['POST'])
def verify():
    try:
        data = request.json
        if data is None:
            return jsonify({"message": "No JSON data provided"}), 400

        user_behavior_data = data.get('userBehaviorData')
        verification_log = VerificationLog()
        verification_log.is_bot = True
        validation_results = ValidationResults()
        failed_checks = []
        

        # form_data = data.get('formData')
        # if form_data is None:
        #     verification_log.save()
        #     return jsonify({"message": "No form data provided"}), 400


        # IP Address check
        ip_address = request.remote_addr
        verification_log.ip_address = ip_address
        if ip_address is None or ip_address == '':
            validation_results.ip_valid = False
            failed_checks.append("Missing IP address")
        else:
            validation_results.ip_valid = is_valid_ip(ip_address)
            if not validation_results.ip_valid:
                failed_checks.append("Invalid IP address")

        # User Agent check
        user_agent = request.headers.get('User-Agent')
        verification_log.user_agent = user_agent
        if user_agent is None or user_agent == '':
            validation_results.user_agent_valid = False
            failed_checks.append("Missing User-Agent")
        else:
            validation_results.user_agent_valid = check_user_agent(user_agent)
            if not validation_results.user_agent_valid:
                failed_checks.append("Invalid User-Agent")
                
                
        if user_behavior_data is None:
            verification_log.notes = f"Failed checks: {', '.join(failed_checks)}" + " No user behavior data provided"
            verification_log.save()
            return jsonify({"message": "No user behavior data provided"}), 400

        # Browser Fingerprint check
        browser_fingerprint = user_behavior_data.get('browserFingerprint')
        verification_log.browser_fingerprint = browser_fingerprint
        if browser_fingerprint is None or browser_fingerprint == '':
            validation_results.fingerprint_present = False
            failed_checks.append("Missing browser fingerprint")
        else:
            validation_results.fingerprint_present = True

        time_on_page = user_behavior_data.get('idleTime')
        print(time_on_page)
        idle_time = user_behavior_data.get('idleTime')
        if time_on_page is None or idle_time is None:
            validation_results.session_duration_valid = False
            failed_checks.append("Missing session duration data")
        else:
            verification_log.time_on_page = time_on_page
            verification_log.idle_time = idle_time
            validation_results.session_duration_valid = idle_time >= 3
            if not validation_results.session_duration_valid:
                failed_checks.append("Suspiciously short session")

        # Mouse movement check
        cursor_data = user_behavior_data.get('cursorData')
        if cursor_data is None or len(cursor_data) == 0:
            validation_results.mouse_movement_valid = False
            failed_checks.append("Missing mouse movement data")
        else:
            validation_results.mouse_movement_valid, mouse_metrics = analyze_mouse_movement(cursor_data)
            if mouse_metrics:
                verification_log.mouse_metrics = MouseMetrics(
                    total_distance=mouse_metrics.total_distance,
                    total_time=mouse_metrics.total_time,
                    average_speed=mouse_metrics.average_speed,
                    max_speed=mouse_metrics.max_speed,
                    acceleration=mouse_metrics.acceleration,
                    entropy=mouse_metrics.entropy
                )
            if not validation_results.mouse_movement_valid:
                failed_checks.append("Suspicious mouse movement")

        # Keyboard input check
        keystroke_data = user_behavior_data.get('keystrokeData')
        if keystroke_data is None or len(keystroke_data) == 0:
            validation_results.keyboard_input_valid = False
            failed_checks.append("Missing keyboard input data")
        else:
            validation_results.keyboard_input_valid, keyboard_metrics = analyze_keyboard_input(keystroke_data)
            if keyboard_metrics:
                verification_log.keyboard_metrics = KeyboardMetrics(
                    total_keystrokes=keyboard_metrics.get('total_keystrokes', 0),
                    average_interval=keyboard_metrics.get('average_interval', 0),
                    entropy=keyboard_metrics.get('entropy', 0)
                )
            if not validation_results.keyboard_input_valid:
                failed_checks.append("Suspicious keyboard input")

        # Device orientation check (for mobile devices)
        device_info = user_behavior_data.get('deviceInfo')
        if device_info is None:
            validation_results.device_orientation_valid = False
            failed_checks.append("Missing device info")
        elif device_info.get('deviceType') == 'mobile':
            orientation_data = user_behavior_data.get('deviceOrientation')
            if orientation_data is None:
                validation_results.device_orientation_valid = False
                failed_checks.append("Missing device orientation data for mobile device")
            else:
                alpha = orientation_data.get('alpha')
                beta = orientation_data.get('beta')
                gamma = orientation_data.get('gamma')
                if alpha is None or beta is None or gamma is None:
                    validation_results.device_orientation_valid = False
                    failed_checks.append("Incomplete device orientation data")
                else:
                    validation_results.device_orientation_valid = len(set([alpha, beta, gamma])) > 1
                    if not validation_results.device_orientation_valid:
                        failed_checks.append("Suspicious device orientation data")
        else:
            validation_results.device_orientation_valid = None  # Not applicable for non-mobile devices

        # Prepare model features
        verification_log.model_features = [
            len(cursor_data) if cursor_data else 0,
            len(user_behavior_data.get('clickData', [])),
            len(keystroke_data) if keystroke_data else 0,
            verification_log.time_on_page if hasattr(verification_log, 'time_on_page') else 0,
            verification_log.idle_time if hasattr(verification_log, 'idle_time') else 0,
            len(user_behavior_data.get('copyPasteData', [])),
            user_behavior_data.get('zoomLevel', 0),
        ]

        if failed_checks or idle_time < 3:
            verification_log.validation_results = validation_results
            verification_log.mouse_movement_valid = False
            verification_log.keyboard_input_valid = False
            verification_log.notes = f"Failed checks: {', '.join(failed_checks)}"
            verification_log.is_bot = True
            verification_log.save()
            return jsonify({"message": f"Verification failed: {verification_log.notes}"}), 400

        # If all checks pass
        user_behavior = UserBehavior(**user_behavior_data)
        user_behavior.save()

        verification_log.user_behavior_id = user_behavior.id
        verification_log.validation_results = validation_results
        verification_log.is_bot = False
        verification_log.save()

        # response = requests.post('http://localhost:4000/api/v1/test', json=data)
        return {}
        return jsonify(response.json())

    except Exception as e:
        print("Error in verify controller:", e) 
        verification_log.notes = f"Error occurred: {str(e)}"
        verification_log.save()
        return jsonify({"message": "An error occurred while processing your request."}), 500

@bp.route('/admin/verification-logs', methods=['GET'])
def get_verification_logs():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        print(page, limit)
        
        skip = (page - 1) * limit

        logs = VerificationLog.objects.order_by('-timestamp').skip(skip).limit(limit)
        total_logs = VerificationLog.objects.count()  

        def serialize_log(log):
            log_dict = log.to_mongo().to_dict()
            for key, value in log_dict.items():
                if isinstance(value, ObjectId):
                    log_dict[key] = str(value)
            return log_dict

        response = {
            "page": page,
            "limit": limit,
            "total_logs": total_logs,
            "total_pages": (total_logs + limit - 1) // limit,
            "logs": [serialize_log(log) for log in logs]
        }

        return jsonify(response)
    except Exception as e:
        print("Error retrieving verification logs:", e)
        return jsonify({"message": "An error occurred while retrieving verification logs."}), 500