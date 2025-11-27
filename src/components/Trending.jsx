// src/pages/Trending.jsx
import React, { useEffect, useMemo, useState } from "react";


// Normalize backend -> UI
function adapt(cards) {
  const list = Array.isArray(cards) ? cards : [];
  return list
    .filter((c) => c?.visible !== false)
    .map((c, i) => {
      const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
      return {
        id: c.id || `tr-${i}`,
        title: String(c.title || c.brand || "Untitled"),
        brand: String(c.brand || ""),
        desc: String(c.desc || ""),
        img: String(c.img || ""),
        price: num(c.price, 0),
        unit: String(c.unit || "1 UNIT"),
        rating: num(c.rating, 0),
        discount: num(c.discount, 0),
        category: String(c.category || "ALL"),
        qty: num(c.qty, 0),        // stock for caps, badges
        order: num(c.order, i + 1) // stable order from admin
      };
    });
}

// Check requested qty against stock without mutating (new helper)
async function checkTrendingQty(productId, units) {
  try {
    const res = await fetch("/api/trending/check-qty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId, qty: units }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { outOfStock: false, stock: 0, cappedQty: units };
    }
    return {
      outOfStock: !!data.outOfStock,
      stock: Number.isFinite(Number(data.stock)) ? Number(data.stock) : 0,
      cappedQty: Number.isFinite(Number(data.cappedQty)) ? Number(data.cappedQty) : units,
    };
  } catch {
    // If endpoint missing, fall back to no OOS flag so UX still works
    return { outOfStock: false, stock: 0, cappedQty: units };
  }
}

