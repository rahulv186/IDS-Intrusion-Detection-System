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

client = mqtt.Client(client_id="injector")

client.tls_set(
    ca_certs=CA,
    tls_version=ssl.PROTOCOL_TLSv1_2
)

client.connect(BROKER, PORT)
client.loop_start()   # keeps connection alive

def messageInjecttion():
    payload = {
        "device": "sensor1",
        "temperature": random.randint(200,400),
        "client_id": "injector"
    }

    client.publish("home/temperature", json.dumps(payload))
    print("Message sent")

if __name__ == "__main__":
    while True:
        messageInjecttion()
        time.sleep(60)