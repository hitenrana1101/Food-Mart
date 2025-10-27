# app.py
import os, sys, json, uuid, traceback
from datetime import datetime
from flask import Flask, request, jsonify, make_response, send_from_directory
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy

# ---- Paths ----
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# JSON (for one-time migration only)
NEW_ARRIVED_JSON = os.path.join(DATA_DIR, "new_arrived.json")
TRENDING_JSON = os.path.join(DATA_DIR, "trending.json")
BEST_SELLING_JSON = os.path.join(DATA_DIR, "best_selling.json")
POPULAR_JSON = os.path.join(DATA_DIR, "popular.json")
JUST_ARRIVED_JSON = os.path.join(DATA_DIR, "just_arrived.json")
BLOGS_JSON = os.path.join(DATA_DIR, "blogs.json")
ORDERS_JSON = os.path.join(DATA_DIR, "orders.json")

# ---- Flask + DB ----
app = Flask(__name__)
DB_PATH = os.path.join(DATA_DIR, "data.db")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + DB_PATH  # Absolute path ensures file at data/data.db
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB
db = SQLAlchemy(app)

# Constants
CAP = 8
ALLOWED_EXTS = {"png", "jpg", "jpeg", "gif", "webp"}

def no_store(resp):
    resp.headers["Cache-Control"] = "no-store"
    return resp

# ---- Helpers ----
def _num(v, d=0, integer=False):
    try:
        n = float(v)
        return int(n) if integer else n
    except Exception:
        return d

def clamp_price(v):  return max(0.0, round(_num(v, 0), 2))
def clamp_rating(v): return max(0.0, min(5.0, round(_num(v, 0), 1)))
def clamp_discount(v):
    try: x=int(float(v))
    except: x=0
    return max(0, min(99, x))
def clamp_order(v, i):
    try: x=int(float(v))
    except: x=i+1
    return max(1, x)
def clamp_qty(v):
    try: x=int(float(v))
    except: x=0
    return max(0, x)
def s(v, d=""):
    t=(v or "").strip()
    return t if t else d

def is_allowed(filename, mimetype):
    if not filename: return False
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return (ext in ALLOWED_EXTS) and (mimetype or "").startswith("image/")

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

def atomic_write_json(path: str, content: dict | list):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(content, f, ensure_ascii=False, indent=2)
        f.flush()
        try:
            os.fsync(f.fileno())
        except Exception:
            pass
    os.replace(tmp, path)

# ===================== MODELS =====================
# POPULAR / JUST (generic)
class Section(db.Model):
    __tablename__ = "sections"
    key = db.Column(db.String(16), primary_key=True)  # "POPULAR" or "JUST"
    title = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class SectionItem(db.Model):
    __tablename__ = "section_items"
    id = db.Column(db.String(64), primary_key=True)
    section_key = db.Column(db.String(16), db.ForeignKey("sections.key"), index=True, nullable=False)

    brand = db.Column(db.String(255), default="")
    title = db.Column(db.String(255), default="")
    desc = db.Column(db.String(2000), default="")
    img  = db.Column(db.String(2000), default="")
    visible = db.Column(db.Boolean, default=True, nullable=False)

    unit = db.Column(db.String(64), default="1 UNIT")
    price = db.Column(db.Float, default=0.0)
    rating = db.Column(db.Float, default=0.0)
    discount = db.Column(db.Integer, default=0)
    order = db.Column(db.Integer, default=9999)
    qty = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "brand": self.brand or "",
            "title": self.title or "",
            "desc": self.desc or "",
            "img": self.img or "",
            "visible": bool(self.visible),
            "unit": self.unit or "1 UNIT",
            "price": float(self.price or 0),
            "rating": float(self.rating or 0),
            "discount": int(self.discount or 0),
            "order": int(self.order or 9999),
            "qty": int(self.qty or 0),
        }

