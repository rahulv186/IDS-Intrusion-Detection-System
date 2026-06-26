from collections import defaultdict
import time

DDOS_WINDOW = 2     # 10 CONNECTION / 2 SEC
DDOS_LIMIT = 10
counter = defaultdict(list)
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
        return {
            "type": "MQTT_FLOOD",
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
    print("RECONNECT CHECK HAPPENING")
    if len(history[client_id]) > SPAM_LIMIT:
        print("RECONNECT SPAM DETECTED")
        return {
            "type": "CONNECT_SPAM",
            "client_id": client_id,
            "IP": payload.get("ip"),
        }

    return None


baseline_sizes = {}
def Detect_Payload_Size_Anamoly(payload, payload_size):
    client_id = payload.get("client_id")
    avg = baseline_sizes.get(client_id, payload_size)

    baseline_sizes[client_id] = ( avg * 0.9 + payload_size * 0.1 )
    print(baseline_sizes[client_id])
    print(avg)
    if payload_size > baseline_sizes[client_id] * 2 or payload_size < baseline_sizes[client_id] * 0.5:
        return {
            "type": "PAYLOAD_SIZE_ANAMOLY",
            "IP": payload.get("ip"),
            "Expected Avg":baseline_sizes[client_id],
            "Actual Payload size": payload_size
        }

    return None