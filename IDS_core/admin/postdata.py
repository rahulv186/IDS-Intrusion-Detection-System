# post_data.py
import requests

# Base URL of your backend API
BASE_URL = "http://localhost:5050"  # Change to your server URL

def post_data(data, data_type):
    print(data)
    # Map data types to API endpoints
    endpoints = {
        "monitor_log": "/api/monitor",
        "device_status": "/api/device",
        "alert": "/api/threats"
    }

    if data_type not in endpoints:
        raise ValueError(f"Unknown data_type '{data_type}'")

    url = BASE_URL + endpoints[data_type]

    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print(f"[SUCCESS] Data posted to {url}")
        return response
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to post data to {url}: {e}")
        return None
