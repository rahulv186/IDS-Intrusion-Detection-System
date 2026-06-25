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

client = mqtt.Client(client_id="flooder")

client.tls_set(cert_reqs=mqtt.ssl.CERT_NONE)
client.tls_insecure_set(True)

client.connect(BROKER, PORT)
client.loop_start()   # keeps connection alive

def flood():
    for _ in range(20):
        payload={"device_id":"sensor1","temperature":random.randint(20,40),"client_id":"flooder"}
        client.publish("home/air_quality_sensor", json.dumps(payload))
    print("Message sent")

if __name__ == "__main__":
    while True:
        flood()
        time.sleep(1)
