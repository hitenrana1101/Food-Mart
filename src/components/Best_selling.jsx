// src/pages/BestSellingProducts.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";

// Optional: local fallback images if API items lack images
// import Banana from "../img/banana.png";
// import Tomato from "../img/tomatoe.png";
// import Ketchup from "../img/Ketchup.png";

async function fetchBestSelling() {
  const res = await fetch(`/api/best-selling?ts=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/best-selling ${res.status}`);
  const data = await res.json();
  const cards = Array.isArray(data?.cards) ? data.cards : [];
  return cards
    .filter((c) => c.visible !== false)
    .slice(0, 8)
    .map((c, i) => ({
      id: c.id || `bs-${i}`,
      title: c.title || c.brand || "Untitled",
      img: c.img || "",
      unit: c.unit || "1 UNIT",
      price: Number.isFinite(Number(c.price)) ? Number(c.price) : 18,
      rating: Number.isFinite(Number(c.rating)) ? Number(c.rating) : 4.5,
      discount: Number.isFinite(Number(c.discount)) ? Number(c.discount) : 0,
    }));
}

function Card({ item, qty, onDec, onInc, onToggleWish, wished }) {
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

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onDec} className="h-7 w-7 grid place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100" aria-label="Decrease">–</button>
            <span className="min-w-[1.5rem] text-center text-sm font-medium">{qty}</span>
            <button type="button" onClick={onInc} className="h-7 w-7 grid place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100" aria-label="Increase">+</button>
          </div>
          <button type="button" className="text-sm text-[#747474]">Add to Cart</button>
        </div>
      </div>
    </article>
  );
}

export default function BestSellingProducts() {
  const [items, setItems] = useState([]);
  const [qty, setQty] = useState({});
  const [wish, setWish] = useState(() => new Set());
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [loading, setLoading] = useState(true);

  const scrollerRef = useRef(null);
  const firstItemRef = useRef(null);

  // Load from API
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBestSelling();
        if (!alive) return;
        setItems(data);
        setQty(Object.fromEntries(data.map((p) => [p.id, 1])));
      } catch (e) {
        if (!alive) return;
        setItems([]); // keep empty if API fails
        setQty({});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const dec = (id) => setQty((q) => ({ ...q, [id]: Math.max(1, (q[id] || 1) - 1) }));
  const inc = (id) => setQty((q) => ({ ...q, [id]: Math.min(99, (q[id] || 1) + 1) }));
  const toggleWish = (id) => setWish((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // One-card step calc
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

  const scrollToIndex = useCallback((node, index, behavior = "smooth") => {
    if (!node) return;
    const step = getStep(node);
    const maxLeft = node.scrollWidth - node.clientWidth;
    const target = Math.max(0, Math.min(index * step, maxLeft));
    node.scrollTo({ left: target, behavior });
  }, [getStep]);

  const scrollByOne = useCallback((dir) => {
    const node = scrollerRef.current;
    if (!node) return;
    const step = getStep(node);
    const currentIndex = step ? Math.round(node.scrollLeft / step) : 0;
    const nextIndex = dir === "right" ? currentIndex + 1 : currentIndex - 1;
    scrollToIndex(node, nextIndex);
  }, [getStep, scrollToIndex]);

  // Keep snapping stable
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
    return () => { node.removeEventListener("scroll", onScroll); ro.disconnect(); };
  }, [getStep, scrollToIndex, updateButtons]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); scrollByOne("right"); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); scrollByOne("left"); }
  };

  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 xl:max-w-[1452px]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-semibold">Best selling products</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#747474] hover:text-neutral-900">View All Categories →</span>
          <div className="flex items-center">
            <button type="button" onClick={() => scrollByOne("left")} aria-label="Previous" disabled={!canLeft} className="rounded-md bg-neutral-100 hover:bg-neutral-200 p-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => scrollByOne("right")} aria-label="Next" disabled={!canRight} className="ml-2 rounded-md bg-neutral-100 hover:bg-neutral-200 p-2 disabled:opacity-40 disabled:cursor-not-allowed">
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
        onKeyDown={onKeyDown}
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
                onToggleWish={() => toggleWish(item.id)}
                wished={wish.has(item.id)}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
