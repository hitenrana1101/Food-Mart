import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Banana from "../img/banana.png";
import Tomato from "../img/tomatoe.png";
import Ketchup from "../img/Ketchup.png";

const IMG = { bananas: Banana, tomato: Tomato, ketchup: Ketchup };
const PRODUCTS = [
  { id: 1, price: 18, unit: "1 UNIT", title: "Sunstar Fresh Melon Juice", rating: 4.5, discount: 15, img: IMG.tomato },
  { id: 2, price: 18, unit: "1 UNIT", title: "Sunstar Fresh Melon Juice", rating: 4.5, discount: 15, img: IMG.ketchup },
  { id: 3, price: 18, unit: "1 UNIT", title: "Sunstar Fresh Melon Juice", rating: 4.5, discount: 15, img: IMG.bananas },
  { id: 4, price: 18, unit: "1 UNIT", title: "Sunstar Fresh Melon Juice", rating: 4.5, discount: 15, img: IMG.bananas },
  { id: 5, price: 18, unit: "1 UNIT", title: "Sunstar Fresh Melon Juice", rating: 4.5, img: IMG.tomato },
  { id: 6, price: 18, unit: "1 UNIT", title: "Sunstar Fresh Melon Juice", rating: 4.5, img: IMG.ketchup },
  { id: 7, price: 18, unit: "1 UNIT", title: "Sunstar Fresh Melon Juice", rating: 4.5, img: IMG.bananas },
  { id: 8, price: 18, unit: "1 UNIT", title: "Sunstar Fresh Melon Juice", rating: 4.5, img: IMG.bananas },
];

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
        <div className="mt-2 text-lg font-semibold text-neutral-900">${item.price.toFixed(2)}</div>

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
  const [qty, setQty] = useState(() => Object.fromEntries(PRODUCTS.map(p => [p.id, 1])));
  const [wish, setWish] = useState(() => new Set());
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const scrollerRef = useRef(null);
  const firstItemRef = useRef(null);
  const items = useMemo(() => PRODUCTS, []);

  const dec = (id) => setQty(q => ({ ...q, [id]: Math.max(1, (q[id] || 1) - 1) }));
  const inc = (id) => setQty(q => ({ ...q, [id]: Math.min(99, (q[id] || 1) + 1) }));
  const toggleWish = (id) => setWish(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // One-card step: first item width + computed column gap
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

  // Keep snapping stable on scroll and on any size change (resize/zoom/layout).
  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const onScroll = () => updateButtons(node);
    node.addEventListener("scroll", onScroll, { passive: true });

    // ResizeObserver reacts to container size changes (including zoom/layout reflow).
    const ro = new ResizeObserver(() => {
      const step = getStep(node);
      const index = step ? Math.round(node.scrollLeft / step) : 0;
      scrollToIndex(node, index, "auto");
      updateButtons(node);
    });
    ro.observe(node);

    // Initial state
    updateButtons(node);

    return () => {
      node.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
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

      {/* GRID track: stable widths and snap */}
      <div
        ref={scrollerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Best selling products carousel"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onWheel={(e) => {
          // Convert vertical wheel into horizontal scrolling
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
        {items.map((item, idx) => (
          <div
            key={item.id}
            ref={idx === 0 ? firstItemRef : null}
            className="snap-start"
          >
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
