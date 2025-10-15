# app.py
import os, sys, json, uuid, traceback, sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, make_response, send_from_directory
from werkzeug.utils import secure_filename

# #create table
# conn =sqlite3.connect("sqlite.db")
# conn.execute('''
#          Create table Admin(
#              Admin_id INT AUTO_INCREMENT PRIMARY KEY,
#              Admin_name VARCHAR(50),
#              Admin_class VARCHAR(50), 
#              Admin_email VARCHAR(50), 
#              )
#              ''')
# #insert data 

# conn.execute("INSERT INTO Admin(name,class,email)VALUES(?,?,?)",
#               ("Hiten,b.voc ,python") )


# conn.close()

# Paths
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

NEW_ARRIVED_JSON = os.path.join(DATA_DIR, "new_arrived.json")
TRENDING_JSON = os.path.join(DATA_DIR, "trending.json")
BEST_SELLING_JSON = os.path.join(DATA_DIR, "best_selling.json")  # change path here if needed
POPULAR_JSON = os.path.join(DATA_DIR, "popular.json")
BLOGS_JSON = os.path.join(DATA_DIR, "blogs.json")
ORDERS_JSON = os.path.join(DATA_DIR, "orders.json")
JUST_ARRIVED_JSON = os.path.join(DATA_DIR, "just_arrived.json")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB

ALLOWED_EXTS = {"png", "jpg", "jpeg", "gif", "webp"}

def no_store(resp):
    resp.headers["Cache-Control"] = "no-store"
    return resp

# ---------- Generic helpers ----------
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

# ---------- Atomic write (Windows-safe) ----------
def _atomic_write_json(path: str, content: dict | list):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(content, f, ensure_ascii=False, indent=2)
        f.flush()
        try:
            os.fsync(f.fileno())
        except Exception:
            pass
        if sys.platform == "win32":
            try:
                import msvcrt
                msvcrt._commit(f.fileno())
            except Exception:
                pass
    if os.name != "nt":
        try:
            dir_fd = os.open(os.path.dirname(path) or ".", os.O_RDONLY)
            try:
                os.fsync(dir_fd)
            finally:
                os.close(dir_fd)
        except Exception:
            pass
    os.replace(tmp, path)

# ---------- Number helper ----------
def _num(v, d=0, integer=False):
    try:
        n = float(v)
        return int(n) if integer else n
    except Exception:
        return d

# ---------- Trending (full fields) ----------
TRENDING_CATEGORIES = {"FRUITS & VEGES", "JUICES"}

def normalize_trending_card(c: dict, index: int):
    cat_raw = (c.get("category") or "FRUITS & VEGES").strip()
    category = cat_raw if cat_raw in TRENDING_CATEGORIES else "FRUITS & VEGES"
    price = max(0.0, round(_num(c.get("price"), 0), 2))
    rating = max(0.0, min(5.0, round(_num(c.get("rating"), 0), 1)))
    discount = max(0, min(99, int(_num(c.get("discount"), 0, integer=True))))
    order = max(1, int(_num(c.get("order"), index + 1, integer=True)))
    qty = max(0, int(_num(c.get("qty"), 0, integer=True)))
    return {
        "id": c.get("id") or str(uuid.uuid4()),
        "brand": (c.get("brand") or "").strip(),
        "title": (c.get("title") or "").strip(),
        "desc": (c.get("desc") or "").strip(),
        "img": c.get("img") or "",
        "visible": bool(c.get("visible", True)),
        "category": category,
        "price": price,
        "unit": (c.get("unit") or "1 UNIT").strip(),
        "rating": rating,
        "discount": discount,
        "order": order,
        "qty": qty,
    }

def load_trending(path: str, default_title: str):
    base = load_json(path, default_title)
    cards = base.get("cards") if isinstance(base, dict) else []
    out = []
    for i, c in enumerate(cards if isinstance(cards, list) else []):
        if isinstance(c, dict):
            out.append(normalize_trending_card(c, i))
    out.sort(key=lambda x: x.get("order", 0))
    base["cards"] = out
    return base

