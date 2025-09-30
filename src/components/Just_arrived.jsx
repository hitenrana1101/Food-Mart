// src/pages/PopularAndArrived.jsx
import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";

// API adapters
async function fetchPopular() {
  const res = await fetch(`/api/popular?ts=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/popular ${res.status}`);
  const data = await res.json();
  const cards = Array.isArray(data?.cards) ? data.cards : [];
  return cards
    .filter((c) => c.visible !== false)
    .slice(0, 8)
    .map((c, i) => ({
      id: c.id || `pop-${i}`,
      title: c.title || c.brand || "Untitled",
      img: c.img || "",
      unit: c.unit || "1 UNIT",
      price: Number.isFinite(Number(c.price)) ? Number(c.price) : 18,
      rating: Number.isFinite(Number(c.rating)) ? Number(c.rating) : 4.5,
      discount: Number.isFinite(Number(c.discount)) ? Number(c.discount) : 0,
    }));
}

async function fetchArrived() {
  const res = await fetch(`/api/new-arrived?ts=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/new-arrived ${res.status}`);
  const data = await res.json();
  const cards = Array.isArray(data?.cards) ? data.cards : [];
  return cards
    .filter((c) => c.visible !== false)
    .slice(0, 8)
    .map((c, i) => ({
      id: c.id || `arr-${i}`,
      title: c.title || c.brand || "Untitled",
      img: c.img || "",
      unit: c.unit || "1 UNIT",
      price: Number.isFinite(Number(c.price)) ? Number(c.price) : 18,
      rating: Number.isFinite(Number(c.rating)) ? Number(c.rating) : 4.5,
      discount: Number.isFinite(Number(c.discount)) ? Number(c.discount) : 0,
    }));
}

