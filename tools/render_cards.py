#!/usr/bin/env python3
"""
T-038: Render card images via Replicate API (flux-1.1-pro).

Reads data/card_prompts.json, sends prompts to Replicate,
saves results as webp in cards/ directory.

Usage:
    export REPLICATE_API_TOKEN=r8_...
    python tools/render_cards.py                  # render all
    python tools/render_cards.py --limit 5        # test first 5
    python tools/render_cards.py --skip-existing   # skip already rendered
    python tools/render_cards.py --model schnell  # use cheaper model
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")
CARDS_DIR = os.path.join(BASE, "cards")

MODEL_VERSIONS = {
    "pro": "black-forest-labs/flux-1.1-pro",
    "schnell": "black-forest-labs/flux-schnell",
    "pro-ultra": "black-forest-labs/flux-1.1-pro-ultra",
}

API_BASE = "https://api.replicate.com/v1"


def get_token():
    token = os.environ.get("REPLICATE_API_TOKEN", "")
    if not token:
        print("ERROR: Set REPLICATE_API_TOKEN environment variable")
        sys.exit(1)
    return token


def api_request(path, data=None, token=""):
    url = f"{API_BASE}{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        print(f"  API error {e.code}: {error_body[:200]}")
        return None


def create_prediction(prompt, model_key, token, aspect_ratio="3:4", sync=True):
    model = MODEL_VERSIONS.get(model_key, MODEL_VERSIONS["pro"])
    input_data = {
        "prompt": prompt,
        "aspect_ratio": aspect_ratio,
    }
    if model_key == "schnell":
        input_data["num_outputs"] = 1

    data = {
        "input": input_data,
    }
    path = f"/models/{model}/predictions"
    url = f"{API_BASE}{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    if sync:
        headers["Prefer"] = "wait"
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        if e.code == 429:
            retry_after = 10
            print(f"rate-limited, waiting {retry_after}s...", end=" ", flush=True)
            time.sleep(retry_after)
            return create_prediction(prompt, model_key, token, aspect_ratio, sync)
        print(f"  API error {e.code}: {error_body[:200]}")
        return None


def wait_for_prediction(pred_id, token, max_wait=300):
    path = f"/predictions/{pred_id}"
    start = time.time()
    while time.time() - start < max_wait:
        result = api_request(path, token=token)
        if not result:
            return None
        status = result.get("status", "")
        if status == "succeeded":
            return result
        if status in ("failed", "canceled"):
            print(f"  Prediction {status}: {result.get('error', '')[:200]}")
            return None
        time.sleep(2)
    print(f"  Timeout waiting for prediction {pred_id}")
    return None


def download_image(url, filepath):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    with open(filepath, "wb") as f:
        f.write(data)
    return len(data)


def render_all(args):
    token = get_token()
    model_key = args.model

    with open(os.path.join(DATA, "card_prompts.json"), "r", encoding="utf-8") as f:
        prompts = json.load(f)

    os.makedirs(CARDS_DIR, exist_ok=True)

    if args.limit:
        prompts = prompts[: args.limit]

    total = len(prompts)
    done = 0
    skipped = 0
    failed = 0
    total_cost = 0.0
    cost_per_image = {"pro": 0.025, "schnell": 0.003, "pro-ultra": 0.06}
    unit_cost = cost_per_image.get(model_key, 0.025)

    print(f"Rendering {total} cards with {MODEL_VERSIONS.get(model_key, model_key)}")
    print(f"Estimated cost: ${total * unit_cost:.2f}")
    print(f"Output: {CARDS_DIR}/")
    print()

    for i, card in enumerate(prompts):
        card_id = card["card_id"]
        filepath = os.path.join(CARDS_DIR, f"{card_id}.webp")

        if args.skip_existing and os.path.exists(filepath):
            skipped += 1
            continue

        print(f"[{i + 1}/{total}] {card_id}...", end=" ", flush=True)

        result = create_prediction(card["prompt"], model_key, token, sync=True)
        if not result:
            failed += 1
            print("FAILED (create)")
            if failed > 10:
                print("Too many failures, stopping.")
                break
            continue

        status = result.get("status", "")
        if status != "succeeded":
            pred_id = result.get("id", "")
            if pred_id:
                result = wait_for_prediction(pred_id, token)
            if not result:
                failed += 1
                print("FAILED (wait)")
                continue

        output = result.get("output")
        if not output:
            failed += 1
            print("FAILED (no output)")
            continue

        img_url = output if isinstance(output, str) else output[0]

        try:
            size = download_image(img_url, filepath)
            done += 1
            total_cost += unit_cost
            print(f"OK ({size // 1024}KB, ${total_cost:.2f} spent)")
        except Exception as e:
            failed += 1
            print(f"FAILED (download: {e})")

        if args.budget and total_cost >= args.budget:
            print(f"\nBudget limit ${args.budget:.2f} reached. Stopping.")
            break

    print(f"\nDone: {done} rendered, {skipped} skipped, {failed} failed")
    print(f"Total cost: ~${total_cost:.2f}")


def main():
    parser = argparse.ArgumentParser(description="Render AWARA card images")
    parser.add_argument("--limit", type=int, help="Render only first N cards")
    parser.add_argument(
        "--skip-existing", action="store_true", help="Skip already rendered"
    )
    parser.add_argument(
        "--model",
        default="pro",
        choices=["pro", "schnell", "pro-ultra"],
        help="Flux model variant (default: pro)",
    )
    parser.add_argument(
        "--budget", type=float, default=15.0, help="Max budget in USD (default: 15)"
    )
    args = parser.parse_args()
    render_all(args)


if __name__ == "__main__":
    main()
