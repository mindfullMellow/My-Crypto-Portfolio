from flask import Flask, jsonify
from flask_cors import CORS
import requests
import time
import hashlib
import hmac
import os
import json
from dotenv import load_dotenv
import logging
import urllib.parse
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Set up logging to show only WARNING and ERROR messages
logging.basicConfig(level=logging.WARNING, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load .env variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})  # Allow Vite frontend origin

# Get API keys and proxy from environment
binance_api_key = os.getenv("BINANCE_API_KEY")
binance_secret_key = os.getenv("BINANCE_SECRET_KEY")
PROXY_URL = os.getenv("PROXY_URL")

# Validate environment variables
if not all([binance_api_key, binance_secret_key, PROXY_URL]):
    logger.error("Missing environment variables: Ensure BINANCE_API_KEY, BINANCE_SECRET_KEY, and PROXY_URL are set in .env")
    raise ValueError("Missing required environment variables")

# Set up proxy
proxies = {
    "http": PROXY_URL,
    "https": PROXY_URL,
}

# Set up retry strategy for handling 429 errors
retry_strategy = Retry(
    total=3,
    backoff_factor=2,
    status_forcelist=[429],
    allowed_methods=["GET"]
)
adapter = HTTPAdapter(max_retries=retry_strategy)
http = requests.Session()
http.mount("https://", adapter)

# Cache for server time
server_time_cache = {"time": None, "last_updated": 0, "offset": 0}
CACHE_DURATION = 5  # Cache server time for 5 seconds

# Get Binance server time with caching and fallback URL
def get_server_time():
    global server_time_cache
    current_time = time.time()
    
    if server_time_cache["time"] and (current_time - server_time_cache["last_updated"]) < 10:
        logger.debug(f"Using cached server time: {server_time_cache['time']}")
        return server_time_cache["time"]
    
    base_urls = ["https://api.binance.com", "https://api-gcp.binance.com"]
    retry_strategy = Retry(total=5, backoff_factor=1, status_forcelist=[429], allowed_methods=["GET"])
    adapter = HTTPAdapter(max_retries=retry_strategy)
    http_temp = requests.Session()
    http_temp.mount("https://", adapter)
    
    for base_url in base_urls:
        try:
            response = http_temp.get(f"{base_url}/api/v3/time", proxies=proxies, timeout=3)
            response.raise_for_status()
            server_time = response.json().get("serverTime")
            local_time = int(time.time() * 1000)
            time_diff = server_time - local_time
            logger.debug(f"Binance server time: {server_time}, Local time: {local_time}, Difference: {time_diff}ms")
            if abs(time_diff) > 5000:
                logger.warning(f"Large time difference ({time_diff}ms) between local and Binance server time. Sync your PC clock.")
            server_time_cache["time"] = server_time
            server_time_cache["last_updated"] = current_time
            server_time_cache["offset"] = time_diff
            return server_time
        except Exception as e:
            logger.error(f"Failed to get server time from {base_url}: {str(e)}")
            continue
    
    logger.error("All server time requests failed, using local time with offset")
    return int(time.time() * 1000) + server_time_cache["offset"]

# Get current time in milliseconds, synced with Binance server
def get_timestamp():
    return get_server_time()

