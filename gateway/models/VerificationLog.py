from mongoengine import Document, EmbeddedDocument, fields
from datetime import datetime

class MouseMetrics(EmbeddedDocument):
    total_distance = fields.FloatField()
    total_time = fields.FloatField()
    average_speed = fields.FloatField()
    max_speed = fields.FloatField()
    acceleration = fields.FloatField()
    entropy = fields.FloatField()

class KeyboardMetrics(EmbeddedDocument):
    total_keystrokes = fields.IntField()
    average_interval = fields.FloatField()
    entropy = fields.FloatField()

class ValidationResults(EmbeddedDocument):
    ip_valid = fields.BooleanField()
    user_agent_valid = fields.BooleanField()
    geolocation_match = fields.BooleanField()
    fingerprint_present = fields.BooleanField()
    session_duration_valid = fields.BooleanField()
    mouse_movement_valid = fields.BooleanField()
    keyboard_input_valid = fields.BooleanField()
    device_orientation_valid = fields.BooleanField()

class VerificationLog(Document):
    timestamp = fields.DateTimeField(default=datetime.utcnow)
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    browser_fingerprint = fields.StringField()
    
    # Geolocation data
    reported_latitude = fields.FloatField()
    reported_longitude = fields.FloatField()
    ip_latitude = fields.FloatField()
    ip_longitude = fields.FloatField()
    
    # Session data
    time_on_page = fields.FloatField()
    idle_time = fields.FloatField()
    
    # Metrics
    mouse_metrics = fields.EmbeddedDocumentField(MouseMetrics)
    keyboard_metrics = fields.EmbeddedDocumentField(KeyboardMetrics)
    
    # Validation results
    validation_results = fields.EmbeddedDocumentField(ValidationResults)
    
    # Model prediction
    model_features = fields.ListField(fields.FloatField())
    model_prediction = fields.IntField()  # -1 for anomaly, 1 for normal
    
    # Final outcome
    is_bot = fields.BooleanField()
    
    # Additional data
    user_behavior_id = fields.ReferenceField('UserBehavior')
    notes = fields.StringField()

    meta = {
        'indexes': [
            'timestamp',
            'ip_address',
            'browser_fingerprint',
            'is_bot'
        ]
    }