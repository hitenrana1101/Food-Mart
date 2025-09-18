// HeroSection.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

import product from "../img/product-thumb-1.png";
import product2 from "../img/product-thumb-2.png";
import banner from "../img/ad-image-1.png";
import banner2 from "../img/ad-image-2.png";
import "../components/Section.css";

export default function HeroSection() {
  return (
    <div className="max-w-[1600px] mx-auto mt-12 px-4 py-0 flex flex-col lg:flex-row gap-6 justify-center">
      {/* LEFT: hero slider (mobile/tabs taller; desktop unchanged) */}
      <div className="w-full lg:w-[870px] bg-[#e6f3fa] rounded-2xl overflow-hidden min-h-[600px] sm:min-h-[780px] lg:h-[665px]">
        <Swiper
          modules={[Pagination, Autoplay]}
          autoplay={{ delay: 30000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="w-full h-full"
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <div className="flex h-full flex-col lg:flex-row lg:items-center">
              {/* Text block */}
              <div className="pl-6 sm:pl-11 pt-8 sm:pt-12 lg:py-12 lg:pl-11">
                <h1 className="text-[#ffc43f] text-2xl sm:text-3xl lg:text-[37px]">100% Natural</h1>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl mt-4 sm:mt-6 font-serif font-semibold max-w-[410px]">
                  Fresh Smoothie & Summer Juice
                </h3>
                <p className="text-[#747474] max-w-[380.5px] text-[16px] mt-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dignissim massa diam elementum.
                </p>
                <p className="border text-[#212529] py-2 my-8 sm:my-10 px-6 rounded-[4px] w-[202px] hover:bg-[#212529] hover:text-white">
                  <a href="#">SHOP COLLECTION</a>
                </p>
              </div>
              {/* Image: below on mobile, right on lg */}
              <img
                src={product}
                alt="Fresh Juice"
                className="object-contain w-44 sm:w-60 h-auto mt-8 self-center order-2
                           lg:order-none lg:mt-0 lg:self-auto lg:w-[298px] lg:mr-7 lg:shrink-0"
              />
            </div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <div className="flex h-full flex-col lg:flex-row lg:items-center">
              <div className="pl-6 sm:pl-11 pt-8 sm:pt-12 lg:py-12 lg:pl-11">
                <h1 className="text-[#ffc43f] text-2xl sm:text-3xl lg:text-[37px]">100% Natural</h1>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl mt-4 sm:mt-6 font-serif font-semibold max-w-[410px]">
                  Fresh Smoothie & Summer Juice
                </h3>
                <p className="text-[#747474] max-w-[380.5px] text-[16px] mt-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dignissim massa diam elementum.
                </p>
                <p className="border text-[#212529] py-2 my-8 sm:my-10 px-6 rounded-[4px] w-[202px] hover:bg-[#212529] hover:text-white">
                  <a href="#">SHOP COLLECTION</a>
                </p>
              </div>
              <img
                src={product}
                alt="Fresh Juice"
                className="object-contain w-44 sm:w-60 h-auto mt-8 self-center order-2
                           lg:order-none lg:mt-0 lg:self-auto lg:w-[298px] lg:mr-7 lg:shrink-0"
              />
            </div>
          </SwiperSlide>

          {/* Slide 3 */}
          <SwiperSlide>
            <div className="flex h-full flex-col lg:flex-row lg:items-center">
              <div className="pl-6 sm:pl-11 pt-8 sm:pt-12 lg:py-12 lg:pl-11">
                <h1 className="text-[#ffc43f] text-2xl sm:text-3xl lg:text-[37px]">100% Natural</h1>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl mt-4 sm:mt-6 font-serif font-semibold max-w-[410px]">
                  Heinz Tomato Ketchup
                </h3>
                <p className="text-[#747474] max-w-[380.5px] text-[16px] mt-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dignissim massa diam elementum.
                </p>
                <p className="border text-[#212529] py-2 my-8 sm:my-10 px-6 rounded-[4px] w-[202px] hover:bg-[#212529] hover:text-white">
                  <a href="#">SHOP COLLECTION</a>
                </p>
              </div>
              <img
                src={product2}
                alt="Fresh Juice"
                className="object-contain w-44 sm:w-60 h-auto mt-8 self-center order-2
                           lg:order-none lg:mt-0 lg:self-auto lg:w-[298px] lg:mr-7 lg:shrink-0"
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      {/* RIGHT: banners (desktop same, small screens slightly taller) */}
      <div className="flex flex-col gap-6 w-full lg:w-auto items-center">
        <div className="relative w-full lg:w-[619px] h-[240px] sm:h-[270px] lg:h-[321.2px] rounded-2xl p-6 flex flex-col justify-center bg-[#efefefeb] overflow-hidden">
          <h3 className="text-2xl sm:text-3xl lg:text-[37px]">20% Off</h3>
          <p className="text-[12px]">SALE</p>
          <p className="font-sans lg:text-[37px] sm:text-lg w-[150px]">Fruits & Vegetables</p>
          <a href="#" className="mt-2 text-[#747474] text-[16px] sm:text-base">Shop Collection →</a>
          <img src={banner} alt="banner-img" className="absolute bottom-0 right-0 w-[120px] sm:w-[180px] lg:w-[300px] h-auto" />
        </div>

        <div className="relative w-full lg:w-[619px] h-[240px] sm:h-[270px] lg:h-[321.2px] rounded-2xl p-6 flex flex-col justify-center bg-pink-100 overflow-hidden">
          <h3 className="text-2xl sm:text-3xl lg:text-[37px]">15% Off</h3>
          <p className="text-[12px]">SALE</p>
          <p className="font-sans lg:text-[33px] sm:text-lg">Baked Products</p>
          <a href="#" className="mt-2 text-sm sm:text-base text-[#747474]">Shop Collection →</a>
          <img src={banner2} alt="banner-img" className="absolute bottom-0 right-0 w-[120px] sm:w-[180px] lg:w-[330px] h-[280px]" />
        </div>
      </div>
    </div>
  );
}
