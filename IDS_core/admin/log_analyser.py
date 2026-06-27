import time
import re
import requests
from datetime import datetime, UTC
import pathlib
import json
import threat_detector
from logger import threat_log

# KEEPS TRACK OF CONNECTED DEVICES

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent.parent
LOG_FILE = f"{BASE_DIR}/IDS_core/storage/mosquitto.log"
API = "http://localhost:5050/api/devices"


CONNECT_RE = re.compile(
    r"New client connected from (?P<ip>\S+) as (?P<client_id>[^\s(]+)",
    re.IGNORECASE
)

DISCONNECT_RE = re.compile(
    r"Client\s+(?P<client_id>[^\s]+)\s+\[(?P<ip>[^\]]+)\]\s+disconnected:\s+(?P<reason>.+)",
    re.IGNORECASE
)

DENIED_PUBLISH_RE = re.compile(
    r"Denied\s+PUBLISH\s+from\s+(?P<client_id>[^\s]+)\s+\((?P<flags>[^,]+.*?),\s+'(?P<topic>[^']+)'.*\((?P<size>\d+)\s+bytes\)\)",
    re.IGNORECASE
)

def now_utc():
    return datetime.now(UTC).isoformat()

file = "../storage/device_state.jsonl"
logfile = "../storage/connection_log.jsonl"

def send_update(data):
    print("SEND UPDATE")

    try:
        response = requests.post(API, json=data, timeout=5)
        print(f"[API] {response.status_code} - {response.text}")
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"[ERROR] Failed to update DB: {e}")

def update_device(data):

    client_id = data["client_id"]
    connect_spam = threat_detector.Reconnect_spam_detector(data)
    if connect_spam:
        threat_log(client_id, connect_spam.get("type"), connect_spam)
        pass

    if data["status"] == "Auth_Failed":
        jsonData = {
            "timestamp": int(time.time()),
            "client_id": client_id,
            "ip": data.get("ip"),
            "action": "Authentication Denied"
        }
        with open(logfile, "a") as f:
            f.write(json.dumps(jsonData) + "\n")
        return

    try:
        with open(file, "r") as f:
            devices = json.load(f)
    except:
        devices = {}


    devices[client_id] = {
        "client_id": client_id,
        "status": data["status"],
        "last_seen": data["last_seen"],
        "ip": data.get("ip")
    }

    with open(file, "w") as f:
        json.dump(devices, f, indent=4)


    print(f"[STATE UPDATED] {client_id}")

#     TRAFFIC LOGGER
    jsonData = {
        "timestamp": int(time.time()),
        "client_id": data["client_id"],
        "ip": data.get("ip"),
        "action": "Connects" if data["status"] == "connected" else "Disconnects"
    }
    with open(logfile, "a") as f:
        f.write(json.dumps(jsonData) + "\n")


print("Monitoring broker log...")

last_disconnect = {}

with open(LOG_FILE, "r", encoding="utf-8", errors="ignore") as f:
    f.seek(0, 2)

    while True:
        line = f.readline()

        if not line:
            time.sleep(0.5)
            continue

        line = line.strip()
        # print(f"[LOG] {line}")

        connect = CONNECT_RE.search(line)
        if connect:
            ip = connect.group("ip")
            client_id = connect.group("client_id")

            print(f"[CONNECTED] {client_id} from {ip}")

            send_update({
                "client_id": client_id,
                "ip": ip,
                "status": "connected",
                "last_seen": now_utc()
            })
            update_device({
                "client_id": client_id,
                "ip": ip,
                "status": "connected",
                "last_seen": now_utc()
            })
            continue

        disconnect = DISCONNECT_RE.search(line)
        if disconnect:
            client_id = disconnect.group("client_id").strip()

            ip = disconnect.group("ip")

            key = client_id
            current_time = int(time.time())


            if disconnect.group("reason").strip() == "not authorised.":
                print("[DISCONNECTED] Reason:", disconnect.group("reason").strip())

                update_device({
                    "client_id": client_id,
                    "ip": ip,
                    "status": "Auth_Failed",
                    "last_seen": now_utc()
                })


                continue



            if key in last_disconnect:
                if current_time - last_disconnect[key] < 2:
                    continue  # ignore duplicate

            last_disconnect[key] = current_time
            print(f"[DISCONNECTED] {client_id}")

            send_update({
                "client_id": client_id,
                "status": "disconnected",
                "last_seen": now_utc()
            })
            update_device({
                "client_id": client_id,
                "status": "disconnected",
                "last_seen": now_utc()
            })
            continue

        if "disconnected" in line.lower():
            print("[DEBUG] Found possible disconnect text:", line)

        if "OpenSSL Error" in line:
            print("[WARNING] SSL closed unexpectedly, but no client_id found")


        denied_publish = DENIED_PUBLISH_RE.search(line)
        if denied_publish:
            try:
                with open(file, "r") as g:
                    devices = json.load(g)
            except:
                print("[DEBUG] File not found:", file)

            ip = devices[client_id]["ip"]
            denied_client_id = denied_publish.group("client_id").strip()
            topic = denied_publish.group("topic").strip()
            threat = {
                "client_id": client_id,
                "ip": ip,
                "flags": denied_publish.group("flags").strip(),
                "topic": topic,
                "size": denied_publish.group("size").strip(),
            }
            threat_log(denied_client_id, "TOPIC_ABUSE", threat, topic=topic)