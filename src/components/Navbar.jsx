import React, { useEffect, useRef, useState, useId } from "react";
import { IoSearch } from "react-icons/io5";
import { LuUserRound } from "react-icons/lu";
import { RiHeartLine } from "react-icons/ri";
import { FiShoppingCart } from "react-icons/fi";
import logo from "../img/main_logo.png";

/* User dropdown (disclosure pattern) */
function UserMenu({ user, compact = false }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const rootRef = useRef(null);
  const uid = useId();
  const panelId = `user-menu-${uid}`;

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("touchstart", onPointerDown);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const initial = (user?.name?.[0] || "?").toUpperCase();

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(v => !v)}
        className={compact
          ? "w-10 h-10 p-2 flex items-center justify-center rounded-full bg-gray-50"
          : "w-10 h-10 p-2 flex items-center justify-center rounded-full bg-gray-50"}
      >
        <LuUserRound className="text-xl text-gray-700" />
        <span className="sr-only">User menu</span>
      </button>

      <div
        id={panelId}
        ref={panelRef}
        hidden={!open}
        className={[
          "absolute z-50 w-72 rounded-xl border border-neutral-200 bg-white shadow-lg",
          compact ? "right-0 mt-2" : "right-0 mt-2"
        ].join(" ")}
      >
        <div className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-teal-600 text-white grid place-items-center font-semibold">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "Guest"}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email || "guest@example.com"}</p>
          </div>
        </div>
        <div className="py-1">
          <a href="#" className="block px-4 py-2 text-sm text-gray-800 hover:bg-neutral-50">My Account</a>
          <a href="#" className="block px-4 py-2 text-sm text-gray-800 hover:bg-neutral-50">Orders</a>
          <a href="#" className="block px-4 py-2 text-sm text-gray-800 hover:bg-neutral-50">Wishlist</a>
        </div>
        <div className="border-t border-neutral-200" />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            // TODO: add your sign-out logic here
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

/* Wishlist dropdown (disclosure pattern) */
function WishlistMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); }
    catch { return []; }
  });
  const btnRef = useRef(null);
  const rootRef = useRef(null);
  const uid = useId();
  const panelId = `wishlist-panel-${uid}`;

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("touchstart", onPointerDown);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === "wishlist") {
        try { setItems(JSON.parse(e.newValue || "[]") || []); }
        catch { setItems([]); }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const count = items.length;
  function write(next) {
    localStorage.setItem("wishlist", JSON.stringify(next));
    setItems(next);
  }
  function removeItem(id) {
    write(items.filter(x => x.id !== id));
  }
  function clearAll() {
    write([]);
  }
  function handleAddToCart(item) {
    const ev = new CustomEvent("add-to-cart", { detail: item });
    window.dispatchEvent(ev);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(v => !v)}
        className="relative w-10 h-10 p-2 flex items-center justify-center rounded-full bg-gray-50"
      >
        <RiHeartLine className="text-xl text-gray-700" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-teal-600 text-white text-xs grid place-items-center">
            {count}
          </span>
        )}
        <span className="sr-only">Wishlist</span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 mt-2 z-50 w-80 max-h-[70vh] overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg"
      >
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Your Wishlist</p>
          {items.length > 0 && (
            <button type="button" onClick={clearAll} className="text-xs text-red-600 hover:text-red-700">
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No liked items yet.</div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {items.map(item => (
              <li key={item.id} className="p-3 flex gap-3 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-14 rounded-md object-cover bg-neutral-100"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-600 truncate">
                    {typeof item.price === "number" ? `₹${item.price.toFixed(2)}` : item.price}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className="px-2 py-1 text-xs rounded-md bg-teal-600 text-white hover:bg-teal-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="px-2 py-1 text-xs rounded-md bg-neutral-100 text-gray-800 hover:bg-neutral-200"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);        // desktop Pages
  const [mobileOpen, setMobileOpen] = useState(false); // mobile menu
  const currentUser = { name: "Hiten Rana", email: "hiten9968@gmail.com" };

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

          {/* Right side (desktop only) */}
          <div className="hidden lg:flex items-center flex-wrap justify-end gap-4 min-w-0">
            <div className="text-end py-1 px-2 md:px-7">
              <p className="text-[#212529bf]">For Support?</p>
              <h1 className="text-lg font-semibold">+980-34984089</h1>
            </div>

            <div className="flex gap-2 py-1 cursor-pointer">
              {/* User dropdown here */}
              <UserMenu user={currentUser} />
              {/* Wishlist dropdown here */}
              <WishlistMenu />
            </div>

            <div className="p-2">
              <span className="text-[#212529bf] block">Your Cart</span>
              <span className="font-semibold text-black text-[19px]">$1290.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP NAV (unchanged except code above) */}
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
                aria-haspopup="true"
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
                <div id="desktop-pages" className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg py-2 w-48 z-50">
                  {[
                    "About Us","Shop","Single Product","Cart","Checkout","Blog","Single Post",
                    "Styles","Contact","Thank You","My Account","404 Error",
                  ].map((item) => (
                    <a key={item} href="#" className="block px-4 py-2 text-gray-700 rounded-[10px] hover:bg-gray-200">
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

      {/* MOBILE HEADER */}
      <div className="lg:hidden">
        <div className="flex items-center justify-center gap-6 py-3">
          {/* Mobile user dropdown (compact) */}
          <UserMenu user={currentUser} compact />
          {/* Mobile wishlist dropdown */}
          <WishlistMenu />
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
          <ul className="px-6 pb-6 space-y-2">
            {["Home","Shop","Categories","Blog","About","Contact","My Account","Cart","Checkout"].map((l) => (
              <li key={l}>
                <a href="#" className="block w-full rounded-md px-4 py-2 text-center text-gray-800 bg-white border border-neutral-200 hover:bg-neutral-50">
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
