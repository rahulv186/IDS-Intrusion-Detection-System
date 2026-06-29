from collections import defaultdict
import time
import json
from datetime import datetime

from admin.logger import threat_log

DDOS_WINDOW = 2     # 10 CONNECTION / 2 SEC
DDOS_LIMIT = 10
counter = defaultdict(list)
file = "../storage/device_state.jsonl"


def DDOS_detector(payload):
    now = time.time()
    client_id = payload.get("client_id")
    counter[client_id].append(now)
    counter[client_id] = [
        t for t in counter[client_id]
        if now - t <= DDOS_WINDOW
    ]

    dur = max(counter[client_id][0]-now, 1)
    rate = len(counter[client_id]) / dur

    if len(counter[client_id]) > DDOS_LIMIT:
        with open(file, "r") as f:
            devices = json.load(f)
        ip = devices[client_id]["ip"]
        return {
            "type": "MQTT_FLOOD",
            "ip": ip,
            "client_id": client_id,
            "rate/sec": rate
        }

    return None


SPAM_WINDOW = 10         #5 CONNECTION / 1 SEC
SPAM_LIMIT = 5
history = defaultdict(list)
def Reconnect_spam_detector(payload):
    now = time.time()
    client_id = payload.get("client_id")
    history[client_id].append(now)

    history[client_id] = [
        t for t in history[client_id]
        if now - t <= SPAM_WINDOW
    ]
    if len(history[client_id]) > SPAM_LIMIT:

        if payload["status"] == "Auth_Failed":
            return {
                "type": "BRUTEFORCE_ATTACK",
                "client_id": client_id,
                "ip": payload.get("ip"),
            }
        return {
            "type": "CONNECT_SPAM",
            "client_id": client_id,
            "ip": payload.get("ip"),
        }

    return None


baseline_sizes = {}
def Detect_Payload_Size_Anamoly(payload, payload_size):
    client_id = payload.get("client_id")
    avg = baseline_sizes.get(client_id, payload_size)

    baseline_sizes[client_id] = ( avg * 0.9 + payload_size * 0.1 )
    if payload_size > baseline_sizes[client_id] * 2 or payload_size < baseline_sizes[client_id] * 0.5:
        with open(file, "r") as f:
            devices = json.load(f)
        return {
            "type": "PAYLOAD_SIZE_ANAMOLY",
            "ip": payload.get("ip"),
            "Expected Avg":baseline_sizes[client_id],
            "Actual Payload size": payload_size
        }

    return None


from datetime import datetime
import time
import json


def Detect_IP_Spoofing(client_id, ip):

    now = time.time()

    with open(file, "r") as f:
        devices = json.load(f)

    device = devices.get(client_id)

    if not device:
        return None

    if not device.get("old_ip"):
        return None

    last_seen = datetime.fromisoformat(
        device["last_seen"]
    ).timestamp()

    if now - last_seen < 60:

        if device["old_ip"] != ip:

            return {
                "type": "IP_SPOOFING",
                "client_id": client_id,
                "ip": ip,
                "old_ip": device["old_ip"],
            }

    return None