# TRENDING
class TrendingSection(db.Model):
    __tablename__ = "trending_sections"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False, default="Trending Products")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class TrendingItem(db.Model):
    __tablename__ = "trending_items"
    id = db.Column(db.String(64), primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey("trending_sections.id"), index=True, nullable=False)

    brand = db.Column(db.String(255), default="")
    title = db.Column(db.String(255), default="")
    desc = db.Column(db.String(2000), default="")
    img  = db.Column(db.String(2000), default="")
    visible = db.Column(db.Boolean, default=True, nullable=False)

    category = db.Column(db.String(64), default="FRUITS & VEGES")
    unit = db.Column(db.String(64), default="1 UNIT")
    price = db.Column(db.Float, default=0.0)
    rating = db.Column(db.Float, default=0.0)
    discount = db.Column(db.Integer, default=0)
    order = db.Column(db.Integer, default=9999)
    qty = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "brand": self.brand or "",
            "title": self.title or "",
            "desc": self.desc or "",
            "img": self.img or "",
            "visible": bool(self.visible),
            "category": self.category or "FRUITS & VEGES",
            "price": float(self.price or 0),
            "unit": self.unit or "1 UNIT",
            "rating": float(self.rating or 0),
            "discount": int(self.discount or 0),
            "order": int(self.order or 9999),
            "qty": int(self.qty or 0),
        }

# BEST SELLING
class BestSellingSection(db.Model):
    __tablename__ = "best_selling_sections"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False, default="Best selling products")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class BestSellingItem(db.Model):
    __tablename__ = "best_selling_items"
    id = db.Column(db.String(64), primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey("best_selling_sections.id"), index=True, nullable=False)

    brand = db.Column(db.String(255), default="")
    title = db.Column(db.String(255), default="")
    desc = db.Column(db.String(2000), default="")
    img  = db.Column(db.String(2000), default="")
    visible = db.Column(db.Boolean, default=True, nullable=False)

    category = db.Column(db.String(64), default="FRUITS & VEGES")
    unit = db.Column(db.String(64), default="1 UNIT")
    price = db.Column(db.Float, default=0.0)
    rating = db.Column(db.Float, default=0.0)
    discount = db.Column(db.Integer, default=0)
    order = db.Column(db.Integer, default=9999)
    qty = db.Column(db.Integer, default=0)
    orders = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "brand": self.brand or "",
            "title": self.title or "",
            "desc": self.desc or "",
            "img": self.img or "",
            "visible": bool(self.visible),
            "category": self.category or "FRUITS & VEGES",
            "price": float(self.price or 0),
            "unit": self.unit or "1 UNIT",
            "rating": float(self.rating or 0),
            "discount": int(self.discount or 0),
            "order": int(self.order or 9999),
            "qty": int(self.qty or 0),
            "orders": int(self.orders or 0),
        }

# NEW ARRIVED
class NewArrivedSection(db.Model):
    __tablename__ = "new_arrived_sections"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False, default="Newly Arrived Brands")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class NewArrivedItem(db.Model):
    __tablename__ = "new_arrived_items"
    id = db.Column(db.String(64), primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey("new_arrived_sections.id"), index=True, nullable=False)
    brand = db.Column(db.String(255), default="")
    title = db.Column(db.String(255), default="")
    desc = db.Column(db.String(2000), default="")
    img  = db.Column(db.String(2000), default="")
    visible = db.Column(db.Boolean, default=True, nullable=False)
    order = db.Column(db.Integer, default=9999)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    def to_dict(self):
        return {
            "id": self.id,
            "brand": self.brand or "",
            "title": self.title or "",
            "desc": self.desc or "",
            "img": self.img or "",
            "visible": bool(self.visible),
            "order": int(self.order or 9999),
        }

# BLOGS
class BlogsSection(db.Model):
    __tablename__ = "blogs_sections"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False, default="Our Recent Blog")
    ctaText = db.Column(db.String(255), nullable=False, default="Read All Article")
    ctaHref = db.Column(db.String(1024), nullable=False, default="#")
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class BlogPost(db.Model):
    __tablename__ = "blog_posts"
    id = db.Column(db.String(64), primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey("blogs_sections.id"), index=True, nullable=False)
    title = db.Column(db.String(255), default="")
    date = db.Column(db.String(64), default="")
    tag = db.Column(db.String(64), default="")
    excerpt = db.Column(db.String(2000), default="")
    image = db.Column(db.String(2000), default="")
    visible = db.Column(db.Boolean, default=True, nullable=False)
    order = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title or "",
            "date": self.date or "",
            "tag": self.tag or "",
            "excerpt": self.excerpt or "",
            "image": self.image or "",
            "visible": bool(self.visible),
            "order": int(self.order or 1),
        }