# Sign the query string with your secret key
def sign(query_string):
    return hmac.new(
        binance_secret_key.encode('utf-8'),
        query_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

# Make authenticated request to Binance with fallback URL
def make_request(base_url, endpoint, params, use_proxy=True):
    timestamp = get_timestamp()
    params['timestamp'] = timestamp
    params['recvWindow'] = 15000
    query_string = '&'.join([f"{k}={urllib.parse.quote(str(v))}" for k, v in sorted(params.items())])
    logger.debug(f"Generated query string: {query_string}")
    signature = sign(query_string)
    query_string += f"&signature={signature}"
    
    base_urls = [base_url, "https://api-gcp.binance.com" if base_url == "https://api.binance.com" else "https://api.binance.com"]
    
    for url in base_urls:
        full_url = f"{url}{endpoint}?{query_string}"
        logger.debug(f"Making request to: {full_url}")
        try:
            request_proxies = proxies if use_proxy else None
            response = http.get(full_url, headers={"X-MBX-APIKEY": binance_api_key}, proxies=request_proxies, timeout=10)
            response.raise_for_status()
            data = response.json()
            logger.debug(f"Response from {endpoint}: {data}")
            if 'code' in data and 'msg' in data:
                logger.error(f"Binance API error: {data['msg']} (Code: {data['code']})")
                return {"error": f"Binance API error: {data['msg']} (Code: {data['code']})"}
            return data
        except requests.exceptions.HTTPError as e:
            try:
                error_data = response.json()
                logger.error(f"HTTP error from {url}: {str(e)} - Binance response: {error_data}")
                return {"error": f"HTTP error: {str(e)} - Binance response: {error_data}"}
            except ValueError:
                logger.error(f"HTTP error from {url}: {str(e)} - No JSON response")
                return {"error": f"HTTP error: {str(e)} - No JSON response"}
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed from {url}: {str(e)}")
            if use_proxy and "429" in str(e):
                logger.warning(f"Proxy returned 429 Too Many Requests for {url}, retrying without proxy")
                return make_request(url, endpoint, params, use_proxy=False)
            continue
    
    logger.error(f"All requests to {endpoint} failed")
    return {"error": f"All requests to {endpoint} failed"}

# Keep only coins with value > 0
def filter_non_zero_assets(data, path_keys, amount_keys):
    filtered = {}
    try:
        if "error" in data:
            logger.warning(f"Skipping filter due to error in data: {data['error']}")
            return filtered
        entries = data
        for key in path_keys:
            entries = entries.get(key, [])
            if not entries:
                logger.warning(f"No data found for key: {key}")
                return filtered
        for entry in entries:
            asset = entry.get("asset") or entry.get("symbol")
            if not asset:
                logger.warning(f"No asset/symbol found in entry: {entry}")
                continue
            for amount_key in amount_keys:
                try:
                    amount = float(entry.get(amount_key, 0))
                    if amount > 0:
                        filtered[asset] = amount
                        logger.debug(f"Found non-zero asset: {asset} with {amount_key} = {amount}")
                        break
                except (ValueError, TypeError):
                    logger.warning(f"Invalid amount for {amount_key} in entry: {entry}")
                    continue
    except Exception as e:
        logger.error(f"Error in filter_non_zero_assets: {str(e)}")
    return filtered

# Fetch trade history for assets with non-zero USD value
def fetch_trade_history(assets, prices, base_url, futures_base):
    trades = {}
    trade_file = "trades.json"
    
    try:
        if os.path.exists(trade_file):
            with open(trade_file, 'r') as f:
                trades = json.load(f)
        
        current_time = get_timestamp()
        valid_assets = [asset for asset, price in prices.items() if price["price"] > 0]
        
        for asset in valid_assets:
            if asset == "USDT":
                continue
            symbol = f"{asset}USDT"
            trade_data = trades.get(asset, {"total_qty": 0.0, "total_cost_usd": 0.0, "last_updated": 0})
            last_updated = trade_data["last_updated"]
            
            if last_updated > 0 and (current_time - last_updated) < 3600 * 1000:
                continue
            
            for endpoint, account_type in [
                ("/api/v3/myTrades", "spot"),
                ("/sapi/v1/margin/myTrades", "margin"),
                ("/fapi/v1/userTrades", "futures")
            ]:
                params = {"symbol": symbol, "limit": 500}
                if last_updated > 0:
                    params["fromId"] = trade_data.get(f"{account_type}_last_trade_id", 0)
                base = futures_base if account_type == "futures" else base_url
                
                response = make_request(base, endpoint, params)
                if "error" in response:
                    logger.warning(f"Failed to fetch {account_type} trades for {symbol}: {response['error']}")
                    continue
                
                total_qty = trade_data["total_qty"]
                total_cost_usd = trade_data["total_cost_usd"]
                last_trade_id = trade_data.get(f"{account_type}_last_trade_id", 0)
                
                for trade in response:
                    if trade.get("isBuyer"):
                        try:
                            qty = float(trade["qty"])
                            price = float(trade["price"])
                            total_qty += qty
                            total_cost_usd += qty * price
                            last_trade_id = max(last_trade_id, int(trade["id"]))
                        except (ValueError, KeyError) as e:
                            logger.warning(f"Invalid trade data for {symbol} in {account_type}: {str(e)}")
                            continue
                
                trade_data["total_qty"] = total_qty
                trade_data["total_cost_usd"] = total_cost_usd
                trade_data[f"{account_type}_last_trade_id"] = last_trade_id
            
            trade_data["last_updated"] = current_time
            trades[asset] = trade_data
        
        with open(trade_file, 'w') as f:
            json.dump(trades, f, indent=2)
        
        return trades
    except Exception as e:
        logger.error(f"Failed to fetch trade history: {str(e)}")
        return trades

# Fetch current market prices and 24-hour price change for assets
def get_market_prices(assets):
    prices = {}
    try:
        base_urls = ["https://api.binance.com", "https://api-gcp.binance.com"]
        for base_url in base_urls:
            try:
                response = http.get(f"{base_url}/api/v3/ticker/24hr", proxies=proxies, timeout=10)
                response.raise_for_status()
                price_data = response.json()
                for asset in assets:
                    symbol = f"{asset}USDT"
                    for item in price_data:
                        if item["symbol"] == symbol:
                            prices[asset] = {
                                "price": float(item["lastPrice"]),
                                "change_24h": float(item["priceChangePercent"])
                            }
                            break
                    else:
                        prices[asset] = {"price": 0.0, "change_24h": 0.0}
                        logger.warning(f"No USDT trading pair found for {asset}")
                if "USDT" in assets and prices["USDT"]["price"] == 0.0:
                    prices["USDT"] = {"price": 1.0, "change_24h": 0.0}
                return prices
            except Exception as e:
                logger.error(f"Failed to fetch market prices from {base_url}: {str(e)}")
                continue
        logger.error("All market price requests failed")
        return {asset: {"price": 0.0, "change_24h": 0.0} for asset in assets}
    except Exception as e:
        logger.error(f"Failed to fetch market prices: {str(e)}")
        return {asset: {"price": 0.0, "change_24h": 0.0} for asset in assets}

# Aggregate assets across accounts and include USD values, 24h change, and P&L
def aggregate_assets(spot, margin, futures):
    aggregated = {}
    
    for asset, amount in spot.items():
        normalized_asset = asset[2:] if asset.startswith("LD") else asset
        aggregated[normalized_asset] = aggregated.get(normalized_asset, 0) + amount
    
    for asset, amount in margin.items():
        aggregated[asset] = aggregated.get(asset, 0) + amount
    
    for asset, amount in futures.items():
        aggregated[asset] = aggregated.get(asset, 0) + amount
    
    prices = get_market_prices(aggregated.keys())
    trades = fetch_trade_history(aggregated.keys(), prices, "https://api.binance.com", "https://fapi.binance.com")
    
    # Load previous portfolio value
    portfolio_file = "portfolio.json"
    previous_total = 0.0
    try:
        if os.path.exists(portfolio_file):
            with open(portfolio_file, 'r') as f:
                previous_data = json.load(f)
                previous_total = previous_data.get("total_usd_value", 0.0)
    except Exception as e:
        logger.warning(f"Failed to load previous portfolio value: {str(e)}")
    
    # Calculate current total USD value
    assets = {}
    for asset, amount in aggregated.items():
        usd_value = round(amount * prices.get(asset, {"price": 0.0})["price"], 8)
        change_24h = prices.get(asset, {"change_24h": 0.0})["change_24h"]
        trade_data = trades.get(asset, {"total_qty": 0.0, "total_cost_usd": 0.0})
        profit_loss_usd = round(usd_value - trade_data["total_cost_usd"], 8) if trade_data["total_qty"] > 0 else 0.0
        assets[asset] = {
            "amount": round(amount, 8),
            "usd_value": usd_value,
            "price_change_24h": round(change_24h, 2),
            "profit_loss_usd": profit_loss_usd
        }
    
    total_usd_value = round(sum(item["usd_value"] for item in assets.values()), 8)
    
    # Calculate portfolio-level P&L
    pnl = {"24hr_change": 0.0, "value": 0.0}
    if previous_total > 0:
        pnl["value"] = round(total_usd_value - previous_total, 8)
        pnl["24hr_change"] = round((pnl["value"] / previous_total) * 100, 2) if previous_total > 0 else 0.0
    
    # Save current total_usd_value
    try:
        with open(portfolio_file, 'w') as f:
            json.dump({"total_usd_value": total_usd_value, "last_updated": get_timestamp()}, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save portfolio value: {str(e)}")
    
    sorted_assets = dict(sorted(assets.items(), key=lambda x: x[1]["usd_value"], reverse=True))
    
    return {
        "total_usd_value": total_usd_value,
        "pnl": pnl,
        "assets": sorted_assets
    }

# Original endpoint
@app.route('/binance-data')
def binance_data():
    base = "https://api.binance.com"
    futures_base = "https://fapi.binance.com"

    spot = make_request(base, "/api/v3/account", {})
    clean_spot = filter_non_zero_assets(spot, ["balances"], ["free", "locked"])

    margin = make_request(base, "/sapi/v1/margin/account", {})
    clean_margin = filter_non_zero_assets(margin, ["userAssets"], ["free", "locked", "borrowed"])

    futures = make_request(futures_base, "/fapi/v2/account", {})
    clean_futures = filter_non_zero_assets(futures, ["assets"], ["walletBalance", "availableBalance"])

    response = {
        "spot": clean_spot,
        "margin": clean_margin,
        "futures": clean_futures
    }
    logger.info(f"Returning response: {response}")
    return jsonify(response)

# Endpoint for aggregated asset totals with USD values, 24h change, and P&L
@app.route('/binance-calc')
def binance_calc():
    base = "https://api.binance.com"
    futures_base = "https://fapi.binance.com"

    spot = make_request(base, "/api/v3/account", {})
    clean_spot = filter_non_zero_assets(spot, ["balances"], ["free", "locked"])

    margin = make_request(base, "/sapi/v1/margin/account", {})
    clean_margin = filter_non_zero_assets(margin, ["userAssets"], ["free", "locked", "borrowed"])

    futures = make_request(futures_base, "/fapi/v2/account", {})
    clean_futures = filter_non_zero_assets(futures, ["assets"], ["walletBalance", "availableBalance"])

    aggregated = aggregate_assets(clean_spot, clean_margin, clean_futures)

    logger.info(f"Returning aggregated response: {aggregated}")
    return jsonify(aggregated)

# Serve index.html
@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True)