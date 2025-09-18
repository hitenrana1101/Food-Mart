import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import brocoli from "../img/broccoli.png";
import bread from "../img/bread.png";
import bottle from "../img/bottle.png";
import bottle2 from "../img/bottle2.png";
import legpeace from "../img/leg peace.png";
import hearbal_box from "../img/hearbal_box.png";

const categories = [
  { id: 1, name: "Fruits & Veges", img: brocoli },
  { id: 2, name: "Breads & Sweets", img: bread },
  { id: 3, name: "Fruits & Veges", img: bottle },
  { id: 4, name: "Fruits & Veges", img: bottle2 },
  { id: 5, name: "Fruits & Veges", img: legpeace },
  { id: 6, name: "Fruits & Veges", img: hearbal_box },
  { id: 7, name: "Fruits & Veges", img: brocoli },
  { id: 8, name: "Fruits & Veges", img: brocoli },
  { id: 9, name: "Fruits & Veges", img: brocoli },
  { id: 10, name: "Fruits & Veges", img: brocoli },
  { id: 11, name: "Fruits & Veges", img: brocoli },
  { id: 12, name: "Fruits & Veges", img: brocoli },
];

export default function CategorySection() {
  const scrollerRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  // Measure one step = first item width + grid gap (px)
  const getStep = useCallback((node) => {
    if (!node) return 0;
    const first = node.firstElementChild;
    if (!first) return 0;
    const style = getComputedStyle(node);
    const gapPx = parseFloat(style.columnGap || style.gap || "0") || 0;
    const cardWidth = first.getBoundingClientRect().width;
    return Math.round(cardWidth + gapPx);
  }, []);

  const scrollToIndex = useCallback((node, index, behavior = "smooth") => {
    if (!node) return;
    const step = getStep(node);
    const maxLeft = node.scrollWidth - node.clientWidth;
    const target = Math.max(0, Math.min(index * step, maxLeft));
    node.scrollTo({ left: target, behavior });
  }, [getStep]);

  const updateButtons = useCallback((node) => {
    if (!node) return;
    const tol = 1;
    setCanLeft(node.scrollLeft > tol);
    setCanRight(node.scrollLeft < node.scrollWidth - node.clientWidth - tol);
  }, []);

  const scrollOne = useCallback((dir) => {
    const node = scrollerRef.current;
    if (!node) return;
    const step = getStep(node);
    if (!step) return;
    const currentIndex = Math.round(node.scrollLeft / step);
    const nextIndex = dir === "right" ? currentIndex + 1 : currentIndex - 1;
    scrollToIndex(node, nextIndex);
  }, [getStep, scrollToIndex]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const onScroll = () => updateButtons(node);
    const onResize = () => {
      const step = getStep(node);
      const index = step ? Math.round(node.scrollLeft / step) : 0;
      scrollToIndex(node, index, "auto");
      updateButtons(node);
    };

    node.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      node.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [getStep, scrollToIndex, updateButtons]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); scrollOne("right"); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); scrollOne("left");  }
  };

  return (
    <section className="w-full mx-auto max-w-screen-2xl px-4 md:px-8 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Category</h2>
        <div className="flex items-center gap-2">
          <span className="text-[#747474] cursor-pointer font-semibold hover:text-black hidden sm:inline">
            View All Categories →
          </span>
          <button
            onClick={() => scrollOne("left")}
            type="button"
            aria-label="Scroll left"
            disabled={!canLeft}
            className="p-2 rounded-[10px] bg-[#e4e4e4e5] hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scrollOne("right")}
            type="button"
            aria-label="Scroll right"
            disabled={!canRight}
            className="p-2 rounded-[10px] bg-[#e4e4e4e5] hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Track: 2/3/4/6 per view; snap */}
      <div
        ref={scrollerRef}
        role="region"
        aria-label="Category carousel"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="
          grid grid-flow-col
          auto-cols-[calc((100%_-_24px)/2)]
          sm:auto-cols-[calc((100%_-_24px*2)/3)]
          md:auto-cols-[calc((100%_-_24px*3)/4)]
          lg:auto-cols-[calc((100%_-_24px*5)/6)]
          xl:auto-cols-[calc((100%_-_24px*5)/6)]
          gap-6 mt-4
          overflow-x-auto overflow-y-visible
          scroll-smooth snap-x snap-mandatory snap-always
          touch-pan-x select-none
          [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        "
      >
        {categories.map((cat) => (
          <div key={cat.id} className="snap-start">
            <article className="w-full h-full bg-white rounded-2xl shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-shadow duration-200 hover:shadow-xl flex items-center justify-center">
              <div className="flex flex-col items-center justify-center py-6 px-6">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain mb-3"
                  loading="lazy"
                />
                <p className="text-sm sm:text-base font-sans text-[#222222] font-semibold">{cat.name}</p>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
