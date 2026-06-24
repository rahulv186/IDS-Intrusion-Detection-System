import paho.mqtt.client as mqtt
import ssl
import json
import time
import statistics
import logger
from postdata import post_data


BROKER = "localhost"
PORT = 8883

known_devices = {}

WINDOW = 5
FLOOD_THRESHOLD = 3
SIZE_ANOMALY_FACTOR = 3


def alert(client_id, attack_type, severity="High"):
    
    data = {
        "client_id": client_id,
        "attack_type": attack_type,
        "severity": severity,
        "timestamp": int(time.time())
    }

    print("ALERT:", data)
    post_data(data, "alert")


def on_connect(client, userdata, flags, rc):
    print("Security Monitor Connected")
    client.subscribe("#")


def analyze_payload(device, payload_size):

    profile = known_devices[device]
    sizes = profile["payload_sizes"]

    sizes.append(payload_size)

    if len(sizes) > 50:
        sizes.pop(0)

    if len(sizes) > 5:
        avg = statistics.mean(sizes)

        if payload_size > avg * SIZE_ANOMALY_FACTOR:
            alert(device, "Payload size anomaly detected")


def detect_flood(device):

    now = time.time()

    profile = known_devices[device]
    times = profile["times"]

    times.append(now)

    cutoff = now - WINDOW

    while times and times[0] < cutoff:
        times.pop(0)

    rate = len(times) / WINDOW

    if rate > FLOOD_THRESHOLD:
        alert(device, "DoS Flooding", "Critical")


def detect_topic_abuse(device, topic):

    profile = known_devices[device]

    allowed = profile["topic"]

    if topic != allowed:
        alert(device, "Topic Abuse", "High")


def detect_impersonation(device, client_id):

    profile = known_devices[device]

    clients = profile["clients"]

    if client_id not in clients:

        if clients:
            alert(device, "Device Impersonation", "Critical")

        clients.add(client_id)


def on_message(client, userdata, msg):

    try:
        payload = json.loads(msg.payload.decode())
    except:
        alert(device, "MessageInjection", "Critical")
        return

    device = payload.get("device_id")

    if not device:
        alert("Unknown Device", "MessageInjection", "Critical")
        return

    payload_size = len(msg.payload)

    logger.log(device, msg.topic, msg.payload)

    if device not in known_devices:

        known_devices[device] = {
            "topic": msg.topic,
            "clients": set(),
            "times": [],
            "payload_sizes": []
        }

        print(f"New device learned: {device}")

    client_id = payload.get("client_id")

    if client_id:
        detect_impersonation(device, client_id)

    detect_topic_abuse(device, msg.topic)

    detect_flood(device)

    analyze_payload(device, payload_size)


client = mqtt.Client(client_id="security_monitor")

client.tls_set(cert_reqs=ssl.CERT_NONE)

client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT)

client.loop_forever()
