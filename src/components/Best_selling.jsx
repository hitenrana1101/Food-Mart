// src/pages/BestSellingProducts.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";

/* ===== Wishlist utils (localStorage + CustomEvent for same-tab) ===== */
const WL_KEY = "wishlist";
function wlRead() {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || "[]"); }
  catch { return []; }
}
function wlWrite(next) {
  localStorage.setItem(WL_KEY, JSON.stringify(next));
  // same-tab instant update
  window.dispatchEvent(new CustomEvent("wishlist-change", { detail: next }));
}
function wlAdd(item) {
  const list = wlRead();
  if (!list.some(p => p.id === item.id)) {
    list.push({
      id: item.id,
      name: item.title,         // map title -> name
      price: Number(item.price),
      image: item.img           // map img -> image
    });
    wlWrite(list);
  }
}
function wlRemove(id) {
  wlWrite(wlRead().filter(p => p.id !== id));
}

/* ===== Normalize backend -> UI ===== */
function adapt(cards) {
  const list = Array.isArray(cards) ? cards : [];
  return list
    .filter((c) => c?.visible !== false)
    .map((c, i) => {
      const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
      return {
        id: c.id || `bs-${i}`,
        title: String(c.title || c.brand || "Untitled"),
        brand: String(c.brand || ""),
        desc: String(c.desc || ""),
        img: String(c.img || ""),
        price: num(c.price, 0),
        unit: String(c.unit || "1 UNIT"),
        rating: num(c.rating, 0),
        discount: num(c.discount, 0),
        category: String(c.category || "ALL"),
        qty: num(c.qty, 0),
        orders: num(c.orders, 0),
        order: num(c.order, i + 1),
      };
    });
}

async function fetchBestSelling() {
  const res = await fetch(`/api/best-selling?ts=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/best-selling ${res.status}`);
  const data = await res.json();
  const cards = Array.isArray(data?.cards) ? data.cards : [];
  const normalized = adapt(cards);
  normalized.sort((a, b) => (a.order || 0) - (b.order || 0));
  return normalized;
}

async function createOrder(payload) {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) throw new Error(data?.error || `Order failed ${res.status}`);
  return data; // created order object
}

