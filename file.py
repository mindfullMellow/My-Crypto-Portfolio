from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import hmac
import hashlib
import requests
from dotenv import load_dotenv
import os
import logging
from datetime import datetime, timedelta

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

binance_api_key = os.getenv("BINANCE_API_KEY")
binance_secret_key = os.getenv("BINANCE_SECRET_KEY")
proxy_url = os.getenv("PROXY_URL")

# Configure proxies only if proxy_url exists
proxies = None
if proxy_url:
    proxies = {
        "http": proxy_url,
        "https": proxy_url
    }

# Simple cache implementation
API_CACHE = {}
CACHE_DURATION = 30  # seconds

def sign(query_string):
    return hmac.new(binance_secret_key.encode(), query_string.encode(), hashlib.sha256).hexdigest()

def cached_api_call(cache_key, api_func, force_refresh=False):
    """Cache API responses with option to force refresh"""
    now = datetime.now()
    
    # Check if we should bypass cache
    if force_refresh:
        # Make fresh API call and update cache
        response = api_func()
        API_CACHE[cache_key] = (now, response)
        return response
        
    # Check if valid cache exists
    if cache_key in API_CACHE:
        cached_time, response = API_CACHE[cache_key]
        if now - cached_time < timedelta(seconds=CACHE_DURATION):
            return response
    
    # Make fresh API call and cache it
    response = api_func()
    API_CACHE[cache_key] = (now, response)
    return response

def make_binance_request(url, params=None):
    """Centralized request handling with error logging"""
    try:
        headers = {"X-MBX-APIKEY": binance_api_key}
        response = requests.get(
            url,
            headers=headers,
            params=params,
            proxies=proxies,
            timeout=10
        )
        
        if response.status_code != 200:
            logger.error(
                f"Binance API error ({url}): "
                f"{response.status_code} - {response.text}"
            )
            return None
        
        return response.json()
    
    except requests.exceptions.RequestException as e:
        logger.exception(f"Request failed: {str(e)}")
    except ValueError as e:
        logger.exception(f"JSON decode error: {str(e)}")
    
    return None

def get_spot_acct():
    timestamp = int(time.time() * 1000)
    recv_window = 60000
    query_string = f"recvWindow={recv_window}&timestamp={timestamp}"
    signature = sign(query_string)
    url = f"https://api.binance.com/api/v3/account?{query_string}&signature={signature}"
    
    data = make_binance_request(url)
    if not data:
        return {}
    
    result = {}
    for asset in data.get("balances", []):
        # Only include assets with non-zero balance (free or locked)
        free = float(asset["free"])
        locked = float(asset["locked"])
        if free > 0 or locked > 0:
            # Combine free and locked for each token
            result[asset["asset"]] = {
                "free": free,
                "locked": locked,
                "total": free + locked
            }
    return result

def get_future_acct():
    timestamp = int(time.time() * 1000)
    recv_window = 60000
    query_string = f"recvWindow={recv_window}&timestamp={timestamp}"
    signature = sign(query_string)
    url = f"https://fapi.binance.com/fapi/v2/account?{query_string}&signature={signature}"
    
    data = make_binance_request(url)
    if not data:
        return {"acct-balance": 0, "assets": {}}
    
    assets = {}
    for asset in data.get("assets", []):
        balance = float(asset.get("walletBalance", 0))
        if balance != 0:
            assets[asset["asset"]] = {
                "wallet_balance": balance,
                "cross_wallet_balance": float(asset.get("crossWalletBalance", 0)),
                "available_balance": float(asset.get("availableBalance", 0))
            }
    
    return {
        "acct-balance": float(data.get("totalMarginBalance", 0)),
        "assets": assets
    }

def get_spot_orders():
    timestamp = int(time.time() * 1000)
    recv_window = 60000
    params = {
        "recvWindow": recv_window,
        "timestamp": timestamp,
        "signature": sign(f"recvWindow={recv_window}&timestamp={timestamp}")
    }
    url = "https://api.binance.com/api/v3/openOrders"
    
    data = make_binance_request(url, params=params)
    return data if data else []

def get_margin_acct():
    timestamp = int(time.time() * 1000)
    recv_window = 60000
    query_string = f"recvWindow={recv_window}&timestamp={timestamp}"
    signature = sign(query_string)
    url = f"https://api.binance.com/sapi/v1/margin/account?{query_string}&signature={signature}"
    
    data = make_binance_request(url)
    if not data:
        return {"acct-balance": 0, "assets": {}}
    
    assets = {}
    for asset in data.get("userAssets", []):
        net_asset = float(asset.get("netAsset", 0))
        if net_asset != 0:
            assets[asset["asset"]] = {
                "free": float(asset.get("free", 0)),
                "locked": float(asset.get("locked", 0)),
                "borrowed": float(asset.get("borrowed", 0)),
                "interest": float(asset.get("interest", 0)),
                "net_asset": net_asset
            }
    
    return {
        "acct-balance": float(data.get("totalNetAssetOfBtc", 0)),
        "assets": assets
    }

@app.route("/binance-data")
def binance_data():
    # Check if we should force refresh the cache
    force_refresh = request.args.get('refresh') == 'true'
    
    # Use caching for all API calls with refresh option
    return jsonify({
        "Binance": {
            "spot-acct": cached_api_call("spot_acct", get_spot_acct, force_refresh),
            "future-acct": cached_api_call("future_acct", get_future_acct, force_refresh),
            "margin-acct": cached_api_call("margin_acct", get_margin_acct, force_refresh),
            "spot-order": cached_api_call("spot_orders", get_spot_orders, force_refresh)
        }
    })

if __name__ == "__main__":
    # Disable debug mode in production
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode, host="0.0.0.0", port=5000)
    

    # we have two url
    # http://localhost:5000/binance-data?refresh=true (to get the most recent data and not the cahched one)
    # http://localhost:5000/binance-data (to get the cached data)