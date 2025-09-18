import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import images (keep assets inside src/, paths relative to this file)
import img1 from "../img/thumb.jpg";
import img2 from "../img/thumb2.jpg";
import img3 from "../img/thumb3.jpg";
import img4 from "../img/thumb4.jpg";
import img5 from "../img/thumb.jpg";
import img6 from "../img/thumb2.jpg";

const BRANDS = [
  { id: 1, brand: "Amber Jar", title: "Honey best", subtitle: "nectar you wish to get", image: img1 },
  { id: 2, brand: "Amber Jar", title: "Honey best", subtitle: "nectar you wish to get", image: img2 },
  { id: 3, brand: "Amber Jar", title: "Honey best", subtitle: "nectar you wish to get", image: img3 },
  { id: 4, brand: "Amber Jar", title: "Honey best", subtitle: "nectar you wish to get", image: img4 },
  { id: 5, brand: "Amber Jar", title: "Honey best", subtitle: "nectar you wish to get", image: img5 },
  { id: 6, brand: "Amber Jar", title: "Honey best", subtitle: "nectar you wish to get", image: img6 },
];

export default function NewlyArrivedBrands() {
  const scrollerRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Measure 1-card step dynamically (card width + gap)
  const getStep = () => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const firstCard = el.querySelector("article");
    if (!firstCard) return 0;
    const styles = window.getComputedStyle(el);
    const gapX = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return firstCard.clientWidth + gapX;
  };

  function updateDisabled() {
    const el = scrollerRef.current;
    if (!el) return;
    const start = el.scrollLeft <= 0;
    const end = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth;
    setAtStart(start);
    setAtEnd(end);
  }

  function go(dir) {
    const el = scrollerRef.current;
    if (!el) return;
    const step = getStep();
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateDisabled();
    const onScroll = () => updateDisabled();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateDisabled);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateDisabled);
    };
  }, []);

  return (
    <section className="mx-auto mt-8 w-full px-4 py-10 xl:max-w-[1800px] 2xl:max-w-[1920px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl lg:text-[34px] tracking-tight">Newly Arrived Brands</h2>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline font-semibold hover:text-[#222222] text-slate-500">View All Categories →</span>
          <button
            onClick={() => go(-1)}
            disabled={atStart}
            aria-label="Scroll left"
            className="size-10 rounded-[10px] border border-slate-200 hover:bg-amber-400 bg-[#e2e2e2] grid place-items-center
             disabled:opacity-35"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go(1)}
            disabled={atEnd}
            aria-label="Scroll right"
            className="size-10 rounded-[10px] border border-slate-200 hover:bg-amber-400 bg-[#e2e2e2] grid place-items-center disabled:opacity-35"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Scroller */}
      <div
        ref={scrollerRef}
        className="
          flex overflow-x-auto gap-8 py-4
          snap-x snap-mandatory scroll-smooth overscroll-x-contain
          scroll-px-4
          [-ms-overflow-style:none] [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
        aria-label="Brand cards scroller"
      >
        {BRANDS.map((b) => (
          <article
            key={b.id}
            className="
              snap-start snap-always shrink-0
              basis-[calc((100%-32px)/2)]           /* 2 per view @ base */
              md:basis-[calc((100%-64px)/3)]        /* 3 per view @ md */
              lg:basis-[calc((100%-96px)/4)]        /* 4 per view @ lg */
              h-auto lg:h-[144px]
              rounded-2xl bg-white p-5 grid
              grid-cols-1 md:grid-cols-[108px_1fr] items-start md:items-center gap-3 md:gap-4
              shadow-[0_12px_28px_rgba(0,0,0,0.12)]
            "
          >
            {/* Image (top on mobile, left on md+) */}
            <div className="w-full md:w-[108px] h-[160px] md:h-[108px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              {b.image ? (
                <img
                  src={b.image}
                  alt={`${b.brand} - ${b.title}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-white to-slate-100" aria-hidden="true" />
              )}
            </div>

            {/* Text (below on mobile, right on md+) */}
            <div className="min-w-0 mt-3 md:mt-0">
              <div className="text-[#747474] mb-1 truncate">{b.brand}</div>
              <div className="text-[#747474] font-sans font-semibold text-[20px] leading-6 truncate">
                {b.title}
              </div>
              <div className="text-[#747474] text-[20px] font-sans font-semibold leading-snug line-clamp-2">
                {b.subtitle}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