def save_trending(path: str, payload: dict, default_title: str):
    if not isinstance(payload, dict):
        raise ValueError("Invalid JSON payload")
    src = payload.get("cards")
    if not isinstance(src, list):
        src = payload.get("items") if isinstance(payload.get("items"), list) else []
    norm = []
    for i, c in enumerate(src):
        if not isinstance(c, dict):
            continue
        norm.append(normalize_trending_card(c, i))
    norm.sort(key=lambda x: x.get("order", 0))
    data = {"title": payload.get("title") or default_title, "cards": norm}
    _atomic_write_json(path, data)
    return data

@app.get("/api/trending")
def get_trending():
    data = load_trending(TRENDING_JSON, "Trending Products")
    cards = data.get("cards", [])
    cards = sorted(cards, key=lambda x: x.get("order", 0))
    data["cards"] = cards
    return no_store(make_response(jsonify(data), 200))

@app.put("/api/trending")
def put_trending():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = save_trending(TRENDING_JSON, data, "Trending Products")
        saved["cards"] = sorted(saved.get("cards", []), key=lambda x: x.get("order", 0))
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

# NEW: decrement stock for trending (unified OOS)
@app.post("/api/trending/order")
def post_trending_order():
    try:
        body = request.get_json(silent=False)
    except Exception as e:
        return no_store(make_response(jsonify({"error": "Bad JSON", "detail": str(e)}), 400))

    pid = str((body or {}).get("productId") or (body or {}).get("id") or "").strip()
    qty_req = int(_num((body or {}).get("qty"), 1, integer=True))
    if not pid or qty_req < 1:
        return no_store(make_response(jsonify({"error": "productId/id and positive qty required"}), 400))

    data = load_trending(TRENDING_JSON, "Trending Products")
    cards = data.get("cards", [])
    idx = next((i for i, c in enumerate(cards) if c.get("id") == pid), -1)
    if idx < 0:
        return no_store(make_response(jsonify({"error": "Not found"}), 404))

    stock = int(_num(cards[idx].get("qty"), 0, integer=True))
    if stock <= 0 or qty_req > stock:
        return no_store(make_response(jsonify({"error": "Out of stock", "qty": max(stock, 0), "outOfStock": True}), 400))

    cards[idx]["qty"] = stock - qty_req
    data["cards"] = cards
    try:
        _atomic_write_json(TRENDING_JSON, data)
    except Exception as e:
        tb = traceback.format_exc()
        return no_store(make_response(jsonify({"error": "Persist failed", "detail": str(e), "trace": tb}), 500))

    return no_store(make_response(jsonify({
        "ok": True,
        "id": pid,
        "qty": cards[idx]["qty"]
    }), 200))

# NEW: stock check for trending (allows UI to go beyond stock but flags OOS)
def _trending_find(pid: str):
    data = load_trending(TRENDING_JSON, "Trending Products")
    cards = data.get("cards", [])
    idx = next((i for i, c in enumerate(cards) if c.get("id") == pid), -1)
    return data, cards, idx

@app.post("/api/trending/check-qty")
def post_trending_check_qty():
    try:
        body = request.get_json(silent=False)
    except Exception as e:
        return no_store(make_response(jsonify({"error": "Bad JSON", "detail": str(e)}), 400))

    pid = str((body or {}).get("productId") or (body or {}).get("id") or "").strip()
    qty_req = int(_num((body or {}).get("qty"), 1, integer=True))
    if not pid or qty_req < 1:
        return no_store(make_response(jsonify({"error": "productId/id and positive qty required"}), 400))

    data, cards, idx = _trending_find(pid)
    if idx < 0:
        return no_store(make_response(jsonify({"error": "Not found"}), 404))

    stock = int(_num(cards[idx].get("qty"), 0, integer=True))
    out = {
        "ok": True,
        "id": pid,
        "qtyRequested": qty_req,
        "stock": max(stock, 0),
        "outOfStock": stock <= 0 or qty_req > stock,
        "cappedQty": max(0, min(qty_req, max(stock, 0)))
    }
    return no_store(make_response(jsonify(out), 200))

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

