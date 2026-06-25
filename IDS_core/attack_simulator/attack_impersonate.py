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

client = mqtt.Client(client_id="impersonator")

client.tls_set(
    ca_certs=CA,
    tls_version=ssl.PROTOCOL_TLSv1_2
)

client.connect(BROKER, PORT)
client.loop_start()   # keeps connection alive

def impersonate():
    payload={"device_id":"sensor1","temperature":random.randint(20,40),"client_id":"impersonator"}

    client.publish("home/temperature", json.dumps(payload))
    print("Message sent")

if __name__ == "__main__":
    while True:
        impersonate()
        time.sleep(60)