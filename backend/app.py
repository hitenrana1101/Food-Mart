import os, json, uuid
from datetime import datetime
from flask import Flask, request, jsonify, make_response, send_from_directory
from werkzeug.utils import secure_filename

# Paths
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
NEW_ARRIVED_JSON = os.path.join(DATA_DIR, "new_arrived.json")
TRENDING_JSON = os.path.join(DATA_DIR, "trending.json")
BEST_SELLING_JSON = os.path.join(DATA_DIR, "best_selling.json")
POPULAR_JSON = os.path.join(DATA_DIR, "popular.json")
BLOGS_JSON = os.path.join(DATA_DIR, "blogs.json")  # NEW

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB

ALLOWED_EXTS = {"png", "jpg", "jpeg", "gif", "webp"}

def no_store(resp):
    resp.headers["Cache-Control"] = "no-store"
    return resp

# ---------- Helpers ----------
def load_json(path: str, default_title: str):
    if not os.path.exists(path):
        return {"title": default_title, "cards": []}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return {"title": default_title, "cards": []}
    if isinstance(data, list):
        return {"title": default_title, "cards": data}
    if isinstance(data, dict):
        if isinstance(data.get("cards"), list):
            return {"title": data.get("title") or default_title, "cards": data["cards"]}
        if isinstance(data.get("items"), list):
            return {"title": data.get("title") or default_title, "cards": data["items"]}
    return {"title": default_title, "cards": []}

def save_json(path: str, payload: dict, default_title: str):
    if not isinstance(payload, dict):
        raise ValueError("Invalid JSON payload")
    cards = payload.get("cards")
    if not isinstance(cards, list):
        cards = payload.get("items") if isinstance(payload.get("items"), list) else []
    norm = []
    for c in cards:
        if not isinstance(c, dict):
            continue
        norm.append({
            "id": c.get("id") or str(uuid.uuid4()),
            "brand": (c.get("brand") or "").strip(),
            "title": (c.get("title") or "").strip(),
            "desc": (c.get("desc") or "").strip(),
            "img": c.get("img") or "",
            "visible": bool(c.get("visible", True)),
        })
    data = {"title": payload.get("title") or default_title, "cards": norm}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return data

def is_allowed(filename, mimetype):
    if not filename:
        return False
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return (ext in ALLOWED_EXTS) and (mimetype or "").startswith("image/")

# ---------- Newly Arrived ----------
@app.get("/api/new-arrived")
@app.get("/api/new-arrivals")
def get_new_arrived():
    data = load_json(NEW_ARRIVED_JSON, "Newly Arrived Brands")
    return no_store(make_response(jsonify(data), 200))

@app.put("/api/new-arrived")
@app.put("/api/new-arrivals")
def put_new_arrived():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = save_json(NEW_ARRIVED_JSON, data, "Newly Arrived Brands")
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

# ---------- Trending ----------
@app.get("/api/trending")
def get_trending():
    data = load_json(TRENDING_JSON, "Trending Products")
    return no_store(make_response(jsonify(data), 200))

@app.put("/api/trending")
def put_trending():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = save_json(TRENDING_JSON, data, "Trending Products")
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

# ---------- Best Selling ----------
@app.get("/api/best-selling")
@app.get("/api/best-selling-products")
def get_best_selling():
    data = load_json(BEST_SELLING_JSON, "Best selling products")
    cards = data.get("cards", [])
    if isinstance(cards, list) and len(cards) > 8:
        cards = cards[:8]
    data["cards"] = cards
    return no_store(make_response(jsonify(data), 200))

@app.put("/api/best-selling")
@app.put("/api/best-selling-products")
def put_best_selling():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = save_json(BEST_SELLING_JSON, data, "Best selling products")
        if isinstance(saved.get("cards"), list) and len(saved["cards"]) > 8:
            saved["cards"] = saved["cards"][:8]
            with open(BEST_SELLING_JSON, "w", encoding="utf-8") as f:
                json.dump(saved, f, ensure_ascii=False, indent=2)
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

# ---------- Popular ----------
@app.get("/api/popular")
@app.get("/api/most-popular")
def get_popular():
    data = load_json(POPULAR_JSON, "Most popular products")
    cards = data.get("cards", [])
    if isinstance(cards, list) and len(cards) > 8:
        cards = cards[:8]
    data["cards"] = cards
    return no_store(make_response(jsonify(data), 200))

@app.put("/api/popular")
@app.put("/api/most-popular")
def put_popular():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = save_json(POPULAR_JSON, data, "Most popular products")
        if isinstance(saved.get("cards"), list) and len(saved["cards"]) > 8:
            saved["cards"] = saved["cards"][:8]
            with open(POPULAR_JSON, "w", encoding="utf-8") as f:
                json.dump(saved, f, ensure_ascii=False, indent=2)
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

# ---------- Blogs (NEW) ----------
def load_blogs():
    if not os.path.exists(BLOGS_JSON):
        return {"title": "Our Recent Blog", "ctaText": "Read All Article", "ctaHref": "#", "cards": []}
    try:
        with open(BLOGS_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return {"title": "Our Recent Blog", "ctaText": "Read All Article", "ctaHref": "#", "cards": []}
    cards = data.get("cards", []) if isinstance(data, dict) else []
    return {
        "title": data.get("title", "Our Recent Blog"),
        "ctaText": data.get("ctaText", "Read All Article"),
        "ctaHref": data.get("ctaHref", "#"),
        "cards": cards if isinstance(cards, list) else [],
    }

def save_blogs(payload: dict):
    if not isinstance(payload, dict):
        raise ValueError("Invalid JSON payload")
    out = {
        "title": payload.get("title") or "Our Recent Blog",
        "ctaText": payload.get("ctaText") or "Read All Article",
        "ctaHref": payload.get("ctaHref") or "#",
        "cards": [],
    }
    cards = payload.get("cards") if isinstance(payload.get("cards"), list) else []
    # Cap to 3
    for i, c in enumerate(cards[:3]):
        if not isinstance(c, dict):
            continue
        out["cards"].append({
            "id": c.get("id") or str(uuid.uuid4()),
            "title": (c.get("title") or "").strip(),
            "date": (c.get("date") or "").strip(),
            "tag": (c.get("tag") or "").strip(),
            "excerpt": (c.get("excerpt") or "").strip(),
            "image": c.get("image") or c.get("img") or "",
            "visible": bool(c.get("visible", True)),
            "order": int(c.get("order") or i + 1),
        })
    with open(BLOGS_JSON, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    return out

@app.get("/api/blogs")
def get_blogs():
    data = load_blogs()
    # Cap on read too, just in case
    data["cards"] = (data.get("cards") or [])[:3]
    return no_store(make_response(jsonify(data), 200))

@app.put("/api/blogs")
def put_blogs():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = save_blogs(data)
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

# ---------- Upload + Serve ----------
@app.post("/api/upload-image")
def upload_image():
    f = request.files.get("image")
    if not f or f.filename == "":
        return jsonify({"error": "No file"}), 400
    if not is_allowed(f.filename, getattr(f, "mimetype", "")):
        return jsonify({"error": "Only image files up to 5MB allowed"}), 400
    safe = secure_filename(f.filename) or "image.png"
    ext = os.path.splitext(safe)[1].lower() or ".png"
    name = f"img_{int(datetime.utcnow().timestamp()*1000)}_{uuid.uuid4().hex}{ext}"
    f.save(os.path.join(UPLOAD_DIR, name))
    return no_store(make_response(jsonify({"url": f"/uploads/{name}"}), 200))

@app.get("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=False)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
