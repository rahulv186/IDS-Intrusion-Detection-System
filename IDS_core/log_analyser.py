import time
import re
import requests
from datetime import datetime, UTC

LOG_FILE = "/Users/rahul/Documents/Projects/Intrusion Detection System/IDS_core/mosquitto.log"
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


def send_update(data):
    print("SEND UPDATE")
    try:
        response = requests.post(API, json=data, timeout=5)
        print(f"[API] {response.status_code} - {response.text}")
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"[ERROR] Failed to update DB: {e}")


print("Monitoring broker log...")

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
            continue

        disconnect = DISCONNECT_RE.search(line)
        if disconnect:
            client_id = disconnect.group("client_id").strip()

            print(f"[DISCONNECTED] {client_id}")

            send_update({
                "client_id": client_id,
                "status": "disconnected",
                "last_seen": now_utc()
            })
            continue

        if "disconnected" in line.lower():
            print("[DEBUG] Found possible disconnect text:", line)

        if "OpenSSL Error" in line:
            print("[WARNING] SSL closed unexpectedly, but no client_id found")