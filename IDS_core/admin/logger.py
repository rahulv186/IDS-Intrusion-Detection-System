import json
import os
import time
from postdata import post_data

file = "../storage/events.jsonl"

# create file if not exists
if not os.path.exists(file):
    with open(file, "w") as f:
        json.dump([], f)   # IMPORTANT: start with empty list

def log(device, topic, payload):
    jsonData = {
        "timestamp": int(time.time()),
        "client_id": device,
        "topic": topic,
        "payload_size": len(payload)
    }

    post_data(jsonData, "monitor_log")

    with open(file, "a") as f:
        f.write(json.dumps(jsonData) + "\n")