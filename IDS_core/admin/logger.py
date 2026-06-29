import json
import os
import time
from postdata import post_data

file = "../storage/events.jsonl"
threat_log_file = "../storage/alerts.jsonl"

threatDB = {
    "MQTT_FLOOD": {"desc" :"DDOS Detected" , "severity":"High"},
    "CONNECT_SPAM": {"desc":"Reconnect Spam Detected" , "severity":"Medium"},
    "PAYLOAD_SIZE_ANAMOLY":{"desc" :"Unsual Payload Size Spike Detected" , "severity":"Medium"},
    "BRUTEFORCE_ATTACK":{"desc" :"BruteForce attack Detected", "severity":"High"},
    "TOPIC_ABUSE":{"desc" :"Unauthorized Access of Topic Attempted" , "severity":"Medium"},
    "STATE_BYPASS":{"desc" :"Offline Publisher Detected" , "severity":"High"},
    "IP_SPOOFING":{"desc":"Same Client Connected in Different IP", "severity":"High"},
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

def threat_log(client_id, threat_type = None, threat = None, payload = None, topic = None, ip = None):
    threat_json_data = {
        "timestamp": int(time.time()),
        "client_id": client_id,
        "ip" : ip,
        "topic": topic,
        "threat_type": threat_type,
        "severity": threatDB[threat_type]["severity"],
        "threat_details": threatDB[threat_type]["desc"],
        "raw_payload": payload,
        "attack_type":threat_type,
    }

    post_data(threat_json_data, "threat")

    with open(threat_log_file, "a") as f:
        f.write(json.dumps(threat_json_data) + "\n")