# ORDERS
class Order(db.Model):
    __tablename__ = "orders"
    id = db.Column(db.String(64), primary_key=True)
    productId = db.Column(db.String(64), nullable=False, index=True)
    title = db.Column(db.String(255), default="")
    brand = db.Column(db.String(255), default="")
    unit = db.Column(db.String(64), default="")
    price = db.Column(db.Float, default=0.0)
    qty = db.Column(db.Integer, default=1)
    subtotal = db.Column(db.Float, default=0.0)
    category = db.Column(db.String(64), default="")
    discount = db.Column(db.Integer, default=0)
    createdAt = db.Column(db.String(64), default=lambda: datetime.utcnow().isoformat()+"Z")

# ===================== POPULAR / JUST ROUTES =====================
def ensure_section(key: str, default_title: str):
    sec = Section.query.get(key)
    if not sec:
        sec = Section(key=key, title=default_title)
        db.session.add(sec)
        db.session.commit()
    return sec

def section_payload(key: str, default_title: str):
    sec = ensure_section(key, default_title)
    items = (
        SectionItem.query.filter_by(section_key=key)
        .order_by(SectionItem.order.asc(), SectionItem.title.asc())
        .limit(CAP)
        .all()
    )
    return {"title": sec.title, "cards": [x.to_dict() for x in items]}

def save_section(key: str, default_title: str, body: dict):
    title_in = s((body or {}).get("title"), default_title)
    cards = (body or {}).get("cards") or []
    sec = ensure_section(key, default_title)
    sec.title = title_in

    keep_ids = set()
    for i, r in enumerate(cards[:CAP]):
        rid = s(r.get("id")) or uuid.uuid4().hex
        keep_ids.add(rid)
        item = SectionItem.query.get(rid) or SectionItem(id=rid, section_key=key)
        item.section_key = key
        item.brand = s(r.get("brand"))
        item.title = s(r.get("title"))
        item.desc = s(r.get("desc"))
        item.img = s(r.get("img"))
        item.visible = bool(r.get("visible", True))
        item.unit = s(r.get("unit"), "1 UNIT")
        item.price = clamp_price(r.get("price"))
        item.rating = clamp_rating(r.get("rating"))
        item.discount = clamp_discount(r.get("discount"))
        item.order = clamp_order(r.get("order"), i)
        item.qty = clamp_qty(r.get("qty"))
        db.session.add(item)

    # delete removed rows from this section
    q = SectionItem.query.filter(SectionItem.section_key == key)
    if keep_ids:
        q = q.filter(~SectionItem.id.in_(list(keep_ids)))
    q.delete(synchronize_session=False)

    db.session.add(sec)
    db.session.commit()
    return section_payload(key, default_title)

@app.get("/api/popular")
def get_popular_db():
    return jsonify(section_payload("POPULAR", "Most popular products"))

@app.put("/api/popular")
def put_popular_db():
    data = request.get_json(silent=True) or {}
    try:
        payload = save_section("POPULAR", "Most popular products", data)
        return jsonify(payload)
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.get("/api/just-arrived")
def get_just_arrived_db():
    return jsonify(section_payload("JUST", "Just arrived"))

@app.put("/api/just-arrived")
def put_just_arrived_db():
    data = request.get_json(silent=True) or {}
    try:
        payload = save_section("JUST", "Just arrived", data)
        return jsonify(payload)
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ===================== TRENDING ROUTES (DB) =====================
def ensure_trending_section():
    sec = TrendingSection.query.first()
    if not sec:
        sec = TrendingSection(title="Trending Products")
        db.session.add(sec)
        db.session.commit()
    return sec

def trending_payload():
    sec = ensure_trending_section()
    items = (
        TrendingItem.query.filter_by(section_id=sec.id)
        .order_by(TrendingItem.order.asc(), TrendingItem.title.asc())
        .limit(CAP)
        .all()
    )
    return {"title": sec.title, "cards": [x.to_dict() for x in items]}

