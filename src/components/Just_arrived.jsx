import React, { useMemo, useRef, useState, useEffect } from "react";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";

// Local images
import Banana from "../img/banana.png";
import Tomato from "../img/tomatoe.png";
import Ketchup from "../img/ketchup.png";

const IMG = { bananas: Banana, tomato: Tomato, ketchup: Ketchup };

// ----- Card -----
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

        <div className="mt-2 text-[22px] font-semibold text-[#333333]">${item.price.toFixed(2)}</div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDec}
              className="h-7 w-7 grid place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
              aria-label="Decrease"
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

          <button type="button" className="text-sm text-[#747474]">Add to Cart</button>
        </div>
      </div>
    </article>
  );
}

// ----- Row -----
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
}) {
  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-neutral-600 hover:text-neutral-900">View All Categories →</span>
          <div className="flex items-center">
            <button
              type="button"
              onClick={onArrowLeft}
              className="rounded-md bg-neutral-100 hover:bg-neutral-200 p-2"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={onArrowRight}
              className="ml-2 rounded-md bg-neutral-100 hover:bg-neutral-200 p-2"
              aria-label="Next"
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
        aria-label={`${title} carousel`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); onArrowRight(); }
          if (e.key === "ArrowLeft")  { e.preventDefault(); onArrowLeft(); }
        }}
        onWheel={(e) => {
          // Map vertical wheel to horizontal for desktop mice/trackpads
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            e.currentTarget.scrollBy({ left: e.deltaY, behavior: "smooth" });
          }
        }}
        className="
          grid grid-flow-col
          [--gap:24px] gap-[var(--gap)]
          /* exact in-view counts including visible gaps */
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

// ----- Page -----
export default function PopularAndArrived() {
  // Data
  const popular = useMemo(() => [
    { id: 1, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.tomato },
    { id: 2, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.ketchup },
    { id: 3, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.bananas },
    { id: 4, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.bananas },
    { id: 5, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.tomato },
    { id: 6, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.ketchup },
    { id: 7, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.tomato },
    { id: 8, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.ketchup },
  ], []);

  const arrived = useMemo(() => [
    { id: 101, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.ketchup },
    { id: 102, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.tomato },
    { id: 103, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.bananas },
    { id: 104, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.bananas },
    { id: 105, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.ketchup },
    { id: 106, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.tomato },
    { id: 107, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.ketchup },
    { id: 108, title: "Sunstar Fresh Melon Juice", price: 18, unit: "1 UNIT", rating: 4.5, discount: 15, img: IMG.tomato },
  ], []);

  // State
  const [qty, setQty] = useState(() => ({
    ...Object.fromEntries(popular.map(p => [p.id, 1])),
    ...Object.fromEntries(arrived.map(p => [p.id, 1])),
  }));
  const [wish, setWish] = useState(() => new Set());

  const dec = (id) => setQty(q => ({ ...q, [id]: Math.max(1, (q[id] || 1) - 1) }));
  const inc = (id) => setQty(q => ({ ...q, [id]: Math.min(99, (q[id] || 1) + 1) }));
  const toggleWish = (id) => setWish(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Refs
  const popRef = useRef(null);
  const arrRef = useRef(null);
  const firstPopRef = useRef(null);
  const firstArrRef = useRef(null);

  // Measure one-card step from computed column gap + first card width
  const getStep = (scroller, firstCard) => {
    if (!scroller || !firstCard) return 0;
    const gap = parseFloat(getComputedStyle(scroller).columnGap || "0") || 0;
    const width = firstCard.getBoundingClientRect().width;
    return Math.round(width + gap);
  };

  const scrollByOne = (scroller, firstCard, dir) => {
    const step = getStep(scroller, firstCard);
    if (!step) return;
    scroller.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });
  };

  // Sync both rows
  const popLeft = () => { scrollByOne(popRef.current, firstPopRef.current, "left"); scrollByOne(arrRef.current, firstArrRef.current, "left"); };
  const popRight = () => { scrollByOne(popRef.current, firstPopRef.current, "right"); scrollByOne(arrRef.current, firstArrRef.current, "right"); };
  const arrLeft = () => { popLeft(); };
  const arrRight = () => { popRight(); };

  // Keep snap aligned on any size change (zoom/layout/container resize)
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
  }, []);

  return (
    <div className="w-full">
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
    </div>
  );
}
