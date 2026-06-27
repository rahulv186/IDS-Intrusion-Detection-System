import ssl
import time
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 8883

# Intentionally invalid credentials
USERNAME = "invalid_user"
PASSWORD = "wrong_password"

ATTEMPTS = 20
DELAY = 0.5


def simulate_auth_fail():
    client = mqtt.Client(
        client_id="bruteforcer"
    )

    client.tls_set(cert_reqs=ssl.CERT_NONE)

    client.username_pw_set(
        USERNAME,
        PASSWORD
    )
    for i in range(ATTEMPTS):



        try:
            print(f"[ATTEMPT {i+1}]")

            client.connect(
                BROKER,
                PORT,
                60
            )

            client.loop_start()

            time.sleep(0.1)

            client.loop_stop()

        except Exception as e:
            print("[EXPECTED FAIL]", e)

        finally:
            try:
                client.disconnect()
            except:
                pass


simulate_auth_fail()