def save_trending_db(body: dict):
    sec = ensure_trending_section()
    title_in = s((body or {}).get("title"), "Trending Products")
    cards = (body or {}).get("cards") or (body or {}).get("items") or []
    sec.title = title_in
    keep = set()
    for i, c in enumerate(cards[:CAP]):
        cid = s(c.get("id")) or uuid.uuid4().hex
        keep.add(cid)
        item = TrendingItem.query.get(cid) or TrendingItem(id=cid, section_id=sec.id)
        item.section_id = sec.id
        item.brand = s(c.get("brand"))
        item.title = s(c.get("title"))
        item.desc = s(c.get("desc"))
        item.img = s(c.get("img"))
        item.visible = bool(c.get("visible", True))
        item.category = s(c.get("category"), "FRUITS & VEGES")
        item.unit = s(c.get("unit"), "1 UNIT")
        item.price = clamp_price(c.get("price"))
        item.rating = clamp_rating(c.get("rating"))
        item.discount = clamp_discount(c.get("discount"))
        item.order = clamp_order(c.get("order"), i)
        item.qty = clamp_qty(c.get("qty"))
        db.session.add(item)
    q = TrendingItem.query.filter(TrendingItem.section_id == sec.id)
    if keep:
        q = q.filter(~TrendingItem.id.in_(list(keep)))
    q.delete(synchronize_session=False)
    db.session.add(sec)
    db.session.commit()
    return trending_payload()

@app.get("/api/trending")
def get_trending():
    return no_store(make_response(jsonify(trending_payload()), 200))

@app.put("/api/trending")
def put_trending():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = save_trending_db(data)
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

@app.post("/api/trending/order")
def post_trending_order():
    try:
        body = request.get_json(silent=False)
    except Exception as e:
        return no_store(make_response(jsonify({"error": "Bad JSON", "detail": str(e)}), 400))
    pid = s((body or {}).get("productId") or (body or {}).get("id"))
    qty_req = clamp_qty((body or {}).get("qty") or 1)
    if not pid or qty_req < 1:
        return no_store(make_response(jsonify({"error": "productId/id and positive qty required"}), 400))
    item = TrendingItem.query.get(pid)
    if not item:
        return no_store(make_response(jsonify({"error": "Not found"}), 404))
    if item.qty <= 0 or qty_req > item.qty:
        return no_store(make_response(jsonify({"error": "Out of stock", "qty": max(item.qty, 0), "outOfStock": True}), 400))
    item.qty = item.qty - qty_req
    db.session.add(item)
    db.session.commit()
    return no_store(make_response(jsonify({"ok": True, "id": pid, "qty": item.qty}), 200))

@app.post("/api/trending/check-qty")
def post_trending_check_qty():
    try:
        body = request.get_json(silent=False)
    except Exception as e:
        return no_store(make_response(jsonify({"error": "Bad JSON", "detail": str(e)}), 400))
    pid = s((body or {}).get("productId") or (body or {}).get("id"))
    qty_req = clamp_qty((body or {}).get("qty") or 1)
    item = TrendingItem.query.get(pid)
    if not item:
        return no_store(make_response(jsonify({"error": "Not found"}), 404))
    stock = max(int(item.qty or 0), 0)
    out = {
        "ok": True,
        "id": pid,
        "qtyRequested": qty_req,
        "stock": stock,
        "outOfStock": stock <= 0 or qty_req > stock,
        "cappedQty": max(0, min(qty_req, stock))
    }
    return no_store(make_response(jsonify(out), 200))

# ===================== BEST SELLING ROUTES (DB) =====================
def ensure_best_section():
    sec = BestSellingSection.query.first()
    if not sec:
        sec = BestSellingSection(title="Best selling products")
        db.session.add(sec)
        db.session.commit()
    return sec

def best_payload():
    sec = ensure_best_section()
    items = (
        BestSellingItem.query.filter_by(section_id=sec.id)
        .order_by(BestSellingItem.order.asc(), BestSellingItem.title.asc())
        .limit(CAP)
        .all()
    )
    return {"title": sec.title, "cards": [x.to_dict() for x in items]}

