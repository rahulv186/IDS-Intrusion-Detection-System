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


device_id="sensor1"
client=mqtt.Client(client_id=device_id)
client.tls_set(
    ca_certs=CA,
    tls_version=ssl.PROTOCOL_TLSv1_2
)
client.connect(BROKER, PORT)
while True:
    payload={"device_id":device_id,"temperature":random.randint(20,40),"client_id":device_id}
    client.publish("test/topic",json.dumps(payload))
    time.sleep(1)
