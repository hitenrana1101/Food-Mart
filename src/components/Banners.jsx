import React from "react";
import poster1 from "../img/poster.png";
import poster2 from "../img/poster2.png";

function BannerCard({ bgTint, img, kicker, title, desc, buttonLabel = "SHOW NOW" }) {
  return (
    <article
      className={`relative isolate overflow-hidden rounded-[24px] ${bgTint} min-h-[200px] sm:min-h-[240px] lg:min-h-[300px]`}
    >
      {/* Right-side background image (solid bg, no gradient) */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-y-0 right-0
          w-[40%] sm:w-[42%] lg:w-[45%]
          bg-no-repeat bg-right bg-contain
        "
        style={{ backgroundImage: `url(${img})` }}
      />

      {/* Left content */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-12 max-w-[46ch]">
        <p className="text-[#ffc43f] text-[16px] sm:text-2xl font-sans font-semibold">
          {kicker}
        </p>

        <h2 className="mt-2 text-[#222222] text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
          {title}
        </h2>

        <p className="mt-4 text-[#64748b] text-[16px] sm:text-lg">
          {desc}
        </p>

        <a
          href="#"
          className="
            inline-flex mt-6 h-11 items-center justify-center
            rounded-xl bg-[#111827] px-6 text-white font-medium
            shadow-sm hover:opacity-90 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-black
          "
        >
          {buttonLabel}
        </a>
      </div>
    </article>
  );
}

export default function Banners() {
  return (
    <section className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 my-10">
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        <BannerCard
          bgTint="bg-[#fdeceb]"
          img={poster1}
          kicker="Upto 25% Off"
          title="Luxa Dark Chocolate"
          desc="Very tasty & creamy vanilla flavour creamy muffins"
          buttonLabel="SHOW NOW"
        />

        <BannerCard
          bgTint="bg-[#e9f5ff]"
          img={poster2}
          kicker="Upto 25% Off"
          title="Creamy Muffins"
          desc="Very tasty & creamy vanilla flavour creamy muffins."
          buttonLabel="SHOW NOW"
        />
      </div>
    </section>
  );
}
