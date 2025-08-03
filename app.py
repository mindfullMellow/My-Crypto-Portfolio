import requests
import json
from datetime import datetime

def fetch_top_500_assets():
    assets = []
    seen = set()

    for page in [1, 2]:
        url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page={page}"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            for coin in data:
                symbol = coin["symbol"].upper()
                if symbol not in seen:
                    assets.append({
                        "name": coin["name"],
                        "symbol": symbol
                    })
                    seen.add(symbol)
        else:
            print(f"Failed to fetch page {page}")

    # Add timestamp
    result = {
        "last_updated": datetime.now().strftime("%A, %d %B %Y, %I:%M %p"),
        "assets": assets
    }

    # Save to JSON
    with open("top_500_assets.json", "w") as f:
        json.dump(result, f, indent=2)

    print(f"Saved {len(assets)} top assets with timestamp to top_500_assets.json")

# Run it
fetch_top_500_assets()
