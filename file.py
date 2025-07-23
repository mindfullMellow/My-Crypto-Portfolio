from flask import Flask, jsonify
import requests
import time
import hashlib
import hmac
import os
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
    backoff_factor=1,
    status_forcelist=[429],
    allowed_methods=["GET"]
)
adapter = HTTPAdapter(max_retries=retry_strategy)
http = requests.Session()
http.mount("https://", adapter)

# Get Binance server time to sync timestamp
def get_server_time():
    try:
        response = http.get("https://api.binance.com/api/v3/time", proxies=proxies, timeout=5)
        response.raise_for_status()
        server_time = response.json().get("serverTime")
        local_time = int(time.time() * 1000)
        time_diff = abs(server_time - local_time)
        logger.debug(f"Binance server time: {server_time}, Local time: {local_time}, Difference: {time_diff}ms")
        if time_diff > 5000:
            logger.warning(f"Large time difference ({time_diff}ms) between local and Binance server time. Sync your PC clock.")
        return server_time
    except Exception as e:
        logger.error(f"Failed to get server time: {str(e)}")
        return int(time.time() * 1000)  # Fallback to local time

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

# Make authenticated request to Binance
def make_request(base_url, endpoint, params, use_proxy=True):
    timestamp = get_timestamp()
    params['timestamp'] = timestamp
    params['recvWindow'] = 15000  # Increased to 15 seconds
    # URL-encode each parameter value and ensure correct separator
    query_string = '&'.join([f"{k}={urllib.parse.quote(str(v))}" for k, v in sorted(params.items())])
    logger.debug(f"Generated query string: {query_string}")
    signature = sign(query_string)
    query_string += f"&signature={signature}"
    url = f"{base_url}{endpoint}?{query_string}"

    logger.debug(f"Making request to: {url}")
    try:
        request_proxies = proxies if use_proxy else None
        response = http.get(url, headers={"X-MBX-APIKEY": binance_api_key}, proxies=request_proxies, timeout=10)
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
            logger.error(f"HTTP error: {str(e)} - Binance response: {error_data}")
            return {"error": f"HTTP error: {str(e)} - Binance response: {error_data}"}
        except ValueError:
            logger.error(f"HTTP error: {str(e)} - No JSON response")
            return {"error": f"HTTP error: {str(e)} - No JSON response"}
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        if use_proxy and "429" in str(e):
            logger.warning("Proxy returned 429 Too Many Requests, retrying without proxy")
            return make_request(base_url, endpoint, params, use_proxy=False)
        return {"error": f"Request failed: {str(e)}"}

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

# Aggregate assets across accounts and normalize names
def aggregate_assets(spot, margin, futures):
    aggregated = {}
    
    # Normalize and aggregate Spot assets (remove 'LD' prefix)
    for asset, amount in spot.items():
        normalized_asset = asset[2:] if asset.startswith("LD") else asset
        aggregated[normalized_asset] = aggregated.get(normalized_asset, 0) + amount
    
    # Aggregate Margin assets
    for asset, amount in margin.items():
        aggregated[asset] = aggregated.get(asset, 0) + amount
    
    # Aggregate Futures assets
    for asset, amount in futures.items():
        aggregated[asset] = aggregated.get(asset, 0) + amount
    
    # Round amounts to 8 decimal places for cleanliness
    return {asset: round(amount, 8) for asset, amount in aggregated.items()}

# Original endpoint
@app.route('/binance-data')
def binance_data():
    base = "https://api.binance.com"
    futures_base = "https://fapi.binance.com"

    # SPOT
    spot = make_request(base, "/api/v3/account", {})
    clean_spot = filter_non_zero_assets(spot, ["balances"], ["free", "locked"])

    # MARGIN
    margin = make_request(base, "/sapi/v1/margin/account", {})
    clean_margin = filter_non_zero_assets(margin, ["userAssets"], ["free", "locked", "borrowed"])

    # FUTURES
    futures = make_request(futures_base, "/fapi/v2/account", {})
    clean_futures = filter_non_zero_assets(futures, ["assets"], ["walletBalance", "availableBalance"])

    response = {
        "spot": clean_spot,
        "margin": clean_margin,
        "futures": clean_futures
    }
    logger.info(f"Returning response: {response}")
    return jsonify(response)

# New endpoint for aggregated asset totals
@app.route('/binance-calc')
def binance_calc():
    base = "https://api.binance.com"
    futures_base = "https://fapi.binance.com"

    # Fetch data (same as /binance-data)
    spot = make_request(base, "/api/v3/account", {})
    clean_spot = filter_non_zero_assets(spot, ["balances"], ["free", "locked"])

    margin = make_request(base, "/sapi/v1/margin/account", {})
    clean_margin = filter_non_zero_assets(margin, ["userAssets"], ["free", "locked", "borrowed"])

    futures = make_request(futures_base, "/fapi/v2/account", {})
    clean_futures = filter_non_zero_assets(futures, ["assets"], ["walletBalance", "availableBalance"])

    # Aggregate and normalize assets
    aggregated = aggregate_assets(clean_spot, clean_margin, clean_futures)

    logger.info(f"Returning aggregated response: {aggregated}")
    return jsonify(aggregated)

if __name__ == '__main__':
    app.run(debug=True)