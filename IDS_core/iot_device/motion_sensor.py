import paho.mqtt.client as mqtt
import ssl
import json
import time
import random

BROKER = "localhost"
PORT = 8883
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent.parent

CA = BASE / "Certs" / "ca.crt"

device_id = "motion_sensor"
topic = f"home/{device_id}"

client = mqtt.Client(client_id=device_id)
client.tls_set(ca_certs=CA, tls_version=ssl.PROTOCOL_TLSv1_2)
client.connect(BROKER, PORT)

while True:
    payload = {"device_id": device_id, "motion": random.choice([True, False])}
    client.publish(topic, json.dumps(payload))
    print(f"[{device_id}] Published: {payload}")
    time.sleep(1)