# ---------- Just Arrived (separate dataset, capped 8) ----------
@app.get("/api/just-arrived")
def get_just_arrived():
    data = load_json(JUST_ARRIVED_JSON, "Just arrived")
    cards = data.get("cards", [])
    if isinstance(cards, list) and len(cards) > 8:
        cards = cards[:8]
    data["cards"] = cards
    return no_store(make_response(jsonify(data), 200))

@app.put("/api/just-arrived")
def put_just_arrived():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = save_json(JUST_ARRIVED_JSON, data, "Just arrived")
        if isinstance(saved.get("cards"), list) and len(saved["cards"]) > 8:
            saved["cards"] = saved["cards"][:8]
            with open(JUST_ARRIVED_JSON, "w", encoding="utf-8") as f:
                json.dump(saved, f, ensure_ascii=False, indent=2)
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

# ---------- Best Selling (full fields + stock + orders) ----------
BEST_SELLING_CATEGORIES = {"FRUITS & VEGES", "JUICES"}

def _normalize_best_selling_card(c: dict, index: int, prev: dict | None = None):
    cat_raw = (c.get("category") or "FRUITS & VEGES").strip()
    category = cat_raw if cat_raw in BEST_SELLING_CATEGORIES else "FRUITS & VEGES"
    price = max(0.0, round(_num(c.get("price"), 0), 2))
    rating = max(0.0, min(5.0, round(_num(c.get("rating"), 0), 1)))
    discount = max(0, min(99, int(_num(c.get("discount"), 0, integer=True))))
    order = max(1, int(_num(c.get("order"), index + 1, integer=True)))
    prev_orders = int(_num((prev or {}).get("orders"), 0, integer=True))
    prev_qty = int(_num((prev or {}).get("qty"), 0, integer=True))
    orders = max(0, int(_num(c.get("orders"), prev_orders, integer=True)))
    qty = max(0, int(_num(c.get("qty"), prev_qty, integer=True)))
    return {
        "id": c.get("id") or str(uuid.uuid4()),
        "brand": (c.get("brand") or "").strip(),
        "title": (c.get("title") or "").strip(),
        "desc": (c.get("desc") or "").strip(),
        "img": c.get("img") or "",
        "visible": bool(c.get("visible", True)),
        "category": category,
        "price": price,
        "unit": (c.get("unit") or "1 UNIT").strip(),
        "rating": rating,
        "discount": discount,
        "order": order,
        "qty": qty,
        "orders": orders,
    }

def _load_best_selling():
    base = load_json(BEST_SELLING_JSON, "Best selling products")
    cards = base.get("cards") if isinstance(base, dict) else []
    out = []
    for i, c in enumerate(cards if isinstance(cards, list) else []):
        if isinstance(c, dict):
            out.append(_normalize_best_selling_card(c, i))
    out.sort(key=lambda x: x.get("order", 0))
    if len(out) > 8:
        out = out[:8]
    base["cards"] = out
    return base

def _save_best_selling(payload: dict):
    if not isinstance(payload, dict):
        raise ValueError("Invalid JSON payload")
    incoming = payload.get("cards")
    if not isinstance(incoming, list):
        incoming = payload.get("items") if isinstance(payload.get("items"), list) else []
    existing = _load_best_selling()
    prev_by_id = {c.get("id"): c for c in existing.get("cards", []) if isinstance(c, dict)}
    norm = []
    for i, c in enumerate(incoming):
        if not isinstance(c, dict):
            continue
        cid = c.get("id")
        prev = prev_by_id.get(cid) if cid else None
        norm.append(_normalize_best_selling_card(c, i, prev))
    norm.sort(key=lambda x: x.get("order", 0))
    if len(norm) > 8:
        norm = norm[:8]
    data = {"title": payload.get("title") or "Best selling products", "cards": norm}
    _atomic_write_json(BEST_SELLING_JSON, data)
    return data