def save_best_db(body: dict):
    sec = ensure_best_section()
    title_in = s((body or {}).get("title"), "Best selling products")
    cards = (body or {}).get("cards") or (body or {}).get("items") or []
    sec.title = title_in
    keep = set()
    for i, c in enumerate(cards[:CAP]):
        cid = s(c.get("id")) or uuid.uuid4().hex
        keep.add(cid)
        item = BestSellingItem.query.get(cid) or BestSellingItem(id=cid, section_id=sec.id)
        item.section_id = sec.id
        item.brand = s(c.get("brand"))
        item.title = s(c.get("title"))
        item.desc = s(c.get("desc"))
        item.img = s(c.get("img"))
        item.visible = bool(c.get("visible", True))
        item.category = s(c.get("category"), "FRUITS & VEGES")
        item.unit = s(c.get("unit"), "1 UNIT")
        item.price = clamp_price(c.get("price"))
        item.rating = clamp_rating(c.get("rating"))
        item.discount = clamp_discount(c.get("discount"))
        item.order = clamp_order(c.get("order"), i)
        item.qty = clamp_qty(c.get("qty"))
        # preserve running orders if not sent
        item.orders = clamp_qty(c.get("orders") if c.get("orders") is not None else item.orders)
        db.session.add(item)
    q = BestSellingItem.query.filter(BestSellingItem.section_id == sec.id)
    if keep:
        q = q.filter(~BestSellingItem.id.in_(list(keep)))
    q.delete(synchronize_session=False)
    db.session.add(sec)
    db.session.commit()
    return best_payload()

@app.get("/api/best-selling")
@app.get("/api/best-selling-products")
def get_best_selling():
    return no_store(make_response(jsonify(best_payload()), 200))

@app.put("/api/best-selling")
@app.put("/api/best-selling-products")
def put_best_selling():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = save_best_db(data)
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

@app.post("/api/best-selling/order")
def post_best_selling_order():
    try:
        body = request.get_json(silent=False)
    except Exception as e:
        return no_store(make_response(jsonify({"error": "Bad JSON", "detail": str(e)}), 400))
    pid = s((body or {}).get("id"))
    qty_req = clamp_qty((body or {}).get("qty") or 1)
    if not pid or qty_req < 1:
        return no_store(make_response(jsonify({"error": "id and positive qty required"}), 400))
    item = BestSellingItem.query.get(pid)
    if not item:
        return no_store(make_response(jsonify({"error": "Not found"}), 404))
    if item.qty <= 0 or qty_req > item.qty:
        return no_store(make_response(jsonify({"error": "Out of stock", "qty": max(item.qty, 0), "outOfStock": True}), 400))
    item.qty -= qty_req
    item.orders = int(item.orders or 0) + qty_req
    db.session.add(item)
    db.session.commit()
    return no_store(make_response(jsonify({"ok": True, "id": pid, "orders": item.orders, "qty": item.qty}), 200))

@app.post("/api/best-selling/check-qty")
def post_best_selling_check_qty():
    try:
        body = request.get_json(silent=False)
    except Exception as e:
        return no_store(make_response(jsonify({"error": "Bad JSON", "detail": str(e)}), 400))
    pid = s((body or {}).get("id"))
    qty_req = clamp_qty((body or {}).get("qty") or 1)
    item = BestSellingItem.query.get(pid)
    if not item:
        return no_store(make_response(jsonify({"error": "Not found"}), 404))
    stock = max(int(item.qty or 0), 0)
    out = {
        "ok": True,
        "id": pid,
        "qtyRequested": qty_req,
        "stock": stock,
        "outOfStock": stock <= 0 or qty_req > stock,
        "cappedQty": max(0, min(qty_req, stock))
    }
    return no_store(make_response(jsonify(out), 200))

# ===================== NEW ARRIVED ROUTES (DB) =====================
def ensure_new_arrived_section():
    sec = NewArrivedSection.query.first()
    if not sec:
        sec = NewArrivedSection(title="Newly Arrived Brands")
        db.session.add(sec)
        db.session.commit()
    return sec

def new_arrived_payload():
    sec = ensure_new_arrived_section()
    items = (
        NewArrivedItem.query.filter_by(section_id=sec.id)
        .order_by(NewArrivedItem.order.asc(), NewArrivedItem.title.asc())
        .limit(CAP)
        .all()
    )
    # Keep payload shape minimal as before (no CAP text needed)
    return {"title": sec.title, "cards": [x.to_dict() for x in items]}