async function incrementBestSelling(productId, units) {
  try {
    const res = await fetch("/api/best-selling/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId, qty: units }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) return null;
    return Number.isFinite(Number(data.orders)) ? Number(data.orders) : null;
  } catch {
    return null;
  }
}

// Check requested qty against stock without mutating inventory
async function checkBestSellingQty(productId, units) {
  try {
    const res = await fetch("/api/best-selling/check-qty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId, qty: units }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { outOfStock: false, stock: 0, cappedQty: units };
    return {
      outOfStock: !!data.outOfStock,
      stock: Number.isFinite(Number(data.stock)) ? Number(data.stock) : 0,
      cappedQty: Number.isFinite(Number(data.cappedQty)) ? Number(data.cappedQty) : units,
    };
  } catch {
    return { outOfStock: false, stock: 0, cappedQty: units };
  }
}

function Card({ item, qty, onDec, onInc, onToggleWish, wished, onOrder, oos }) {
  return (
    <article className="relative rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-2xl hover:-translate-y-0.5 duration-200">
      <div className="relative p-4">
        {item.discount ? (
          <span className="absolute left-4 top-4 rounded-md bg-green-100 text-green-700 text-xs font-semibold px-2 py-1">
            -{item.discount}%
          </span>
        ) : null}
        <button
          onClick={onToggleWish}
          className="absolute right-4 top-4 h-9 w-9 grid place-items-center rounded-full bg-white/90 ring-1 ring-neutral-200 hover:bg-white"
          aria-label="Add to wishlist"
          type="button"
        >
          <Heart size={18} className={wished ? "fill-rose-500 stroke-rose-500" : "stroke-neutral-700"} />
        </button>
        <div className="aspect-[4/3] rounded-xl bg-neutral-50 overflow-hidden grid place-items-center">
          {/* eslint-disable-next-line */}
          <img src={item.img} alt={item.title} className="h-full w-full object-contain" loading="lazy" />
        </div>
      </div>

      <div className="px-4 pb-4">
        <h3 className="text-sm text-neutral-500">{item.unit}</h3>
        <div className="mt-1 flex items-center gap-1">
          <Star size={14} className="fill-amber-400 stroke-amber-400" />
          <span className="text-xs font-medium text-neutral-600">{item.rating}</span>
        </div>
        <h2 className="mt-2 line-clamp-2 text-[15px] font-semibold text-neutral-900">{item.title}</h2>
        <div className="mt-2 text-lg font-semibold text-neutral-900">${Number(item.price).toFixed(2)}</div>

        {/* Stock and OOS indicator */}
        <div className="mt-1 text-[12px]">
          {oos ? (
            <span className="text-rose-600 font-semibold">Out of Stock</span>
          ) : Number(item.qty) > 0 ? (
            <span className="text-neutral-500">{item.qty} in stock</span>
          ) : (
            <span className="text-rose-600 font-semibold">Out of Stock</span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDec}
              className="h-7 w-7 grid place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
              aria-label="Decrease"
              disabled={qty <= 1}
            >
              –
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-medium">{qty}</span>
            <button
              type="button"
              onClick={onInc}
              className="h-7 w-7 grid place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
              aria-label="Increase"
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="text-sm text-[#747474] disabled:opacity-60"
            onClick={onOrder}
            disabled={oos}
            title={oos ? "Out of Stock" : "Add to Cart"}
          >
            Order
          </button>
        </div>
      </div>
    </article>
  );
}

export default function BestSellingProducts() {
  const [items, setItems] = useState([]);
  const [qty, setQty] = useState({});
  const [wish, setWish] = useState(() => {
    // initialize from storage
    const ids = new Set(wlRead().map(p => p.id));
    return ids;
  });
  const [oos, setOOS] = useState({}); // { [id]: boolean }

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [loading, setLoading] = useState(true);

  const scrollerRef = useRef(null);
  const firstItemRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBestSelling();
        if (!alive) return;
        setItems(data);
        const initialQty = Object.fromEntries(data.map((p) => [p.id, 1]));
        setQty(initialQty);
        setOOS(Object.fromEntries(data.map((p) => [p.id, Number(p.qty) <= 0 ? true : false])));
        // Sync wish against current list (optional)
        setWish(prev => {
          const current = new Set(prev);
          const validIds = new Set(data.map(d => d.id));
          for (const id of Array.from(current)) {
            if (!validIds.has(id)) current.delete(id);
          }
          return current;
        });
      } catch {
        if (!alive) return;
        setItems([]);
        setQty({});
        setOOS({});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Keep wish in sync with storage changes (cross-tab + same-tab)
  useEffect(() => {
    function onStorage(e) {
      if (e.key === WL_KEY) {
        try {
          const list = JSON.parse(e.newValue || "[]") || [];
          setWish(new Set(list.map(p => p.id)));
        } catch {
          setWish(new Set());
        }
      }
    }
    function onWishChange(e) {
      const next = Array.isArray(e.detail) ? e.detail : wlRead();
      setWish(new Set(next.map(p => p.id)));
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("wishlist-change", onWishChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("wishlist-change", onWishChange);
    };
  }, []);

  // Utilities
  const setQtyAndCheck = async (id, nextQty) => {
    setQty((q) => ({ ...q, [id]: nextQty }));
    const res = await checkBestSellingQty(id, nextQty);
    setOOS((m) => ({ ...m, [id]: !!res.outOfStock }));
  };

  const dec = (id) => setQtyAndCheck(id, Math.max(1, (qty[id] || 1) - 1));
  const inc = (id) => setQtyAndCheck(id, (qty[id] || 1) + 1);

  // Toggle wishlist with storage persistence
  const toggleWish = (item) => {
    setWish((s) => {
      const n = new Set(s);
      if (n.has(item.id)) {
        n.delete(item.id);
        wlRemove(item.id);
      } else {
        n.add(item.id);
        wlAdd(item);
      }
      return n;
    });
  };

  // Carousel helpers
  const getStep = useCallback((node) => {
    if (!node || !firstItemRef.current) return 0;
    const style = getComputedStyle(node);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
    const width = firstItemRef.current.getBoundingClientRect().width;
    return Math.round(width + gap);
  }, []);

  const updateButtons = useCallback((node) => {
    if (!node) return;
    const tol = 1;
    setCanLeft(node.scrollLeft > tol);
    setCanRight(node.scrollLeft < node.scrollWidth - node.clientWidth - tol);
  }, []);

  const scrollToIndex = useCallback(
    (node, index, behavior = "smooth") => {
      if (!node) return;
      const step = getStep(node);
      const maxLeft = node.scrollWidth - node.clientWidth;
      const target = Math.max(0, Math.min(index * step, maxLeft));
      node.scrollTo({ left: target, behavior });
    },
    [getStep]
  );

  const scrollByOne = useCallback(
    (dir) => {
      const node = scrollerRef.current;
      if (!node) return;
      const step = getStep(node);
      const currentIndex = step ? Math.round(node.scrollLeft / step) : 0;
      const nextIndex = dir === "right" ? currentIndex + 1 : currentIndex - 1;
      scrollToIndex(node, nextIndex);
    },
    [getStep, scrollToIndex]
  );

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const onScroll = () => updateButtons(node);
    node.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      const step = getStep(node);
      const index = step ? Math.round(node.scrollLeft / step) : 0;
      scrollToIndex(node, index, "auto");
      updateButtons(node);
    });
    ro.observe(node);
    updateButtons(node);
    return () => {
      node.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [getStep, scrollToIndex, updateButtons]);

  useEffect(() => {
    let bc;
    let alive = true;
    const reload = async () => {
      try {
        setLoading(true);
        const data = await fetchBestSelling();
        if (!alive) return;
        setItems(data);
        setQty(Object.fromEntries(data.map((p) => [p.id, 1])));
        setOOS(Object.fromEntries(data.map((p) => [p.id, Number(p.qty) <= 0])));
      } finally {
        if (alive) setLoading(false);
      }
    };
    try {
      bc = new BroadcastChannel("best-selling");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "updated") reload();
      };
    } catch { }
    const onStorage = (e) => {
      if (e.key === "best-selling-updated") reload();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
      try { bc && bc.close(); } catch { }
    };
  }, []);

  const orderNow = async (item) => {
    const wanted = qty[item.id] ?? 1;

    const check = await checkBestSellingQty(item.id, wanted);
    if (check.outOfStock) {
      setOOS((m) => ({ ...m, [item.id]: true }));
      return alert(`Out of Stock (stock: ${check.stock})`);
    }

    try {
      const orderPayload = {
        id: crypto.randomUUID(),
        productId: item.id,
        title: item.title,
        brand: item.brand,
        unit: item.unit,
        price: Number(item.price),
        qty: wanted,
        subtotal: Number(item.price) * wanted,
        category: item.category,
        discount: Number(item.discount) || 0,
        createdAt: new Date().toISOString(),
      };
      const created = await createOrder(orderPayload);
      const latestOrders = await incrementBestSelling(item.id, wanted);

      setItems((arr) =>
        arr.map((p) =>
          p.id === item.id
            ? {
              ...p,
              qty: Math.max(0, Number(p.qty || 0) - wanted),
              orders:
                Number.isFinite(Number(latestOrders)) ? latestOrders : Number(p.orders || 0) + wanted,
            }
            : p
        )
      );

      const postCheck = await checkBestSellingQty(item.id, qty[item.id] ?? 1);
      setOOS((m) => ({ ...m, [item.id]: !!postCheck.outOfStock }));

      alert(`Order placed #${created.id} for ${wanted} × ${item.title}`);
    } catch (e) {
      alert(e?.message || "Order failed");
    }
  };

  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 xl:max-w-[1452px]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-semibold">Best selling products</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#747474] hover:text-neutral-900">View All Categories →</span>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => scrollByOne("left")}
              aria-label="Previous"
              disabled={!canLeft}
              className="rounded-md bg-neutral-100 hover:bg-neutral-200 p-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollByOne("right")}
              aria-label="Next"
              disabled={!canRight}
              className="ml-2 rounded-md bg-neutral-100 hover:bg-neutral-200 p-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Best selling products carousel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollByOne("right");
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollByOne("left");
          }
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            e.currentTarget.scrollBy({ left: e.deltaY, behavior: "smooth" });
          }
        }}
        className="
          grid grid-flow-col
          auto-cols-[85%]
          sm:auto-cols-[62%]
          md:auto-cols-[45%]
          lg:auto-cols-[33.333%]
          xl:auto-cols-[345px]
          gap-6
          overflow-x-auto overflow-y-visible
          snap-x snap-mandatory snap-always scroll-smooth
          touch-pan-x select-none overscroll-x-contain
          focus:outline-none focus-visible:outline-none
          [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        "
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="snap-start">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="aspect-[4/3] rounded-xl bg-neutral-100 animate-pulse" />
                <div className="mt-3 h-4 w-1/2 bg-neutral-100 rounded animate-pulse" />
                <div className="mt-2 h-5 w-1/3 bg-neutral-100 rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : (
          items.map((item, idx) => (
            <div key={item.id} ref={idx === 0 ? firstItemRef : null} className="snap-start">
              <Card
                item={item}
                qty={qty[item.id] ?? 1}
                onDec={() => dec(item.id)}
                onInc={() => inc(item.id)}
                onToggleWish={() => toggleWish(item)}   // pass full item here
                wished={wish.has(item.id)}
                onOrder={() => orderNow(item)}
                oos={!!oos[item.id]}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