@app.get("/api/best-selling")
@app.get("/api/best-selling-products")
def get_best_selling():
    data = _load_best_selling()
    return no_store(make_response(jsonify(data), 200))

@app.put("/api/best-selling")
@app.put("/api/best-selling-products")
def put_best_selling():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = _save_best_selling(data)
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

# UPDATED: unified Out of Stock handling for best-selling orders
@app.post("/api/best-selling/order")
def post_best_selling_order():
    try:
        body = request.get_json(silent=False)
    except Exception as e:
        return no_store(make_response(jsonify({"error": "Bad JSON", "detail": str(e)}), 400))
    pid = str((body or {}).get("id") or "").strip()
    qty_req = int(_num((body or {}).get("qty"), 1, integer=True))
    if not pid or qty_req < 1:
        return no_store(make_response(jsonify({"error": "id and positive qty required"}), 400))

    data = _load_best_selling()
    cards = data.get("cards", [])
    idx = next((i for i, c in enumerate(cards) if c.get("id") == pid), -1)
    if idx < 0:
        return no_store(make_response(jsonify({"error": "Not found"}), 404))

    stock = int(_num(cards[idx].get("qty"), 0, integer=True))
    if stock <= 0 or qty_req > stock:
        return no_store(make_response(jsonify({
            "error": "Out of stock",
            "qty": max(stock, 0),
            "outOfStock": True
        }), 400))

    cards[idx]["qty"] = stock - qty_req
    cards[idx]["orders"] = int(_num(cards[idx].get("orders"), 0, integer=True)) + qty_req
    data["cards"] = cards
    try:
        _atomic_write_json(BEST_SELLING_JSON, data)
    except Exception as e:
        tb = traceback.format_exc()
        return no_store(make_response(jsonify({"error": "Persist failed", "detail": str(e), "trace": tb}), 500))

    return no_store(make_response(jsonify({
        "ok": True,
        "id": pid,
        "orders": cards[idx]["orders"],
        "qty": cards[idx]["qty"]
    }), 200))

# NEW: stock check for best-selling (allows UI to go beyond stock but flags OOS)
def _best_selling_find(pid: str):
    data = _load_best_selling()
    cards = data.get("cards", [])
    idx = next((i for i, c in enumerate(cards) if c.get("id") == pid), -1)
    return data, cards, idx

@app.post("/api/best-selling/check-qty")
def post_best_selling_check_qty():
    try:
        body = request.get_json(silent=False)
    except Exception as e:
        return no_store(make_response(jsonify({"error": "Bad JSON", "detail": str(e)}), 400))

    pid = str((body or {}).get("id") or "").strip()
    qty_req = int(_num((body or {}).get("qty"), 1, integer=True))
    if not pid or qty_req < 1:
        return no_store(make_response(jsonify({"error": "id and positive qty required"}), 400))

    data, cards, idx = _best_selling_find(pid)
    if idx < 0:
        return no_store(make_response(jsonify({"error": "Not found"}), 404))

    stock = int(_num(cards[idx].get("qty"), 0, integer=True))
    out = {
        "ok": True,
        "id": pid,
        "qtyRequested": qty_req,
        "stock": max(stock, 0),
        "outOfStock": stock <= 0 or qty_req > stock,
        "cappedQty": max(0, min(qty_req, max(stock, 0)))
    }
    return no_store(make_response(jsonify(out), 200))

