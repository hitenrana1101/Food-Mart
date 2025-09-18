 import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { LuUserRound } from "react-icons/lu";
import { RiHeartLine } from "react-icons/ri";
import { FiShoppingCart } from "react-icons/fi";
import logo from "../img/main_logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);        // desktop Pages
  const [mobileOpen, setMobileOpen] = useState(false); // mobile menu

  return (
    <header className="w-full ">
      {/* TOP BAR */}
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="py-3 border-b flex flex-wrap items-center gap-3 justify-center lg:justify-between">
          {/* Logo (center on mobile) */}
          <div className="flex justify-center md:justify-start py-1 px-2 shrink-0">
            <img src={logo} alt="Logo" className="max-w-full h-auto" />
          </div>

          {/* Search (desktop only) */}
          <div className="hidden lg:flex flex-grow justify-center my-0 min-w-0">
            <div className="w-full max-w-[623px] px-3 py-3 rounded-3xl">
              <div className="flex items-center bg-[#f8f8f8] rounded-2xl overflow-hidden min-w-0">
                <select className="px-4 py-3 bg-[#f8f8f8] text-[#747474] outline-none ml-[15px] pr-10">
                  <option>All Categories</option>
                  <option>Groceries</option>
                  <option>Drinks</option>
                  <option>Chocolates</option>
                </select>
                <input
                  type="text"
                  placeholder="Search for more than 20,000 products"
                  className="ml-[25px] flex-1 min-w-0 px-4 py-3 bg-transparent text-gray-700 outline-none placeholder-gray-500"
                />
                <button type="button" className="px-4 text-gray-500 hover:text-gray-700" aria-label="Search">
                  <IoSearch className="text-2xl font-bold text-gray-500 w-[30px] h-[26px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Right side (desktop only so icons don't duplicate) */}
          <div className="hidden lg:flex items-center flex-wrap justify-end gap-4 min-w-0">
            <div className="text-end py-1 px-2 md:px-7">
              <p className="text-[#212529bf]">For Support?</p>
              <h1 className="text-lg font-semibold">+980-34984089</h1>
            </div>
            <div className="flex gap-2 py-1">
              <span className="w-10 h-10 p-2 flex items-center justify-center rounded-full bg-gray-50">
                <LuUserRound className="text-xl text-gray-700" />
              </span>
              <span className="w-10 h-10 p-2 flex items-center justify-center rounded-full bg-gray-50">
                <RiHeartLine className="text-xl text-gray-700" />
              </span>
            </div>
            <div className="p-2">
              <span className="text-[#212529bf] block">Your Cart</span>
              <span className="font-semibold text-black text-[19px]">$1290.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP NAV (unchanged) */}
      <nav className="hidden lg:block">
        <div className="max-w-screen-2xl mx-auto px-4 py-2 flex mt-3 items-center space-x-8">
          <div className="relative">
            <select className="px-3 py-2 rounded-md border border-neutral-200">
              <option>Shop By Department</option>
              <option>Groceries</option>
              <option>Drinks</option>
              <option>Chocolates</option>
            </select>
          </div>
          <ul className="flex items-center space-x-6">
            <li><a href="#" className="text-gray-700 hover:text-[#1b5a5a] transition">Women</a></li>
            <li><a href="#" className="text-gray-700 hover:text-[#1b5a5a] transition">Men</a></li>
            <li><a href="#" className="text-gray-700 hover:text-[#1b5a5a] transition">Kids</a></li>
            <li><a href="#" className="text-gray-700 hover:text-[#1b5a5a] transition">Accessories</a></li>

            <li className="relative inline-block text-left">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls="desktop-pages"
                className="px-4 py-2 text-gray-700 rounded-md flex items-center hover:text-[#1b5a5a] transition"
              >
                Pages
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div id="desktop-pages" role="menu" className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg py-2 w-48 z-50">
                  {[
                    "About Us","Shop","Single Product","Cart","Checkout","Blog","Single Post",
                    "Styles","Contact","Thank You","My Account","404 Error",
                  ].map((item) => (
                    <a key={item} href="#" role="menuitem" className="block px-4 py-2 text-gray-700 rounded-[10px] hover:bg-gray-200">
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </li>

            <li><a href="#" className="text-gray-700 hover:text-[#1b5a5a] transition">Brand</a></li>
            <li><a href="#" className="text-gray-700 hover:text-[#1b5a5a] transition">Sale</a></li>
            <li><a href="#" className="text-gray-700 hover:text-[#1b5a5a] transition">Blog</a></li>
          </ul>
        </div>
      </nav>

      {/* MOBILE HEADER (icons row + centered hamburger) */}
      <div className="lg:hidden">
        {/* One icons row only (no duplicates) */}
        <div className="flex items-center justify-center gap-6 py-3">
          <button type="button" aria-label="Account"><LuUserRound className="h-6 w-6 text-gray-800" /></button>
          <button type="button" aria-label="Wishlist"><RiHeartLine className="h-6 w-6 text-gray-800" /></button>
          <button type="button" aria-label="Cart"><FiShoppingCart className="h-6 w-6 text-gray-800" /></button>
          <button type="button" aria-label="Search"><IoSearch className="h-6 w-6 text-gray-800" /></button>
        </div>

        <div className="h-6" />

        <div className="flex justify-center pb-4">
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
            aria-haspopup="menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu-panel"
            className="h-10 w-12 rounded-lg border border-neutral-300 shadow-sm bg-white grid place-items-center active:scale-[0.98] transition"
          >
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-gray-800"></span>
              <span className="block h-0.5 w-6 bg-gray-800"></span>
              <span className="block h-0.5 w-6 bg-gray-800"></span>
            </div>
          </button>
        </div>

        <nav
          id="mobile-menu-panel"
          className={`mx-auto w-full max-w-sm overflow-hidden transition-[max-height,opacity] duration-300 ${
            mobileOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul role="menu" className="px-6 pb-6 space-y-2">
            {["Home","Shop","Categories","Blog","About","Contact","My Account","Cart","Checkout"].map((l) => (
              <li key={l}>
                <a role="menuitem" href="#" className="block w-full rounded-md px-4 py-2 text-center text-gray-800 bg-white border border-neutral-200 hover:bg-neutral-50">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
