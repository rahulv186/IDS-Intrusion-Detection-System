import csv
import os
import time
from postdata import post_data

file="mqtt_logs.csv"

if not os.path.exists(file):
    with open(file,"w") as f:
        writer=csv.writer(f)
        writer.writerow(["timestamp","client_id","topic","payload_size"])

def log(device,topic,payload):
    jsonData = {
            "timestamp": int(time.time()),
            "client_id": device,
            "topic": topic,
            "payload_size": len(payload)
        }
    post_data(jsonData, "monitor_log")
    with open(file,"a") as f:
        writer=csv.writer(f)
        writer.writerow([
            int(time.time()),
            device,
            topic,
            len(payload)
        ])
        
    