// Card
function Card({ item, qty, onDec, onInc, onToggleWish, wished }) {
  return (
    <article className="relative rounded-2xl border border-neutral-200 bg-white shadow-sm transition duration-200 hover:shadow-2xl hover:-translate-y-0.5">
      <div className="relative p-4">
        {item.discount > 0 && (
          <span className="absolute left-4 top-4 rounded-md bg-green-100 text-green-700 text-xs font-semibold px-2 py-1">
            -{item.discount}%
          </span>
        )}
        <button
          onClick={onToggleWish}
          className="absolute right-4 top-4 h-9 w-9 grid place-items-center rounded-full bg-white/90 ring-1 ring-neutral-200 hover:bg-white"
          aria-label="Add to wishlist"
          type="button"
        >
          <Heart size={18} className={wished ? "fill-rose-500 stroke-rose-500" : "stroke-neutral-700"} />
        </button>
        <div className="aspect-[4/3] w-full rounded-xl bg-neutral-50 overflow-hidden grid place-items-center">
          {/* eslint-disable-next-line */}
          <img src={item.img} alt={item.title} className="h-full w-full object-contain" loading="lazy" />
        </div>
      </div>

      <div className="px-4 pb-4">
        <h2 className="mt-2 line-clamp-2 text-[16px] font-semibold w-[150px] font-sans text-[#333333]">
          {item.title}
        </h2>
        <div className="flex items-center gap-2">
          <h3 className="text-sm text-neutral-500">{item.unit}</h3>
          <div className="mt-1 flex items-center gap-1">
            <Star size={14} className="fill-amber-400 stroke-amber-400" />
            <span className="text-sm items-center font-medium text-neutral-600">{item.rating}</span>
          </div>
        </div>
        <div className="mt-2 text-[22px] font-semibold text-[#333333]">${Number(item.price).toFixed(2)}</div>
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

// Row
function Row({ title, items, scrollerRef, firstCardRef, onArrowLeft, onArrowRight, qty, dec, inc, wish, toggleWish }) {
  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-neutral-600 hover:text-neutral-900">View All Categories →</span>
          <div className="flex items-center">
            <button type="button" onClick={onArrowLeft} className="rounded-md bg-neutral-100 hover:bg-neutral-200 p-2" aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={onArrowRight} className="ml-2 rounded-md bg-neutral-100 hover:bg-neutral-200 p-2" aria-label="Next">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} carousel`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); onArrowRight(); }
          if (e.key === "ArrowLeft")  { e.preventDefault(); onArrowLeft(); }
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            e.currentTarget.scrollBy({ left: e.deltaY, behavior: "smooth" });
          }
        }}
        className="
          grid grid-flow-col
          [--gap:24px] gap-[var(--gap)]
          auto-cols-[calc((100%_-_var(--gap))/2)]
          sm:auto-cols-[calc((100%_-_var(--gap)*2)/3)]
          md:auto-cols-[calc((100%_-_var(--gap)*3)/4)]
          lg:auto-cols-[calc((100%_-_var(--gap)*4)/5)]
          xl:auto-cols-[calc((100%_-_var(--gap)*5)/6)]
          overflow-x-auto overflow-y-visible
          snap-x snap-mandatory [scroll-snap-stop:always] scroll-smooth
          overscroll-x-contain overscroll-y-none
          touch-pan-x select-none
          [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        "
      >
        {items.map((item, idx) => (
          <div key={item.id} ref={idx === 0 ? firstCardRef : null} className="snap-start">
            <Card
              item={item}
              qty={qty[item.id] ?? 1}
              onDec={() => dec(item.id)}
              onInc={() => inc(item.id)}
              onToggleWish={() => toggleWish(item.id)}
              wished={wish.has(item.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// Page
export default function PopularAndArrived() {
  const [popular, setPopular] = useState([]);
  const [arrived, setArrived] = useState([]);
  const [loading, setLoading] = useState(true);

  const [qty, setQty] = useState({});
  const [wish, setWish] = useState(() => new Set());

  const popRef = useRef(null);
  const arrRef = useRef(null);
  const firstPopRef = useRef(null);
  const firstArrRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [p, a] = await Promise.all([fetchPopular(), fetchArrived()]);
        if (!alive) return;
        setPopular(p);
        setArrived(a);
        setQty(Object.fromEntries([...p, ...a].map((x) => [x.id, 1])));
      } catch {
        if (!alive) return;
        setPopular([]);
        setArrived([]);
        setQty({});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    let chPop, chArr;

    async function reloadPopular() {
      try {
        const p = await fetchPopular();
        if (!alive) return;
        setPopular(p);
        setQty((q) => ({ ...Object.fromEntries([...p, ...arrived].map((x) => [x.id, q[x.id] ?? 1])) }));
      } catch {}
    }
    async function reloadArrived() {
      try {
        const a = await fetchArrived();
        if (!alive) return;
        setArrived(a);
        setQty((q) => ({ ...Object.fromEntries([...popular, ...a].map((x) => [x.id, q[x.id] ?? 1])) }));
      } catch {}
    }

    try {
      chPop = new BroadcastChannel("popular");
      chPop.onmessage = (ev) => { if (ev?.data?.type === "updated") reloadPopular(); };
    } catch {}
    try {
      chArr = new BroadcastChannel("just-arrived");
      chArr.onmessage = (ev) => { if (ev?.data?.type === "updated") reloadArrived(); };
    } catch {}
    const onStorage = (e) => {
      if (e.key === "popular-updated") reloadPopular();
      if (e.key === "just-arrived-updated") reloadArrived();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      alive = false;
      try { chPop && chPop.close(); } catch {}
      try { chArr && chArr.close(); } catch {}
      window.removeEventListener("storage", onStorage);
    };
  }, [popular, arrived]);

  const getStep = useCallback((scroller, firstCard) => {
    if (!scroller || !firstCard) return 0;
    const gap = parseFloat(getComputedStyle(scroller).columnGap || "0") || 0;
    const width = firstCard.getBoundingClientRect().width;
    return Math.round(width + gap);
  }, []);

  const scrollByOne = (scroller, firstCard, dir) => {
    const step = getStep(scroller, firstCard);
    if (!step) return;
    scroller.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });
  };

  const popLeft = () => { scrollByOne(popRef.current, firstPopRef.current, "left"); scrollByOne(arrRef.current, firstArrRef.current, "left"); };
  const popRight = () => { scrollByOne(popRef.current, firstPopRef.current, "right"); scrollByOne(arrRef.current, firstArrRef.current, "right"); };
  const arrLeft = () => { popLeft(); };
  const arrRight = () => { popRight(); };

  useEffect(() => {
    const makeObserver = (scroller, firstCard) => {
      if (!scroller) return null;
      const ro = new ResizeObserver(() => {
        const step = getStep(scroller, firstCard);
        const idx = step ? Math.round(scroller.scrollLeft / step) : 0;
        scroller.scrollTo({ left: idx * step, behavior: "auto" });
      });
      ro.observe(scroller);
      return ro;
    };
    const ro1 = makeObserver(popRef.current, firstPopRef.current);
    const ro2 = makeObserver(arrRef.current, firstArrRef.current);
    return () => { ro1?.disconnect(); ro2?.disconnect(); };
  }, [getStep]);

  const dec = (id) => setQty((q) => ({ ...q, [id]: Math.max(1, (q[id] || 1) - 1) }));
  const inc = (id) => setQty((q) => ({ ...q, [id]: Math.min(99, (q[id] || 1) + 1) }));
  const toggleWish = (id) => setWish((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="w-full">
      {loading ? (
        <div className="px-4 py-10 text-sm text-neutral-600">Loading...</div>
      ) : (
        <>
          <Row
            title="Most popular products"
            items={popular}
            scrollerRef={popRef}
            firstCardRef={firstPopRef}
            onArrowLeft={popLeft}
            onArrowRight={popRight}
            qty={qty}
            dec={dec}
            inc={inc}
            wish={wish}
            toggleWish={toggleWish}
          />
          <Row
            title="Just arrived"
            items={arrived}
            scrollerRef={arrRef}
            firstCardRef={firstArrRef}
            onArrowLeft={arrLeft}
            onArrowRight={arrRight}
            qty={qty}
            dec={dec}
            inc={inc}
            wish={wish}
            toggleWish={toggleWish}
          />
        </>
      )}
    </div>
  );
}
