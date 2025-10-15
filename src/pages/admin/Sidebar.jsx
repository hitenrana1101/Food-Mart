import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiUser, FiHome, FiFlag, FiTool, FiBox, FiInfo, FiLayers,
  FiShoppingCart, FiMail, FiMessageSquare, FiChevronDown
} from "react-icons/fi";
import { FaHandshake } from "react-icons/fa6";
import main from "../img/main_logo.png"
import User_profile from "../admin/User_profile";
import WelcomeBannerPage from "../admin/Welcome_banner";
import ProductsAdmin from "../admin/Trending_admin";
import AdminJustArrived from "../admin/Just_arrived_admin"


const items = [
  { kind: "link", label: "User Profile", to: {User_profile}, icon: <FiUser /> },

  {
    label: "Home", base: "/home", icon: <FiHome />, subs: [
      { label: "Welcome Banner", to:"/admin/welcome" },
      { label: "Category", to: "/admin/category" },
      { label: "Our Promises", to: "/admin/promises" },
      { label: "Our Products", to: "/admin/products" },
    ]
  },
  
  {
    label: "Products", base: "/about", icon: <FiInfo />, subs: [
      { label: "Best Selling", to: "/admin/selling" },
      { label: "Just Arrived", to: "/admin/just" }, 
    ]
  },

  {
    label: "Our Recent Blog", base: "/range", icon: <FiLayers />, subs: [
      { label: "Overview", to: "/admin/recent" }, 
    ]
  },  
  {
    label: "Products", base: "/products-main", icon: <FiBox />, subs: [
      { label: "Overview", to: "/products-main/overview" },
      { label: "Categories", to: "/products-main/categories" },
      { label: "List", to: "/products-main/list" },
    ]
  },
  
  {
    label: "Products", base: "/products", icon: <FiShoppingCart />, subs: [
      { label: "Overview", to: "/products/overview" },
      { label: "Add", to: "/products/add" },
      { label: "Inventory", to: "/products/inventory" },
      { label: "Settings", to: "/products/settings" },
    ]
  },

  {
    label: "Contact Us", base: "/contact", icon: <FiMail />, subs: [
      { label: "Overview", to: "/contact/overview" },
      { label: "Messages", to: "/contact/messages" },
    ]
  },
  
  {
    label: "Testimonial", base: "/testimonials", icon: <FiMessageSquare />, subs: [
      { label: "Overview", to: "/testimonials/overview" },
      { label: "Add", to: "/testimonials/add" }, 
    ]
  },
  {
    label: "Faqs", base: "/promises", icon: <FaHandshake />, subs: [
      { label: "Overview", to: "/promises/overview" },
      { label: "Add", to: "/promises/add" }, 
    ]
  },
  {
    label: "Other", base: "/welcome", icon: <FiFlag />, subs: [
      { label: "Overview", to: "/welcome/overview" },
      { label: "Add", to: "/welcome/add" },
      { label: "List", to: "/welcome/list" },
      { label: "Settings", to: "/welcome/settings" },
    ]
  },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState({});

  useEffect(() => {
    const fn = () => setCollapsed(c => !c);
    window.addEventListener("sidebar-toggle", fn);
    return () => window.removeEventListener("sidebar-toggle", fn);
  }, []);

  useEffect(() => {
    const initial = {};
    items.forEach(it => { if (it.base && pathname.startsWith(it.base)) initial[it.base] = true; });
    setOpen(prev => ({ ...initial, ...prev }));
  }, [pathname]);

  return (
    <aside className={`${collapsed ? "w-[76px]" : "w-70"} transition-all duration-200 static top-0 h-screen bg-white border-r border-slate-200 z-20`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className=" " />
          {!collapsed && <span><img src={main} alt="" className="p-4" /></span>}
        </div>

        {!collapsed && <div className="text-xs text-[#747474] tracking-[.2em] mt-2 mb-2">MENU</div>}

        <nav className="flex flex-col gap-1">
          {items.map((it, idx) => {
            if (it.kind === "link") {
              return (
                <NavLink
                  key={idx}
                  to={it.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-800 hover:bg-slate-100"}`
                  }
                >
                  <span className="w-[22px] text-center">{it.icon}</span>
                  {!collapsed && <span className="flex-1">{it.label}</span>}
                </NavLink>
              );
            }

            const isOpen = !!open[it.base];

            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setOpen(o => ({ ...o, [it.base]: !isOpen }))}
                  aria-expanded={isOpen}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-slate-800 hover:bg-slate-100"
                >
                  <span className="w-[22px] text-center">{it.icon}</span>
                  {!collapsed && <span className="flex-1 text-left">{it.label}</span>}
                  {!collapsed && <FiChevronDown className={`text-slate-700 transition-transform ${isOpen ? "rotate-180" : ""}`} size={16} />}
                </button>

                {isOpen && (
                  <div className={`ml-2 pl-3 border-l border-slate-200 ${collapsed ? "hidden" : "block"}`}>
                    {it.subs.slice(0, 4).map((s, si) => (
                      <NavLink
                        key={si}
                        to={s.to}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-lg ml-1 ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-800 hover:bg-slate-50"}`
                        }
                      >
                        <span className="text-slate-400"></span>
                        <span>{s.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
