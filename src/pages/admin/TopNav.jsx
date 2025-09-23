// import main from "../img/main_logo.png"

// export default function TopNav({ sidebarOpen, onToggleSidebar }) {
//   return (
//     <header className="sticky top-0 z-40 bg-white border-b border-slate-200 m-5  ">
//       <div className="h-14 px-3 lg:px-6 flex items-center justify-between">
//         <button
//           type="button"
//           onClick={onToggleSidebar}
//           className="inline-flex lg:hidden items-center justify-center h-9 w-9 rounded-md border border-slate-200 hover:bg-slate-50"
//           aria-label="Toggle sidebar"
//           aria-expanded={sidebarOpen}
//           aria-controls="app-sidebar"
//         >
//           <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
//             <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.6" strokeLinecap="round" />
//           </svg>
//         </button>

//         <div className="font-semibol hidden sm:block"></div>

//         <div className="flex items-center gap-3">
//            <img src={main} alt="" 
//            className="w-[150px] "/>
//           </div>
//       </div>
//     </header>
//   );
// }

// src/components/TopNav.
// TopNav.jsx
import { useEffect, useRef, useState } from "react";
import { FiMenu, FiChevronDown, FiEdit2, FiSettings, FiHelpCircle, FiLogOut } from "react-icons/fi";
import main from "../img/main_logo.png"

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("click", onDoc); document.removeEventListener("keydown", onEsc); };
  }, []);

  const toggleSidebar = () => window.dispatchEvent(new CustomEvent("sidebar-toggle"));

  return (
    <header className="sticky top-0 z-30 h-19 bg-white border-b border-slate-200 flex items-center px-4">
      <button type="button" aria-label="Toggle sidebar" onClick={toggleSidebar}
        className="p-2 translate-x-6 rounded-lg hover:bg-slate-200 text-slate-700">
        <FiMenu size={22} />
      </button>

      <div className="flex-1" />

      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 px-3 py-1.5 "
      >
        {/* Replace with real logo */}
        <img src={main} alt="Company" className="w-[130px] " />
        <span className="font-medium "></span>
        <FiChevronDown size={16} className="text-slate-700" />
      </button>

      {open && (
        <div ref={menuRef} role="menu"
          className="absolute right-3 top-16 w-80 rounded-xl border border-slate-200 bg-white shadow-xl p-2">
          <div className="flex items-center gap-3 p-3 border-b border-slate-200">
            {/* <img src="/logo.png" alt="" className="w-9 h-9 rounded-lg bg-slate-900" /> */}
            <div>
              <div className="font-medium text-[14px] text-[#344054]">Food Mart</div>
              <div className="text-xs text-slate-500">hiten998@gmail.com</div>
            </div>
          </div>

          <button role="menuitem" className="w-full text-left flex items-center gap-2 px-3 py-2 font-medium text-[14px] text-[#344054]">
            <FiEdit2 className="w-4" /> Edit profile
          </button>
          <button role="menuitem" className="w-full text-left flex items-center gap-2 px-3 py-2 font-medium text-[14px] text-[#344054]">
            <FiSettings className="w-4" /> Account settings
          </button>
          <button role="menuitem" className="w-full text-left flex items-center gap-2 px-3 py-2 font-medium text-[14px] text-[#344054]">
            <FiHelpCircle className="w-4" /> Support
          </button>

          <div className="h-px bg-slate-200 my-1" />

          <button role="menuitem" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-700
           text-black hover:text-amber-50 text-[14px] text-center">
            <FiLogOut className="w-4" /> Sign out
          </button>
        </div>
      )}
    </header>
  );
}

