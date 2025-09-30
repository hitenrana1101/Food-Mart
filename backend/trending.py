# app.py
import os, json, uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, make_response
from werkzeug.utils import secure_filename

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
PRODUCTS_JSON = os.path.join(DATA_DIR, "products.json")
NEW_ARRIVALS_JSON = os.path.join(DATA_DIR, "new_arrivals.json")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB

ALLOWED_EXTS = {"png", "jpg", "jpeg", "gif", "webp"}

def ensure_file(path: str, defaults: dict):
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(defaults, f, ensure_ascii=False, indent=2)

def read_json(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def write_json(path: str, data: dict):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ---------- Products ----------
@app.get("/api/products")
def get_products():
    ensure_file(
        PRODUCTS_JSON,
        {"title": "Trending Products", "categories": ["ALL", "FRUITS & VEGES", "JUICES"], "items": []},
    )
    data = read_json(PRODUCTS_JSON) or {}
    resp = make_response(jsonify(data), 200)
    resp.headers["Cache-Control"] = "no-store"
    return resp

@app.put("/api/products")
def put_products():
    payload = request.get_json(silent=True) or {}
    normalized = {
        "title": payload.get("title") or "Trending Products",
        "categories": payload.get("categories") if isinstance(payload.get("categories"), list) and payload.get("categories") else ["ALL"],
        "items": payload.get("items") if isinstance(payload.get("items"), list) else [],
    }
    write_json(PRODUCTS_JSON, normalized)
    resp = make_response(jsonify({"ok": True}), 200)
    resp.headers["Cache-Control"] = "no-store"
    return resp

# ---------- New Arrivals ----------
@app.get("/api/new-arrivals")
def get_new_arrivals():
    ensure_file(
        NEW_ARRIVALS_JSON,
        {"title": "Newly Arrived", "categories": ["ALL", "FRUITS & VEGES", "JUICES"], "items": []},
    )
    data = read_json(NEW_ARRIVALS_JSON) or {}
    resp = make_response(jsonify(data), 200)
    resp.headers["Cache-Control"] = "no-store"
    return resp

@app.put("/api/new-arrivals")
def put_new_arrivals():
    payload = request.get_json(silent=True) or {}
    normalized = {
        "title": payload.get("title") or "Newly Arrived",
        "categories": payload.get("categories") if isinstance(payload.get("categories"), list) and payload.get("categories") else ["ALL"],
        "items": payload.get("items") if isinstance(payload.get("items"), list) else [],
    }
    write_json(NEW_ARRIVALS_JSON, normalized)
    resp = make_response(jsonify({"ok": True}), 200)
    resp.headers["Cache-Control"] = "no-store"
    return resp

# ---------- Upload + Serve ----------
def is_allowed(filename: str, mimetype: str) -> bool:
    if not filename:
        return False
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return (ext in ALLOWED_EXTS) and (mimetype or "").startswith("image/")

@app.post("/api/upload-image")
def upload_image():
    f = request.files.get("image")
    if not f or f.filename == "":
        return jsonify({"error": "No file"}), 400
    if not is_allowed(f.filename, getattr(f, "mimetype", "")):
        return jsonify({"error": "Only image files up to 5MB allowed"}), 400
    safe = secure_filename(f.filename) or "image.png"  # sanitize user filename
    ext = os.path.splitext(safe)[1].lower() or ".png"
    name = f"img_{int(datetime.utcnow().timestamp()*1000)}_{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOAD_DIR, name)
    f.save(dest)
    return jsonify({"url": f"/uploads/{name}"}), 200

@app.get("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=False)

if __name__ == "__main__":
    # Flask on 3000; Vite proxy will point here
    app.run(host="127.0.0.1", port=3000, debug=True)
