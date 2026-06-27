import paho.mqtt.client as mqtt
import ssl
import json
import time
import random
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent.parent
CA = BASE / "Certs" / "ca.crt"
BROKER = "localhost"
PORT = 8883


device_id="payload_anamoly"
client=mqtt.Client(client_id=device_id)
client.tls_set(
    ca_certs=CA,
    tls_version=ssl.PROTOCOL_TLSv1_2
)
client.username_pw_set(
    username="attack01",
    password="attack01"
)
client.connect(BROKER, PORT)
while True:
    for i in range(30):



        # small payload anomaly
        if 10 <= i <= 14:
            payload = {
            "device_id": device_id,
            "client_id": device_id,}

        # large payload anomaly
        elif 20 <= i <= 24:
            payload = {
                "device_id": device_id,
                "client_id": device_id,
                "temp": 25,
                "blob": "A" * 10000
            }
        else:
            # normal traffic
            payload = {
                "device_id": device_id,
                "client_id": device_id,
                "temp": random.randint(20, 30),
                "humidity": random.randint(40, 60)
            }
        client.publish("test/topic",json.dumps(payload))
        print(i)
        time.sleep(1)
    time.sleep(5)