// Decrement trending stock (server)
async function placeOrder({ id, qty }) {
  const res = await fetch("/api/trending/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, qty }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Order failed ${res.status}`);
  // { ok, id, qty } -> qty is remaining stock
  return data;
}

export default function Trending() {
  const [title, setTitle] = useState("Trending Products");
  const [items, setItems] = useState([]);
  const [qtyMap, setQtyMap] = useState({});
  const [wish, setWish] = useState(() => {
    try {
      const raw = localStorage.getItem("wish@trending");
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem("wish@trending", JSON.stringify(Array.from(wish)));
    } catch {}
  }, [wish]);

  // Per-item out-of-stock map (true when requested qty > stock or stock<=0)
  const [oos, setOOS] = useState({});

  // Fetch latest trending from admin-saved JSON
  useEffect(() => {
    const ctrl = new AbortController();
    const signal = ctrl.signal;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`/api/trending?ts=${Date.now()}`, { cache: "no-store", signal });
        if (!res.ok) throw new Error(`GET /api/trending ${res.status}`);
        const data = await res.json();
        setTitle(String(data?.title || "Trending Products"));
        const normalized = adapt(data?.cards);
        // stable order
        normalized.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(normalized);
        setQtyMap(Object.fromEntries(normalized.map((p) => [p.id, 1])));
        setOOS(Object.fromEntries(normalized.map((p) => [p.id, Number(p.qty) <= 0])));
      } catch (e) {
        if (e?.name === "AbortError") return;
        setErr(e?.message || "Failed to load");
        setItems([]);
        setQtyMap({});
        setOOS({});
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // Dynamic tabs from admin categories
  const TABS = useMemo(() => {
    const set = new Set(items.map((p) => p.category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [items]);

  const [active, setActive] = useState("ALL");
  const filtered = useMemo(
    () => (active === "ALL" ? items : items.filter((p) => p.category === active)),
    [active, items]
  );

  // Helpers to update qty and compute OOS via backend check
  const setQtyAndCheck = async (id, nextQty) => {
    setQtyMap((q) => ({ ...q, [id]: nextQty }));
    const res = await checkTrendingQty(id, nextQty);
    setOOS((m) => ({ ...m, [id]: !!res.outOfStock }));
  };

  const dec = (id) => setQtyAndCheck(id, Math.max(1, (qtyMap[id] || 1) - 1));
  // IMPORTANT: remove stock clamp; allow increasing beyond stock
  const inc = (id) => setQtyAndCheck(id, (qtyMap[id] || 1) + 1);

  const toggleWish = (id) =>
    setWish((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // Stock-aware order action with pre-check
  const orderNow = async (item) => {
    const wanted = qtyMap[item.id] ?? 1;

    // Pre-check to allow UI > stock but flag OOS
    const check = await checkTrendingQty(item.id, wanted);
    if (check.outOfStock) {
      setOOS((m) => ({ ...m, [item.id]: true }));
      return alert(`Out of Stock (stock: ${check.stock})`);
    }

    try {
      const result = await placeOrder({ id: item.id, qty: wanted }); // decrement on server

      // Update UI stock from server truth
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, qty: result.qty } : p)));

      // After placing order, re-check current desired qty to refresh OOS badge
      const postCheck = await checkTrendingQty(item.id, qtyMap[item.id] ?? 1);
      setOOS((m) => ({ ...m, [item.id]: !!postCheck.outOfStock }));

      alert(`Order placed for ${wanted} x ${item.title}. Remaining stock: ${result.qty}`);
    } catch (e) {
      alert(e?.message || "Order failed");
    }
  };

  return (
    <section className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[22px] sm:text-2xl font-semibold leading-tight">{title}</h2>
          <div className="flex items-center gap-8">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={`uppercase tracking-wide text-xs sm:text-sm pb-2 border-b-2 ${
                  active === t
                    ? "border-[#efd808] text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
                type="button"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 h-px w-full bg-neutral-100" />
      </div>

      {loading ? (
        <div className="text-sm text-neutral-600">Loading...</div>
      ) : err ? (
        <div className="text-sm text-rose-600">{err}</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => {
            const q = qtyMap[item.id] ?? 1;
            const isOOS = !!oos[item.id] || Number(item.qty) <= 0;
            return (
              <article
                key={item.id}
                className="relative rounded-2xl bg-white ring-1 ring-neutral-100 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
              >
                <div className="relative p-4">
                  {!!item.discount && (
                    <span className="absolute left-4 top-4 rounded-md bg-green-100 text-green-700 text-xs font-semibold px-2 py-1">
                      -{item.discount}%
                    </span>
                  )}
                  {isOOS && (
                    <span className="absolute left-4 top-4 rounded-md bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-1">
                      Out of Stock
                    </span>
                  )}

                  {/* Wishlist button fixed */}
                  <button
                    type="button"
                    aria-label={wish.has(item.id) ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={wish.has(item.id)}
                    onClick={(e) => { e.stopPropagation(); toggleWish(item.id); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWish(item.id);
                      }
                    }}
                    className="absolute right-4 top-4 z-10 h-10 w-10 grid place-items-center rounded-full bg-white/90 ring-1 ring-neutral-200 hover:bg-white cursor-pointer"
                  >
                    {wish.has(item.id) ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-rose-500 stroke-rose-500">
                        <path d="M12 21s-7.434-4.42-9.428-8.54C1.57 9.68 3.26 6.5 6.6 6.5c2.04 0 3.07 1.06 3.9 2.18.83-1.12 1.86-2.18 3.9-2.18 3.34 0 5.03 3.18 4.03 5.96C19.434 16.58 12 21 12 21z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-neutral-700">
                        <path fill="none" strokeWidth="1.5" d="M12 21s-7.434-4.42-9.428-8.54C1.57 9.68 3.26 6.5 6.6 6.5c2.04 0 3.07 1.06 3.9 2.18.83-1.12 1.86-2.18 3.9-2.18 3.34 0 5.03 3.18 4.03 5.96C19.434 16.58 12 21 12 21z" />
                      </svg>
                    )}
                  </button>

                  <div className="aspect-[4/3] w-full rounded-xl bg-neutral-50 overflow-hidden grid place-items-center">
                    {/* eslint-disable-next-line */}
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-full w-full object-contain drop-shadow-md"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <h3 className="text-sm text-neutral-500">{item.unit}</h3>
                  <div className="mt-1 flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400">
                      <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.417 8.263L12 19.771 4.583 23.86 6 15.596 0 9.748l8.332-1.73z" />
                    </svg>
                    <span className="text-xs font-medium text-neutral-600">{item.rating}</span>
                  </div>
                  <h2 className="mt-2 line-clamp-2 text-[15px] font-semibold text-neutral-900">{item.title}</h2>
                  <div className="mt-2 text-[22px] font-semibold text-neutral-900">
                    ${Number(item.price).toFixed(2)}
                  </div>
                  <div className="mt-1 text-[12px]">
                    {isOOS ? (
                      <span className="text-rose-600 font-semibold">Out of Stock</span>
                    ) : (
                      <span className="text-neutral-500">{item.qty} in stock</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => dec(item.id)}
                        className="h-8 w-8 grid place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
                        aria-label="Decrease"
                        disabled={q <= 1}
                      >
                        –
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-medium">{q}</span>
                      {/* Allow increment beyond stock; OOS badge handles UX */}
                      <button
                        type="button"
                        onClick={() => inc(item.id)}
                        className="h-8 w-8 grid place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => orderNow(item)}
                      disabled={isOOS}
                      className="text-sm text-[#747474] disabled:opacity-60"
                      title={isOOS ? "Out of Stock" : "Add to Cart"}
                    >
                      Order
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
