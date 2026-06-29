import paho.mqtt.client as mqtt
import ssl
import json
import time
import logger
# from postdata import post_data
from threat_detector import DDOS_detector, Detect_Payload_Size_Anamoly


BROKER = "localhost"
PORT = 8883
user = "admin"
password = "admin"

def on_connect(client, userdata, flags, rc):
    print("Security Monitor Connected")
    client.subscribe("#")


def on_message(client, userdata, msg):

    try:
        payload = json.loads(msg.payload.decode())
        payload_size = len(msg.payload)
    except:
        # alert(client, "MessageInjection", "Critical")
        return

    device = payload.get("device_id")

    if not device:
        # alert("Unknown Device", "MessageInjection", "Critical")
        return

    # SECURITY CHECKS
    logger.log(device, msg.topic, payload) #LOG THE EVENT BEFORE START THE CHECKS

    # PAYLOAD SIZE ANALOMY DETECTION
    print(payload)
    payload_threat = Detect_Payload_Size_Anamoly(payload, payload_size)
    if payload_threat:
        logger.threat_log(device, payload_threat.get("type"), payload_threat, payload, msg.topic, ip=payload_threat["ip"])
        print(f"[THREAT] : {payload_threat.get('type')}")

    # DDOS_detector(payload)
    ddos_threat = DDOS_detector(payload)
    if ddos_threat:
        logger.threat_log(device, ddos_threat.get("type"), ddos_threat, payload, msg.topic, ip=ddos_threat["ip"])
        print(f"[THREAT] : {payload_threat.get('type')}")


client = mqtt.Client(client_id="security_monitor")

client.tls_set(cert_reqs=ssl.CERT_NONE)

client.on_connect = on_connect
client.on_message = on_message

client.username_pw_set(username=user, password=password)

client.connect(BROKER, PORT)

client.loop_forever()
