import subprocess
import signal
import sys
import pathlib


broker = None
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent.parent

def start_broker():
    global broker

    broker = subprocess.Popen(
        [
            "mosquitto",
            "-c",
            f"{BASE_DIR}/Certs/mosquitto.conf",
            "-v"
        ],
        stdout=sys.stdout,
        stderr=sys.stderr,
        text=True
    )

    print("Broker started")


def stop_broker():
    global broker

    if broker and broker.poll() is None:
        print("\nStopping broker...")
        broker.terminate()
        broker.wait()
        print("Broker stopped")


def cleanup(sig=None, frame=None):
    stop_broker()
    sys.exit(0)


signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)


try:
    start_broker()

    while True:
        pass

finally:
    stop_broker()