def save_new_arrived_db(body: dict):
    sec = ensure_new_arrived_section()
    title_in = s((body or {}).get("title"), "Newly Arrived Brands")
    src = (body or {}).get("cards") or (body or {}).get("items") or []
    sec.title = title_in
    keep = set()
    for i, c in enumerate(src[:CAP]):
        cid = s(c.get("id")) or uuid.uuid4().hex
        keep.add(cid)
        item = NewArrivedItem.query.get(cid) or NewArrivedItem(id=cid, section_id=sec.id)
        item.section_id = sec.id
        item.brand = s(c.get("brand"))
        item.title = s(c.get("title"))
        item.desc = s(c.get("desc"))
        item.img = s(c.get("img"))
        item.visible = bool(c.get("visible", True))
        item.order = clamp_order(c.get("order"), i)
        db.session.add(item)
    q = NewArrivedItem.query.filter(NewArrivedItem.section_id == sec.id)
    if keep:
        q = q.filter(~NewArrivedItem.id.in_(list(keep)))
    q.delete(synchronize_session=False)
    db.session.add(sec)
    db.session.commit()
    return new_arrived_payload()

@app.get("/api/new-arrived")
@app.get("/api/new-arrivals")
def get_new_arrived():
    return no_store(make_response(jsonify(new_arrived_payload()), 200))

@app.put("/api/new-arrived")
@app.put("/api/new-arrivals")
def put_new_arrived():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = save_new_arrived_db(data)
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

# ===================== BLOGS (DB) =====================
def ensure_blogs_section():
    sec = BlogsSection.query.first()
    if not sec:
        sec = BlogsSection(title="Our Recent Blog", ctaText="Read All Article", ctaHref="#")
        db.session.add(sec)
        db.session.commit()
    return sec

def blogs_payload():
    sec = ensure_blogs_section()
    posts = (
        BlogPost.query.filter_by(section_id=sec.id)
        .order_by(BlogPost.order.asc(), BlogPost.title.asc())
        .limit(3)
        .all()
    )
    return {"title": sec.title, "ctaText": sec.ctaText, "ctaHref": sec.ctaHref, "cards": [p.to_dict() for p in posts]}

def save_blogs_db(body: dict):
    sec = ensure_blogs_section()
    sec.title = s((body or {}).get("title"), "Our Recent Blog")
    sec.ctaText = s((body or {}).get("ctaText"), "Read All Article")
    sec.ctaHref = s((body or {}).get("ctaHref"), "#")
    cards = (body or {}).get("cards") or []
    keep = set()
    for i, c in enumerate(cards[:3]):
        cid = s(c.get("id")) or uuid.uuid4().hex
        keep.add(cid)
        p = BlogPost.query.get(cid) or BlogPost(id=cid, section_id=sec.id)
        p.section_id = sec.id
        p.title = s(c.get("title"))
        p.date = s(c.get("date"))
        p.tag = s(c.get("tag"))
        p.excerpt = s(c.get("excerpt"))
        p.image = s(c.get("image") or c.get("img"))
        p.visible = bool(c.get("visible", True))
        p.order = clamp_order(c.get("order"), i)
        db.session.add(p)
    q = BlogPost.query.filter(BlogPost.section_id == sec.id)
    if keep:
        q = q.filter(~BlogPost.id.in_(list(keep)))
    q.delete(synchronize_session=False)
    db.session.add(sec)
    db.session.commit()
    return blogs_payload()

@app.get("/api/blogs")
def get_blogs():
    return no_store(make_response(jsonify(blogs_payload()), 200))

@app.put("/api/blogs")
def put_blogs():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        saved = save_blogs_db(data)
        return no_store(make_response(jsonify({"ok": True, **saved}), 200))
    except Exception as e:
        return no_store(make_response(jsonify({"error": str(e) or "Save failed"}), 400))

