import paho.mqtt.client as mqtt
import ssl
import time

BROKER = "localhost"
PORT = 8883

CLIENT_ID = "reconnect_spam"

RECONNECTS = 20
DELAY = 0.1   # seconds


for i in range(RECONNECTS):

    client = mqtt.Client(
        client_id=CLIENT_ID
    )

    client.tls_set(
        cert_reqs=ssl.CERT_NONE
    )

    try:
        client.connect(
            BROKER,
            PORT
        )

        client.loop_start()

        print(
            f"[{i+1}] Connected"
        )

        time.sleep(DELAY)

        client.disconnect()

        print(
            f"[{i+1}] Disconnected"
        )

        client.loop_stop()

    except Exception as e:
        print(e)

print("Done")