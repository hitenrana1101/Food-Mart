// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

/* ========== Icons (simple inline SVGs) ========== */
const Icon = {
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
      <circle cx="12" cy="8" r="4" strokeWidth="1.5" />
      <path d="M4 20a8 8 0 0 1 16 0" strokeWidth="1.5" />
    </svg>
  ),
  Chevron: ({ open }) => (
    <svg viewBox="0 0 24 24" className={"w-4 h-4 ml-auto transition-transform " + (open ? "rotate-180" : "")} fill="none" stroke="currentColor">
      <path d="m6 9 6 6 6-6" strokeWidth="1.5" />
    </svg>
  ),
  Dot: () => <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />,
};

/* ========== Data ========== */
// Single direct link (no dropdown)
const single = [{ key: "profile", label: "User Profile", to: "/profile/overview", icon: Icon.User }];

// Dropdown groups
const groups = [
  { key: "home", label: "Home", children: [
      { to: "/home/overview", label: "Welcome Banner" },
      { to: "/home/banners", label: "Add Custom Door Service" },
      { to: "/home/sections", label: "Our Promises" },
      { to: "/home/stats", label: "Our Products" },
    ]},
  { key: "about", label: "About Us", children: [
      { to: "/about/overview", label: "Overview" },
      { to: "/about/team", label: "Team" },
    ]},
  { key: "range", label: "Our Range", children: [
      { to: "/our-range/overview", label: "Overview" },
      { to: "/our-range/category-a", label: "Category A" },
    ]},
  { key: "products", label: "Products", children: [
      { to: "/products/overview", label: "Overview" },
      { to: "/products/new", label: "New" },
      { to: "/products/all", label: "All Products" },
      { to: "/products/collections", label: "Collections" },
    ]},
  { key: "contact", label: "Contact Us", children: [
      { to: "/contact/overview", label: "Overview" },
      { to: "/contact/queries", label: "Queries" },
      { to: "/contact/locations", label: "Locations" },
      { to: "/contact/settings", label: "Settings" },
    ]},
  { key: "testimonial", label: "Testimonial", children: [
      { to: "/testimonial/overview", label: "Overview" },
      { to: "/testimonial/add", label: "Add" },
      { to: "/testimonial/list", label: "List" },
      { to: "/testimonial/settings", label: "Settings" },
    ]},
  { key: "faqs", label: "FAQs", children: [
      { to: "/faqs/overview", label: "Overview" },
      { to: "/faqs/add", label: "Add" },
      { to: "/faqs/list", label: "List" },
      { to: "/faqs/settings", label: "Settings" },
    ]},
  { key: "other", label: "Other", children: [
      { to: "/other/overview", label: "Overview" },
      { to: "/other/policy", label: "Policy" },
      { to: "/other/terms", label: "Terms" },
      { to: "/other/appearance", label: "Appearance" },
    ]},
];

/* ========== UI: Top Navbar ========== */
function TopNav() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Left spacer or breadcrumb area */}
      </div>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">V</div>
        <span className="text-sm text-slate-700">Vidya</span>
      </div>
    </header>
  );
}

