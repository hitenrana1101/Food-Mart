// src/pages/TrendingProducts.jsx (replace PRODUCTS usage)
import React, { useEffect, useMemo, useState } from "react";
import { Heart, Star } from "lucide-react";

function adaptTrendingToProducts(cards) {
  // Map backend cards -> UI product model with sensible defaults
  return cards
    .filter((c) => c.visible)
    .map((c, i) => ({
      id: c.id || `tr-${i}`,
      title: c.title || c.brand || "Untitled",
      price: 18, // default or compute elsewhere
      unit: "1 UNIT",
      rating: 4.5,
      discount: 0,
      img: c.img || "",
      category: "ALL",
    }));
}

export default function TrendingProducts() {
  const [active, setActive] = useState("ALL");
  const [items, setItems] = useState([]);
  const [qty, setQty] = useState({});
  const [wish, setWish] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/trending?ts=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        const adapted = adaptTrendingToProducts(Array.isArray(data.cards) ? data.cards : []);
        setItems(adapted);
        setQty(Object.fromEntries(adapted.map((p) => [p.id, 1])));
      } catch (e) {
        if (!alive) return;
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const TABS = ["ALL"]; // extend if you add categories later

  const filtered = useMemo(
    () => (active === "ALL" ? items : items.filter((p) => p.category === active)),
    [active, items]
  );

  const dec = (id) =>
    setQty((q) => ({ ...q, [id]: Math.max(1, (q[id] || 1) - 1) }));

  const inc = (id) =>
    setQty((q) => ({ ...q, [id]: Math.min(99, (q[id] || 1) + 1) }));

  const toggleWish = (id) =>
    setWish((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <section className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[22px] sm:text-2xl font-semibold leading-tight">Trending Products</h2>
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
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <Card
              key={item.id}
              item={item}
              qty={qty[item.id] ?? 1}
              onDec={() => dec(item.id)}
              onInc={() => inc(item.id)}
              onToggleWish={() => toggleWish(item.id)}
              wished={wish.has(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Card({ item, qty, onDec, onInc, onToggleWish, wished }) {
  return (
    <article className="relative rounded-2xl bg-white ring-1 ring-neutral-100 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="relative p-4">
        {!!item.discount && (
          <span className="absolute left-4 top-4 rounded-md bg-green-100 text-green-700 text-xs font-semibold px-2 py-1">
            -{item.discount}%
          </span>
        )}
        <button
          onClick={onToggleWish}
          className="absolute right-4 top-4 h-10 w-10 grid place-items-center rounded-full bg-white/90 ring-1 ring-neutral-200 hover:bg-white"
          aria-label="Add to wishlist"
          type="button"
        >
          {/* simple heart */}
          <svg
            viewBox="0 0 24 24"
            className={wished ? "h-4 w-4 fill-rose-500 stroke-rose-500" : "h-4 w-4 stroke-neutral-700"}
          >
            <path d="M12 21s-7.434-4.42-9.428-8.54C1.57 9.68 3.26 6.5 6.6 6.5c2.04 0 3.07 1.06 3.9 2.18.83-1.12 1.86-2.18 3.9-2.18 3.34 0 5.03 3.18 4.03 5.96C19.434 16.58 12 21 12 21z" />
          </svg>
        </button>
        <div className="aspect-[4/3] w-full rounded-xl bg-neutral-50 overflow-hidden grid place-items-center">
          {/* eslint-disable-next-line */}
          <img src={item.img} alt={item.title} className="h-full w-full object-contain drop-shadow-md" loading="lazy" />
        </div>
      </div>

      <div className="px-4 pb-4">
        <h3 className="text-sm text-neutral-500">{item.unit}</h3>
        <div className="mt-1 flex items-center gap-1">
          {/* simple star */}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400">
            <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.417 8.263L12 19.771 4.583 23.86 6 15.596 0 9.748l8.332-1.73z" />
          </svg>
          <span className="text-xs font-medium text-neutral-600">{item.rating}</span>
        </div>
        <h2 className="mt-2 line-clamp-2 text-[15px] font-semibold text-neutral-900">{item.title}</h2>
        <div className="mt-2 text-[22px] font-semibold text-neutral-900">${item.price.toFixed(2)}</div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onDec} className="h-8 w-8 grid place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100" aria-label="Decrease">–</button>
            <span className="min-w-[1.5rem] text-center text-sm font-medium">{qty}</span>
            <button type="button" onClick={onInc} className="h-8 w-8 grid place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100" aria-label="Increase">+</button>
          </div>
          <button type="button" className="text-sm text-[#747474]">Add to Cart</button>
        </div>
      </div>
    </article>
  );
}
