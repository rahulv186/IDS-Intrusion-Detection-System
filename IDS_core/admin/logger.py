import json
import os
import time
from postdata import post_data

file = "../storage/events.jsonl"
threat_log_file = "../storage/alerts.jsonl"

threatDB = {
    "MQTT_FLOOD":"DDOS Detected",
    "CONNECT_SPAM":"Reconnect Spam Detected",
    "PAYLOAD_SIZE_ANAMOLY":"Unsual Payload Size Spike Detected",
    "BRUTEFORCE_ATTACK":"BruteForce attack Detected",
    "TOPIC_ABUSE":"Unauthorized Access of Topic Attempted",
    "STATE_BYPASS":"Offline Publisher Detected"
}


# create file if not exists
if not os.path.exists(file):
    with open(file, "w") as f:
        json.dump([], f)   # IMPORTANT: start with empty list

def log(device, topic, payload):
    jsonData = {
        "timestamp": int(time.time()),
        "client_id": device,
        "topic": topic,
        "payload_size": len(payload),
        "raw_data": payload,
    }
    post_data(jsonData, "monitor_log")   # POSTS TO MONGODB

    with open(file, "a") as f:
        f.write(json.dumps(jsonData) + "\n")

def threat_log(client_id, threat_type = None, threat = None, payload = None, topic = None):
    threat_json_data = {
        "timestamp": int(time.time()),
        "client_id": client_id,
        "topic": topic,
        "threat_type": threat_type,
        "threat_details": threatDB[threat_type],
        "raw_payload": payload,
        "attack_type":threat_type,
        "severity":"High",
    }

    post_data(threat_json_data, "threat")

    with open(threat_log_file, "a") as f:
        f.write(json.dumps(threat_json_data) + "\n")