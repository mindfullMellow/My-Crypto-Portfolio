

from flask import Flask, jsonify
from flask_cors import CORS
import time
import hmac
import hashlib
import requests
from dotenv import load_dotenv
import os

load_dotenv()  # Load .env file

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

api_key = os.getenv("API_KEY")
secret_key = os.getenv("SECRET_KEY")
proxy_url = os.getenv("PROXY_URL")

proxies = {
    "http": proxy_url,
    "https": proxy_url
}

def sign(query_string):
    return hmac.new(secret_key.encode(), query_string.encode(), hashlib.sha256).hexdigest()

def get_spot_portfolio():
    timestamp = int(time.time() * 1000)
    query_string = f"timestamp={timestamp}"
    signature = sign(query_string)
    url = f"https://api.binance.com/api/v3/account?{query_string}&signature={signature}"
    headers = {"X-MBX-APIKEY": api_key}

    resp = requests.get(url, headers=headers, proxies=proxies)
    data = resp.json()
    if resp.status_code != 200:
        return {"error": data}

    assets = []
    for asset in data.get("balances", []):
        total = float(asset["free"]) + float(asset["locked"])
        if total > 0:
            name = asset["asset"].replace("LD", "")
            assets.append({"asset": name, "total": total})
    return assets

def get_futures_portfolio():
    timestamp = int(time.time() * 1000)
    query_string = f"timestamp={timestamp}"
    signature = sign(query_string)
    url = f"https://fapi.binance.com/fapi/v2/account?{query_string}&signature={signature}"
    headers = {"X-MBX-APIKEY": api_key}

    resp = requests.get(url, headers=headers, proxies=proxies)
    data = resp.json()
    if resp.status_code != 200:
        return {"error": data}

    assets = []
    for asset in data.get("assets", []):
        total = float(asset.get("walletBalance", 0))
        if total > 0:
            name = asset["asset"].replace("LD", "")
            assets.append({"asset": name, "total": total})
    return assets

def get_open_futures_orders():
    timestamp = int(time.time() * 1000)
    query_string = f"timestamp={timestamp}"
    signature = sign(query_string)
    url = f"https://fapi.binance.com/fapi/v1/openOrders?{query_string}&signature={signature}"
    headers = {"X-MBX-APIKEY": api_key}

    resp = requests.get(url, headers=headers, proxies=proxies)
    data = resp.json()
    if resp.status_code != 200:
        return {"error": data}
    return data

@app.route("/full-portfolio")
def full_portfolio():
    spot = get_spot_portfolio()
    futures = get_futures_portfolio()
    open_orders = get_open_futures_orders()

    return jsonify({
        "spot": spot,
        "futures": futures,
        "open_futures_orders": open_orders
    })

if __name__ == "__main__":
    app.run(debug=True)


