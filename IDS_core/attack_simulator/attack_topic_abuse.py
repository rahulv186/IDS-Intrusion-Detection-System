import paho.mqtt.client as mqtt
import ssl
import json
import time
import random

BROKER = "localhost"
PORT = 8883
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent

CA = BASE / "Certs" / "ca.crt"

client = mqtt.Client(client_id="topicAbuser")

client.tls_set(
    ca_certs=CA,
    tls_version=ssl.PROTOCOL_TLSv1_2
)

client.connect(BROKER, PORT)
client.loop_start()   # keeps connection alive

def topicAbuse():
    payload = {
        "device_id": "sensor1",
        "temperature": random.randint(20,40),
        "client_id": "topicAbuser"
    }

    client.publish("home/bedroom", json.dumps(payload))
    print("Message sent")

if __name__ == "__main__":
    while True:
        topicAbuse()
        time.sleep(60)