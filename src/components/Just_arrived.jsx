// src/pages/PopularAndArrived.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { RiHeartLine, RiHeartFill } from "react-icons/ri";

/* ===== Wishlist utils (localStorage + CustomEvent) ===== */
const WL_KEY = "wishlist";
function wlRead() {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || "[]"); }
  catch { return []; }
}
function wlWrite(next) {
  localStorage.setItem(WL_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("wishlist-change", { detail: next }));
}
function wlAdd(item) {
  const list = wlRead();
  if (!list.some(p => p.id === item.id)) {
    list.push({
      id: item.id,
      name: item.title,               // map title -> name
      price: Number(item.price),
      image: item.img                 // map img -> image
    });
    wlWrite(list);
  }
}
function wlRemove(id) {
  wlWrite(wlRead().filter(p => p.id !== id));
}

/* ===== Helpers: optional stock check endpoints (graceful fallback) ===== */
async function checkPopularQty(id, units) {
  try {
    const res = await fetch("/api/popular/check-qty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, qty: units }),
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

async function checkArrivedQty(id, units) {
  try {
    const res = await fetch("/api/just-arrived/check-qty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, qty: units }),
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
      qty: Number.isFinite(Number(c.qty)) ? Number(c.qty) : null,
    }));
}

async function fetchJustArrived() {
  const res = await fetch(`/api/just-arrived?ts=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/just-arrived ${res.status}`);
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
      qty: Number.isFinite(Number(c.qty)) ? Number(c.qty) : null,
    }));
}

