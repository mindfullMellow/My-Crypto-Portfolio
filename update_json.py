import requests
import json
from datetime import datetime
import os
import time

def fetch_top_500_assets():
    assets = []
    seen = set()

    for page in [1, 2]:
        url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page={page}"
        for attempt in range(3):  # Retry up to 3 times
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                for coin in data:
                    symbol = coin["symbol"].upper()
                    if symbol not in seen:
                        assets.append({
                            "name": coin["name"],
                            "symbol": symbol,
                            "price": coin["current_price"],
                            "market_cap": coin["market_cap"],
                            "change_24h": coin["price_change_percentage_24h"],
                            "image": coin["image"]
                        })
                        seen.add(symbol)
                break
            elif response.status_code == 429:  # Rate limit
                print(f"Rate limit hit on page {page}, attempt {attempt + 1}. Waiting 60 seconds...")
                time.sleep(60)
            else:
                print(f"Failed to fetch page {page}: {response.status_code}")
                break
        else:
            print(f"Failed to fetch page {page} after {attempt + 1} attempts")
            return

    # Add timestamp
    result = {
        "last_updated": datetime.now().strftime("%A, %d %B %Y, %I:%M %p"),
        "assets": assets
    }

    # Create public folder if not exists
    os.makedirs("public", exist_ok=True)

    # Save JSON to public folder
    with open("public/top_500_assets.json", "w") as f:
        json.dump(result, f, indent=2)

    print(f"Saved {len(assets)} assets to public/top_500_assets.json")

# Run it
fetch_top_500_assets()