/* ========== UI: Sidebar (sticky) ========== */
function Sidebar() {
  const [open, setOpen] = useState({});

  const linkCls = (isActive) =>
    [
      "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
      isActive ? "bg-indigo-50 text-indigo-600 font-medium" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    ].join(" ");

  return (
    <aside className="sticky top-0 h-screen w-[290px] bg-white border-r border-slate-200 p-4 hidden lg:block">
      {/* Brand */}
      <div className="flex items-center gap-2 px-2 py-2 mb-2">
        <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-semibold">VC</div>
        <div className="text-slate-900 font-semibold">Vidya Corporation</div>
      </div>

      <h2 className="text-[#9882b3] text-[12px] w-[249.9px] h-[20px] mb-[16px] font-sans">MENU</h2>

      <nav className="flex flex-col gap-1">
        {/* Single link: User Profile */}
        {single.map((it) => (
          <NavLink key={it.key} to={it.to} end className={({ isActive }) => linkCls(isActive)} aria-current={({ isActive }) => (isActive ? "page" : undefined)}>
            <it.icon className="w-5 h-5" />
            <span className="truncate">{it.label}</span>
          </NavLink>
        ))}

        {/* Dropdown groups */}
        {groups.map((g) => (
          <div key={g.key} className="mt-1 font-sans font-semibold text-[14px]">
            <button
              type="button"
              onClick={() => setOpen((s) => ({ ...s, [g.key]: !s[g.key] }))}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-expanded={!!open[g.key]}
              aria-controls={`sec-${g.key}`}
            >
              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-600">≡</span>
              <span className="truncate">{g.label}</span>
              <Icon.Chevron open={!!open[g.key]} />
            </button>

            <div id={`sec-${g.key}`} className={open[g.key] ? "mt-1 space-y-1 pl-9" : "hidden"}>
              {g.children.map((c) => (
                <NavLink key={c.to} to={c.to} end className={({ isActive }) => linkCls(isActive)} aria-current={({ isActive }) => (isActive ? "page" : undefined)}>
                  <Icon.Dot />
                  <span className="truncate">{c.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

/* ========== Pages ========== */
function Field({ label, value, span }) {
  return (
    <div className={span ? "md:col-span-2" : ""}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-gray-900">{value}</p>
    </div>
  );
}

function UserProfilePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Profile</h1>

      {/* Profile header card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-amber-50 ring-1 ring-gray-200 flex items-center justify-center">
              <span className="text-5xl font-serif text-gray-900">A</span>
            </div>
            <p className="text-lg font-medium text-gray-900">AEKO</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            {["f", "x", "in", "ig"].map((t) => (
              <span key={t} className="flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50">
                <span className="text-sm uppercase">{t}</span>
              </span>
            ))}
            <button className="ml-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Personal Information card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          <button className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Edit
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            <Field label="Admin Name" value="Inderpal" />
            <Field label="Site Name" value="AEKO" />
            <Field label="Phone" value="+91 8283030094" />
            <Field label="Email" value="career@vidyacorp.com" />
            <Field span label="Address" value="17-ax, guru nanak tower, model town extension, ludhiana, punjab, india" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple placeholder for other routes
function Blank({ title }) {
  return <h1 className="text-xl font-semibold">{title}</h1>;
}

/* ========== Layout (Sidebar + TopNav + Outlet) ========== */
function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TopNav />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

/* ========== App (Routes) ========== */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* default landing */}
          <Route index element={<Navigate to="/profile/overview" replace />} />

          {/* User Profile (single, no dropdown) */}
          <Route path="profile/overview" element={<UserProfilePage />} />

          {/* Home */}
          <Route path="home/overview" element={<Blank title="Home - Welcome Banner" />} />
          <Route path="home/banners" element={<Blank title="Home - Add Custom Door Service" />} />
          <Route path="home/sections" element={<Blank title="Home - Our Promises" />} />
          <Route path="home/stats" element={<Blank title="Home - Our Products" />} />

          {/* About */}
          <Route path="about/overview" element={<Blank title="About - Overview" />} />
          <Route path="about/team" element={<Blank title="About - Team" />} />

          {/* Our Range */}
          <Route path="our-range/overview" element={<Blank title="Our Range - Overview" />} />
          <Route path="our-range/category-a" element={<Blank title="Our Range - Category A" />} />

          {/* Products */}
          <Route path="products/overview" element={<Blank title="Products - Overview" />} />
          <Route path="products/new" element={<Blank title="Products - New" />} />
          <Route path="products/all" element={<Blank title="Products - All Products" />} />
          <Route path="products/collections" element={<Blank title="Products - Collections" />} />

          {/* Contact */}
          <Route path="contact/overview" element={<Blank title="Contact - Overview" />} />
          <Route path="contact/queries" element={<Blank title="Contact - Queries" />} />
          <Route path="contact/locations" element={<Blank title="Contact - Locations" />} />
          <Route path="contact/settings" element={<Blank title="Contact - Settings" />} />

          {/* Testimonial */}
          <Route path="testimonial/overview" element={<Blank title="Testimonial - Overview" />} />
          <Route path="testimonial/add" element={<Blank title="Testimonial - Add" />} />
          <Route path="testimonial/list" element={<Blank title="Testimonial - List" />} />
          <Route path="testimonial/settings" element={<Blank title="Testimonial - Settings" />} />

          {/* FAQs */}
          <Route path="faqs/overview" element={<Blank title="FAQs - Overview" />} />
          <Route path="faqs/add" element={<Blank title="FAQs - Add" />} />
          <Route path="faqs/list" element={<Blank title="FAQs - List" />} />
          <Route path="faqs/settings" element={<Blank title="FAQs - Settings" />} />

          {/* Other */}
          <Route path="other/overview" element={<Blank title="Other - Overview" />} />
          <Route path="other/policy" element={<Blank title="Other - Policy" />} />
          <Route path="other/terms" element={<Blank title="Other - Terms" />} />
          <Route path="other/appearance" element={<Blank title="Other - Appearance" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
