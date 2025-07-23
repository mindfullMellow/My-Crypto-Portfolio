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
    
    # Consolidate LD* tokens with their base assets
    consolidated = {}
    for asset in data.get("balances", []):
        free = float(asset["free"])
        locked = float(asset["locked"])
        total = free + locked
        
        if total <= 0:
            continue
            
        asset_name = asset["asset"]
        
        # Handle locked tokens (LD prefix)
        if asset_name.startswith("LD"):
            base_asset = asset_name[2:]  # Remove 'LD' prefix
            if base_asset not in consolidated:
                consolidated[base_asset] = {
                    "free": 0,
                    "locked": 0,
                    "total": 0
                }
            # Add LD tokens to locked balance
            consolidated[base_asset]["locked"] += total
            consolidated[base_asset]["total"] += total
        else:
            if asset_name not in consolidated:
                consolidated[asset_name] = {
                    "free": 0,
                    "locked": 0,
                    "total": 0
                }
            consolidated[asset_name]["free"] += free
            consolidated[asset_name]["locked"] += locked
            consolidated[asset_name]["total"] += total
    
    return consolidated

def get_future_acct():
    timestamp = int(time.time() * 1000)
    recv_window = 60000
    query_string = f"recvWindow={recv_window}&timestamp={timestamp}"
    signature = sign(query_string)
    url = f"https://fapi.binance.com/fapi/v2/account?{query_string}&signature={signature}"
    
    data = make_binance_request(url)
    if not data:
        return {
            "total_margin_balance": 0,
            "assets": {},
            "open_trades": "NO OPEN TRADE"
        }
    
    assets = {}
    for asset in data.get("assets", []):
        balance = float(asset.get("walletBalance", 0))
        if balance != 0:
            assets[asset["asset"]] = {
                "wallet_balance": balance,
                "cross_wallet_balance": float(asset.get("crossWalletBalance", 0)),
                "available_balance": float(asset.get("availableBalance", 0))
            }
    
    # Check for open positions
    open_trades = []
    for position in data.get("positions", []):
        position_amt = float(position.get("positionAmt", 0))
        if position_amt != 0:
            open_trades.append({
                "symbol": position["symbol"],
                "position_amt": position_amt,
                "entry_price": float(position.get("entryPrice", 0)),
                "leverage": int(position.get("leverage", 1)),
                "unrealized_profit": float(position.get("unRealizedProfit", 0)),
                "position_side": "LONG" if position_amt > 0 else "SHORT"
            })
    
    return {
        "total_margin_balance": float(data.get("totalMarginBalance", 0)),
        "assets": assets,
        "open_trades": open_trades if open_trades else "NO OPEN TRADE"
    }

def get_margin_acct():
    timestamp = int(time.time() * 1000)
    recv_window = 60000
    query_string = f"recvWindow={recv_window}&timestamp={timestamp}"
    signature = sign(query_string)
    url = f"https://api.binance.com/sapi/v1/margin/account?{query_string}&signature={signature}"
    
    data = make_binance_request(url)
    if not data:
        return {
            "total_net_asset_btc": 0,
            "total_net_asset_usdt": 0,
            "assets": {},
            "open_trades": "NO OPEN TRADE"
        }
    
    # Get current BTC price for conversion
    btc_price = 0
    btc_price_data = make_binance_request("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT")
    if btc_price_data:
        btc_price = float(btc_price_data.get("price", 0))
    
    assets = {}
    open_trades = []
    total_net_asset_btc = float(data.get("totalNetAssetOfBtc", 0))
    
    for asset in data.get("userAssets", []):
        net_asset = float(asset.get("netAsset", 0))
        borrowed = float(asset.get("borrowed", 0))
        interest = float(asset.get("interest", 0))
        
        if net_asset != 0:
            assets[asset["asset"]] = {
                "free": float(asset.get("free", 0)),
                "locked": float(asset.get("locked", 0)),
                "borrowed": borrowed,
                "interest": interest,
                "net_asset": net_asset
            }
        
        # Check for open loans (borrowed > 0)
        if borrowed > 0 or interest > 0:
            open_trades.append({
                "asset": asset["asset"],
                "borrowed": borrowed,
                "interest": interest
            })
    
    return {
        "total_net_asset_btc": total_net_asset_btc,
        "total_net_asset_usdt": total_net_asset_btc * btc_price if btc_price else 0,
        "assets": assets,
        "open_trades": open_trades if open_trades else "NO OPEN TRADE"
    }

@app.route("/binance-data")
def binance_data():
    # Check if we should force refresh the cache
    force_refresh = request.args.get('refresh') == 'true'
    
    # Use caching for all API calls with refresh option
    return jsonify({
        "Binance": {
            "spot_acct": cached_api_call("spot_acct", get_spot_acct, force_refresh),
            "future_acct": cached_api_call("future_acct", get_future_acct, force_refresh),
            "margin_acct": cached_api_call("margin_acct", get_margin_acct, force_refresh)
        }
    })

if __name__ == "__main__":
    # Disable debug mode in production
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode, host="0.0.0.0", port=5000)
    # we have two url
    # http://localhost:5000/binance-data?refresh=true (to get the most recent data and not the cahched one)
    # http://localhost:5000/binance-data (to get the cached data)