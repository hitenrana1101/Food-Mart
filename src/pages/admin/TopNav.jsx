import main from "../img/main_logo.png"

export default function TopNav({ sidebarOpen, onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 m-5  ">
      <div className="h-14 px-3 lg:px-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex lg:hidden items-center justify-center h-9 w-9 rounded-md border border-slate-200 hover:bg-slate-50"
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <div className="font-semibol hidden sm:block"></div>

        <div className="flex items-center gap-3">
           <img src={main} alt="" 
           className="w-[150px] "/>
          </div>
      </div>
    </header>
  );
}
