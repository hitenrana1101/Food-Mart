import React from "react";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { LuShieldCheck, LuGift } from "react-icons/lu";
import { AiOutlineShop } from "react-icons/ai";
import { BsChatHeart } from "react-icons/bs";

const row1 = [
  "Blue diamon almonds",
  "Angie's Boomchickapop Corn",
  "Salty kettle Corn",
  "Chobani Greek Yogurt",
  "Sweet Vanilla Yogurt",
  "Foster Farms Takeout Crispy wings",
];

const row2 = [
  "Warrior Blend Organic",
  "Chao Cheese Creamy",
  "Chicken meatballs",
  "Blue diamon almonds",
  "Angie's Boomchickapop Corn",
  "Salty kettle Corn",
  "Chobani Greek Yogurt",
];

const row3 = [
  "Sweet Vanilla Yogurt",
  "Foster Farms Takeout Crispy wings",
  "Warrior Blend Organic",
  "Chao Cheese Creamy",
  "Chicken meatballs",
];

const chipCls =
  "bg-[#fcf7eb] text-[#747474] rounded-full px-4 py-2 text-[16px] whitespace-nowrap";

const Looking_for = () => {
  return (
    <>
      {/* Heading */}
      <section className="py-8 ">
        <div className="container mx-auto px-4 mt-[10px]">
          <h2 className="text-[32px] font-sans font-semibold mb-6">
            People are also looking for
          </h2>

          {/* Chips: 3 rows exactly like screenshot */}
          <div className="space-y-4">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {row1.map((t) => (
                <li key={t} className={chipCls}>{t}</li>
              ))}
            </ul>

            <ul className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {row2.map((t) => (
                <li key={t} className={chipCls}>{t}</li>
              ))}
            </ul>

            <ul className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {row3.map((t) => (
                <li key={t} className={chipCls}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features row */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <ul
            className="
              grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5
              gap-x-10 gap-y-10
            "
          >
            <li className="flex items-start gap-4">
              <HiOutlineShoppingCart className="w-8 h-8 text-gray-900" aria-hidden="true" />
              <div>
                <h3 className="font-semibold font-sans text-[20px] leading-6">Free delivery</h3>
                <p className="text-[16px] text-[#747474] max-w-[260px]">
                  Lorem ipsum dolor sit amet, consectetur adipi elit.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <LuShieldCheck className="w-8 h-8 text-gray-900" aria-hidden="true" />
              <div>
                <h3 className="font-semibold font-sans text-[20px] leading-6">100% secure payment</h3>
                <p className="text-[16px] text-[#747474] max-w-[260px]">
                  Lorem ipsum dolor sit amet, consectetur adipi elit.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <AiOutlineShop className="w-8 h-8 text-gray-900" aria-hidden="true" />
              <div>
                <h3 className="font-semibold font-sans text-[20px] leading-6">Quality guarantee</h3>
                <p className="text-[16px] text-[#747474] max-w-[260px]">
                  Lorem ipsum dolor sit amet, consectetur adipi elit.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <BsChatHeart className="w-8 h-8 text-gray-900" aria-hidden="true" />
              <div>
                <h3 className="font-semibold font-sans text-[20px] leading-6">guaranteed savings</h3>
                <p className="text-[16px] text-[#747474] max-w-[260px]">
                  Lorem ipsum dolor sit amet, consectetur adipi elit.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <LuGift className="w-8 h-8 text-gray-900" aria-hidden="true" />
              <div>
                <h3 className="font-semibold font-sans text-[20px] leading-6">Daily offers</h3>
                <p className="text-[16px] text-[#747474] max-w-[260px]">
                  Lorem ipsum dolor sit amet, consectetur adipi elit.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
};

export default Looking_for;
