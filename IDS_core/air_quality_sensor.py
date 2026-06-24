import paho.mqtt.client as mqtt
import ssl
import json
import time
import random
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
CA = BASE / "Certs" / "ca.crt"

BROKER = "localhost"
PORT = 8883

device_id = "air_quality_sensor"
topic = f"home/{device_id}"

client = mqtt.Client(client_id=device_id)
client.tls_set(ca_certs=CA, tls_version=ssl.PROTOCOL_TLSv1_2)
client.connect(BROKER, PORT)

while True:
    payload = {"device_id": device_id, "aqi": random.randint(0, 500)}
    client.publish(topic, json.dumps(payload))
    print(f"[{device_id}] Published: {payload}")
    time.sleep(1)