# ---------- Popular (persist extra storefront fields) ----------
def _normalize_popular_card(c: dict, index: int):
    return {
        "id": c.get("id") or str(uuid.uuid4()),
        "brand": (c.get("brand") or "").strip(),
        "title": (c.get("title") or "").strip(),
        "desc": (c.get("desc") or "").strip(),
        "img": c.get("img") or "",
        "visible": bool(c.get("visible", True)),
        "unit": (c.get("unit") or "1 UNIT").strip(),
        "price": max(0.0, round(_num(c.get("price"), 18), 2)),
        "rating": max(0.0, min(5.0, round(_num(c.get("rating"), 4.5), 1))),
        "discount": max(0, min(99, int(_num(c.get("discount"), 0, integer=True)))),
        "order": max(1, int(_num(c.get("order"), index + 1, integer=True))),
    }

def _load_popular():
    base = load_json(POPULAR_JSON, "Most popular products")
    cards = base.get("cards") if isinstance(base, dict) else []
    out = []
    for i, c in enumerate(cards if isinstance(cards, list) else []):
        if isinstance(c, dict):
            out.append(_normalize_popular_card(c, i))
    out.sort(key=lambda x: x.get("order", 0))
    if len(out) > 8:
        out = out[:8]
    base["cards"] = out
    return base

def _save_popular(payload: dict):
    if not isinstance(payload, dict):
        raise ValueError("Invalid JSON payload")
    incoming = payload.get("cards")
    if not isinstance(incoming, list):
        incoming = payload.get("items") if isinstance(payload.get("items"), list) else []
    norm = []
    for i, c in enumerate(incoming):
        if not isinstance(c, dict):
            continue
        norm.append(_normalize_popular_card(c, i))
    norm.sort(key=lambda x: x.get("order", 0))
    if len(norm) > 8:
        norm = norm[:8]
    data = {"title": payload.get("title") or "Most popular products", "cards": norm}
    _atomic_write_json(POPULAR_JSON, data)
    return data

@app.get("/api/popular")
@app.get("/api/most-popular")
def get_popular():
    data = _load_popular()
    return no_store(make_response(jsonify(data), 200))

@app.put("/api/popular")
@app.put("/api/most-popular")
def put_popular():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = _save_popular(data)
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

# ---------- Blogs ----------
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

# ---------- Orders (optional general log) ----------
def _load_orders():
    if not os.path.exists(ORDERS_JSON):
        return []
    try:
        with open(ORDERS_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []

@app.post("/api/orders")
def create_order():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        order = {
            "id": data.get("id") or str(uuid.uuid4()),
            "productId": str(data.get("productId") or "").strip(),
            "title": (data.get("title") or "").strip(),
            "brand": (data.get("brand") or "").strip(),
            "unit": (data.get("unit") or "").strip(),
            "price": max(0.0, float(data.get("price") or 0)),
            "qty": max(1, int(data.get("qty") or 1)),
            "subtotal": max(0.0, float(data.get("subtotal") or 0)),
            "category": (data.get("category") or "").strip(),
            "discount": max(0, int(data.get("discount") or 0)),
            "createdAt": data.get("createdAt") or datetime.utcnow().isoformat() + "Z",
        }
        if not order["productId"]:
            return no_store(make_response(jsonify({"error": "productId is required"}), 400))
        orders = _load_orders()
        orders.append(order)
        _atomic_write_json(ORDERS_JSON, orders)
        resp = make_response(jsonify(order), 201)
        resp.headers["Location"] = f"/api/orders/{order['id']}"
        return no_store(resp)
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Order failed"}), 400))

@app.get("/api/orders/<order_id>")
def get_order(order_id):
    orders = _load_orders()
    for o in orders:
        if o.get("id") == order_id:
            return no_store(make_response(jsonify(o), 200))
    return no_store(make_response(jsonify({"error": "Not found"}), 404))





if (__name__ == "__main__"):
    app.run(host="127.0.0.1", port=5000, debug=True)