# ===================== ORDERS (DB) =====================
@app.post("/api/orders")
def create_order():
    data = request.get_json(silent=True)
    if data is None:
        return no_store(make_response(jsonify({"error": "Invalid or missing JSON; set Content-Type: application/json"}), 400))
    try:
        o = Order(
            id = data.get("id") or uuid.uuid4().hex,
            productId = s(data.get("productId")),
            title = s(data.get("title")),
            brand = s(data.get("brand")),
            unit = s(data.get("unit")),
            price = clamp_price(data.get("price")),
            qty = clamp_qty(data.get("qty") or 1),
            subtotal = clamp_price(data.get("subtotal")),
            category = s(data.get("category")),
            discount = clamp_discount(data.get("discount")),
            createdAt = data.get("createdAt") or datetime.utcnow().isoformat() + "Z",
        )
        if not o.productId:
            return no_store(make_response(jsonify({"error": "productId is required"}), 400))
        db.session.add(o)
        db.session.commit()
        resp = make_response(jsonify({
            "id": o.id, "productId": o.productId, "title": o.title, "brand": o.brand, "unit": o.unit,
            "price": o.price, "qty": o.qty, "subtotal": o.subtotal, "category": o.category,
            "discount": o.discount, "createdAt": o.createdAt
        }), 201)
        resp.headers["Location"] = f"/api/orders/{o.id}"
        return no_store(resp)
    except Exception as e:
        db.session.rollback()
        return no_store(make_response(jsonify({"error": str(e) or "Order failed"}), 400))

@app.get("/api/orders/<order_id>")
def get_order(order_id):
    o = Order.query.get(order_id)
    if not o:
        return no_store(make_response(jsonify({"error": "Not found"}), 404))
    return no_store(make_response(jsonify({
        "id": o.id, "productId": o.productId, "title": o.title, "brand": o.brand, "unit": o.unit,
        "price": o.price, "qty": o.qty, "subtotal": o.subtotal, "category": o.category,
        "discount": o.discount, "createdAt": o.createdAt
    }), 200))

# ===================== Uploads (unchanged paths) =====================
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

# ===================== Migration (JSON -> DB one-time) =====================
def migrate_section_json_to_db(key: str, json_path: str, default_title: str):
    # only if no items present
    if SectionItem.query.filter_by(section_key=key).count() > 0:
        return
    base = load_json(json_path, default_title)
    payload = {
        "title": base.get("title") or default_title,
        "cards": [
            {
                "id": c.get("id") or uuid.uuid4().hex,
                "brand": (c.get("brand") or "").strip(),
                "title": (c.get("title") or "").strip(),
                "desc": (c.get("desc") or "").strip(),
                "img": c.get("img") or "",
                "visible": bool(c.get("visible", True)),
                "unit": c.get("unit") or "1 UNIT",
                "price": c.get("price") or 18,
                "rating": c.get("rating") or 4.5,
                "discount": c.get("discount") or 0,
                "order": c.get("order") or 9999,
                "qty": c.get("qty") or 0,
            }
            for c in ((base.get("cards") or [])[:CAP] if isinstance(base.get("cards"), list) else [])
        ],
    }
    save_section(key, default_title, payload)

def migrate_trending_json_to_db():
    if TrendingItem.query.count() > 0:
        return
    base = load_json(TRENDING_JSON, "Trending Products")
    save_trending_db(base)

def migrate_best_json_to_db():
    if BestSellingItem.query.count() > 0:
        return
    base = load_json(BEST_SELLING_JSON, "Best selling products")
    save_best_db(base)

def migrate_new_arrived_json_to_db():
    if NewArrivedItem.query.count() > 0:
        return
    base = load_json(NEW_ARRIVED_JSON, "Newly Arrived Brands")
    save_new_arrived_db(base)

def migrate_blogs_json_to_db():
    if BlogPost.query.count() > 0:
        return
    if not os.path.exists(BLOGS_JSON):
        return
    try:
        with open(BLOGS_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        data = {}
    save_blogs_db(data if isinstance(data, dict) else {})

# ---- Boot ----
if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # creates all tables in SQLite (data/data.db)
        ensure_section("POPULAR", "Most popular products")
        ensure_section("JUST", "Just arrived")
        ensure_trending_section()
        ensure_best_section()
        ensure_new_arrived_section()
        ensure_blogs_section()
        # One-time migrations from JSON if DB empty
        migrate_section_json_to_db("POPULAR", POPULAR_JSON, "Most popular products")
        migrate_section_json_to_db("JUST", JUST_ARRIVED_JSON, "Just arrived")
        migrate_trending_json_to_db()
        migrate_best_json_to_db()
        migrate_new_arrived_json_to_db()
        migrate_blogs_json_to_db()
    app.run(host="127.0.0.1", port=5000, debug=True)
