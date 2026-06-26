import json
import os
import time
from concurrent.futures import thread

from postdata import post_data

file = "../storage/events.jsonl"
threat_log_file = "../storage/alerts.jsonl"

threatDB = {
    "DDOS":"DDOS Detected",
    "MQTT_FLOOD":"DDOS Detected",
    "CONNECT_SPAM":"Reconnect Spam Detected",
    "PAYLOAD_SIZE_ANAMOLY":"Unsual Payload Size Spike Detected",
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

    # post_data(jsonData, "monitor_log")   # POSTS TO MONGODB

    with open(file, "a") as f:
        f.write(json.dumps(jsonData) + "\n")

def threat_log(device, threat_type, threat, payload = None, topic = None):
    threat_json_data = {
        "timestamp": int(time.time()),
        "client_id": device,
        "topic": topic,
        "threat_type": threatDB[threat_type],
        "threat_details": threat,
        "raw_payload": payload,
    }

    with open(threat_log_file, "a") as f:
        f.write(json.dumps(threat_json_data) + "\n")