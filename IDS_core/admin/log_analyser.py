import time
import re
import requests
from datetime import datetime, UTC
import pathlib
import json

# KEEPS TRACK OF CONNECTED DEVICES

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent.parent
LOG_FILE = f"{BASE_DIR}/IDS_core/storage/mosquitto.log"
API = "http://localhost:5050/api/devices"

CONNECT_RE = re.compile(
    r"New client connected from (?P<ip>\S+) as (?P<client_id>[^\s(]+)",
    re.IGNORECASE
)

DISCONNECT_RE = re.compile(
    r"Client\s+(?P<client_id>[^\s]+)(?:\s+\[[^\]]+\])?\s+disconnected\b.*",
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
    try:
        with open(file, "r") as f:
            devices = json.load(f)
    except:
        devices = {}

    client_id = data["client_id"]

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
        print(f"[LOG] {line}")

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

            key = client_id
            current_time = int(time.time())

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