function Card({ item, qty, onDec, onInc, onToggleWish, wished, oos }) {
  return (
    <article className="relative rounded-2xl border border-neutral-200 bg-white shadow-sm transition duration-200 hover:shadow-2xl hover:-translate-y-0.5">
      <div className="relative p-4">
        {item.discount > 0 && (
          <span className="absolute left-4 top-4 rounded-md bg-green-100 text-green-700 text-xs font-semibold px-2 py-1">
            -{item.discount}%
          </span>
        )}
        {oos && (
          <span className="absolute left-4 top-4 rounded-md bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-1">
            Out of Stock
          </span>
        )}
        <button
          onClick={onToggleWish}
          className="absolute right-4 top-4 h-9 w-9 grid place-items-center rounded-full bg-white/90 ring-1 ring-neutral-200 hover:bg-white"
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
        >
          {wished ? (
            <RiHeartFill className="text-rose-600" size={18} />
          ) : (
            <RiHeartLine className="text-neutral-700" size={18} />
          )}
        </button>
        <div className="aspect-[4/3] w-full rounded-xl bg-neutral-50 overflow-hidden grid place-items-center">
          {/* eslint-disable-next-line */}
          <img src={item.img} alt={item.title} className="h-full w-full object-contain" loading="lazy" />
        </div>
      </div>
      <div className="px-4 pb-4">
        <h2 className="mt-2 line-clamp-2 text-[16px] font-semibold w-[150px] font-sans text-[#333333]">{item.title}</h2>
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
            disabled={oos}
            title={oos ? "Out of Stock" : "Add to Cart"}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

function Row({
  title,
  items,
  scrollerRef,
  firstCardRef,
  onArrowLeft,
  onArrowRight,
  qty,
  dec,
  inc,
  wish,
  toggleWish,
  oosMap,
}) {
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
          if (e.key === "ArrowRight") {
            e.preventDefault();
            onArrowRight();
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            onArrowLeft();
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
              onToggleWish={() => toggleWish(item)}
              wished={wish.has(item.id)}
              oos={!!oosMap[item.id]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PopularAndArrived() {
  const [popular, setPopular] = useState([]);
  const [arrived, setArrived] = useState([]);
  const [loading, setLoading] = useState(true);

  const [qty, setQty] = useState({});
  const [wish, setWish] = useState(() => new Set(wlRead().map(p => p.id))); // seed from storage
  const [oos, setOOS] = useState({}); // { [id]: boolean }

  const popRef = useRef(null);
  const arrRef = useRef(null);
  const firstPopRef = useRef(null);
  const firstArrRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [p, a] = await Promise.all([fetchPopular(), fetchJustArrived()]);
        if (!alive) return;
        setPopular(p);
        setArrived(a);
        const initialQty = Object.fromEntries([...p, ...a].map((x) => [x.id, 1]));
        setQty(initialQty);
        const initialOOS = Object.fromEntries([...p, ...a].map((x) => [x.id, false]));
        setOOS(initialOOS);
        // Optional cleanup of wish against current ids
        setWish(prev => {
          const current = new Set(prev);
          const valid = new Set([...p, ...a].map(x => x.id));
          for (const id of Array.from(current)) if (!valid.has(id)) current.delete(id);
          return current;
        });
      } catch {
        if (!alive) return;
        setPopular([]);
        setArrived([]);
        setQty({});
        setOOS({});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Listen for storage (other tabs) and wishlist-change (same tab)
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
    function onWishlistChange(e) {
      const next = Array.isArray(e.detail) ? e.detail : wlRead();
      setWish(new Set(next.map(p => p.id)));
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("wishlist-change", onWishlistChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("wishlist-change", onWishlistChange);
    };
  }, []);

  const setQtyAndCheckPopular = async (id, nextQty) => {
    setQty((q) => ({ ...q, [id]: nextQty }));
    const res = await checkPopularQty(id, nextQty);
    setOOS((m) => ({ ...m, [id]: !!res.outOfStock }));
  };
  const setQtyAndCheckArrived = async (id, nextQty) => {
    setQty((q) => ({ ...q, [id]: nextQty }));
    const res = await checkArrivedQty(id, nextQty);
    setOOS((m) => ({ ...m, [id]: !!res.outOfStock }));
  };

  const decPopular = (id) => setQtyAndCheckPopular(id, Math.max(1, (qty[id] || 1) - 1));
  const incPopular = (id) => setQtyAndCheckPopular(id, (qty[id] || 1) + 1);

  const decArrived = (id) => setQtyAndCheckArrived(id, Math.max(1, (qty[id] || 1) - 1));
  const incArrived = (id) => setQtyAndCheckArrived(id, (qty[id] || 1) + 1);

  // Toggle with persistence
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

  const popLeft = () => {
    const scroller = popRef.current, first = firstPopRef.current;
    const styles = getComputedStyle(scroller);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const width = first?.getBoundingClientRect().width || 0;
    scroller?.scrollBy({ left: -(width + gap), behavior: "smooth" });
  };
  const popRight = () => {
    const scroller = popRef.current, first = firstPopRef.current;
    const styles = getComputedStyle(scroller);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const width = first?.getBoundingClientRect().width || 0;
    scroller?.scrollBy({ left: (width + gap), behavior: "smooth" });
  };
  const arrLeft = () => {
    const scroller = arrRef.current, first = firstArrRef.current;
    const styles = getComputedStyle(scroller);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const width = first?.getBoundingClientRect().width || 0;
    scroller?.scrollBy({ left: -(width + gap), behavior: "smooth" });
  };
  const arrRight = () => {
    const scroller = arrRef.current, first = firstArrRef.current;
    const styles = getComputedStyle(scroller);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const width = first?.getBoundingClientRect().width || 0;
    scroller?.scrollBy({ left: (width + gap), behavior: "smooth" });
  };

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
            dec={decPopular}
            inc={incPopular}
            wish={wish}
            toggleWish={toggleWish}
            oosMap={oos}
          />
          <Row
            title="Just arrived"
            items={arrived}
            scrollerRef={arrRef}
            firstCardRef={firstArrRef}
            onArrowLeft={arrLeft}
            onArrowRight={arrRight}
            qty={qty}
            dec={decArrived}
            inc={incArrived}
            wish={wish}
            toggleWish={toggleWish}
            oosMap={oos}
          />
        </>
      )}
    </div>
  );
}
