import React, { useMemo, useState } from "react";
import { Heart, Star } from "lucide-react";

import Banana from "../img/banana.png";
import Milk from "../img/milk.png";
import Cucumber from "../img/cucumber.png";
import Cookies from "../img/cookies.png";

const IMG = { bananas: Banana, milk: Milk, cucumbers: Cucumber, crackers: Cookies };

const PRODUCTS = [
  { id: 1, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 30, img: IMG.bananas, category: "FRUITS & VEGES" },
  { id: 2, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 30, img: IMG.crackers, category: "SNACKS" },
  { id: 3, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 0,  img: IMG.cucumbers, category: "FRUITS & VEGES" },
  { id: 4, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 0,  img: IMG.milk, category: "JUICES" },
  { id: 5, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 0,  img: IMG.bananas, category: "FRUITS & VEGES" },
  { id: 6, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 0,  img: IMG.crackers, category: "SNACKS" },
  { id: 7, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 0,  img: IMG.cucumbers, category: "FRUITS & VEGES" },
  { id: 8, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 0,  img: IMG.milk, category: "JUICES" },
  { id: 9, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 0,  img: IMG.bananas, category: "FRUITS & VEGES" },
  { id: 10, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 0, img: IMG.crackers, category: "SNACKS" },
];

const TABS = ["ALL", "FRUITS & VEGES", "JUICES"];

function Card({ item, qty, onDec, onInc, onToggleWish, wished }) {
  return (
    <article className="relative rounded-2xl bg-white ring-1 ring-neutral-100 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      {/* Media */}
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
          <Heart size={18} className={wished ? "fill-rose-500 stroke-rose-500" : "stroke-neutral-700"} />
        </button>

        {/* Exact 4:3 image box, centered image */}
        <div className="aspect-[4/3] w-full rounded-xl bg-neutral-50 overflow-hidden grid place-items-center">
          <img
            src={item.img}
            alt={item.title}
            className="h-full w-full object-contain drop-shadow-md"
            loading="lazy"
          />
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4">
        <h3 className="text-sm text-neutral-500">{item.unit}</h3>
        <div className="mt-1 flex items-center gap-1">
          <Star size={14} className="fill-amber-400 stroke-amber-400" />
          <span className="text-xs font-medium text-neutral-600">{item.rating}</span>
        </div>

        <h2 className="mt-2 line-clamp-2 text-[15px] font-semibold text-neutral-900">{item.title}</h2>
        <div className="mt-2 text-[22px] font-semibold text-neutral-900">${item.price.toFixed(2)}</div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDec}
              className="h-8 w-8 grid place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
              aria-label="Decrease"
            >
              –
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-medium">{qty}</span>
            <button
              type="button"
              onClick={onInc}
              className="h-8 w-8 grid place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
              aria-label="Increase"
            >
              +
            </button>
          </div>

          <button type="button" className="text-sm text-[#747474]">Add to Cart</button>
        </div>
      </div>
    </article>
  );
}

export default function TrendingProducts() {
  const [active, setActive] = useState("ALL");
  const [qty, setQty] = useState(() => Object.fromEntries(PRODUCTS.map(p => [p.id, 1])));
  const [wish, setWish] = useState(() => new Set());

  const filtered = useMemo(() => (active === "ALL" ? PRODUCTS : PRODUCTS.filter(p => p.category === active)), [active]);

  const dec = (id) => setQty(q => ({ ...q, [id]: Math.max(1, (q[id] || 1) - 1) }));
  const inc = (id) => setQty(q => ({ ...q, [id]: Math.min(99, (q[id] || 1) + 1) }));
  const toggleWish = (id) => setWish(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <section className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header + tabs like screenshot */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[22px] sm:text-2xl font-semibold leading-tight">Trending Products</h2>
          <div className="flex items-center gap-8">
            {TABS.map(t => (
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

        {/* faint divider under the tabs (matches screenshot) */}
        <div className="mt-3 h-px w-full bg-neutral-100" />
      </div>

      {/* Grid: 1/2/3/4/5 columns */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map(item => (
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
    </section>
  );
}
