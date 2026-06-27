import subprocess
import signal
import sys
import time
import pathlib


BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
processes = []

SCRIPTS = [
    "/iot_device/temp_sensor.py",
    "/iot_device/motion_sensor.py",
    "/iot_device/device_simulator.py",
    "/iot_device/air_quality_sensor.py"
]


def start_devices():
    print("\nStarting devices...\n")

    for script in SCRIPTS:

        p = subprocess.Popen(
            ["python3", str(BASE_DIR)+script]
        )

        processes.append(p)

        print(
            f"Started {script} "
            f"(PID={p.pid})"
        )


def stop_devices():
    print("\nStopping devices...\n")

    for p in processes:

        if p.poll() is None:

            try:
                p.terminate()

                p.wait(timeout=3)

            except:

                p.kill()

            print(
                f"Stopped PID={p.pid}"
            )


def shutdown(sig, frame):

    stop_devices()

    sys.exit(0)


signal.signal(
    signal.SIGINT,
    shutdown
)

signal.signal(
    signal.SIGTERM,
    shutdown
)


start_devices()

print("\nPress CTRL+C to stop all\n")

while True:
    time.sleep(1)