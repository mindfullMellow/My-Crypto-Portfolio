from flask import Flask, jsonify
from flask_cors import CORS
import time
import hmac
import hashlib
import requests
from dotenv import load_dotenv
import os

load_dotenv()

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

def get_spot_acct():
    timestamp = int(time.time() * 1000)
    recv_window = 60000
    query_string = f"recvWindow={recv_window}&timestamp={timestamp}"
    signature = sign(query_string)
    url = f"https://api.binance.com/api/v3/account?{query_string}&signature={signature}"
    headers = {"X-MBX-APIKEY": api_key}

    resp = requests.get(url, headers=headers, proxies=proxies)
    data = resp.json()
    result = {}
    if resp.status_code != 200:
        return result

    for asset in data.get("balances", []):
        total = float(asset["free"]) + float(asset["locked"])
        if total > 0:
            result[asset["asset"]] = total
    return result

def get_future_acct():
    timestamp = int(time.time() * 1000)
    recv_window = 60000
    query_string = f"recvWindow={recv_window}&timestamp={timestamp}"
    signature = sign(query_string)
    url = f"https://fapi.binance.com/fapi/v2/account?{query_string}&signature={signature}"
    headers = {"X-MBX-APIKEY": api_key}

    resp = requests.get(url, headers=headers, proxies=proxies)
    data = resp.json()
    trade_details = []
    acct_balance = 0
    if resp.status_code != 200:
        return {"trade-details": trade_details, "acct-balance": acct_balance}

    for asset in data.get("assets", []):
        balance = float(asset.get("walletBalance", 0))
        if balance > 0:
            trade_details.append(asset)
            acct_balance += balance

    return {
        "trade-details": trade_details,
        "acct-balance": acct_balance
    }

def get_margin_acct():
    timestamp = int(time.time() * 1000)
    recv_window = 60000
    query_string = f"recvWindow={recv_window}&timestamp={timestamp}"
    signature = sign(query_string)
    url = f"https://api.binance.com/sapi/v1/margin/account?{query_string}&signature={signature}"
    headers = {"X-MBX-APIKEY": api_key}

    resp = requests.get(url, headers=headers, proxies=proxies)
    data = resp.json()
    trade_details = []
    acct_balance = 0
    if resp.status_code != 200:
        return {"trade-details": trade_details, "acct-balance": acct_balance}

    for asset in data.get("userAssets", []):
        total = float(asset.get("free", 0)) + float(asset.get("locked", 0))
        if total > 0:
            trade_details.append(asset)
            acct_balance += total

    return {
        "trade-details": trade_details,
        "acct-balance": acct_balance
    }

@app.route("/binance-data")
def binance_data():
    return jsonify({
        "Binance": {
            "spot-acct": get_spot_acct(),
            "future-acct": get_future_acct(),
            "margin-acct": get_margin_acct()
        }
    })

if __name__ == "__main__":
    app.run(debug=True)
