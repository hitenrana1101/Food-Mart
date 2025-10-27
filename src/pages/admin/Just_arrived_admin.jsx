// src/pages/AdminPopularAndJustArrivedFull.jsx
import React, { useEffect, useRef, useState } from "react";

const CAP = 8;

const CONFIGS = {
  POPULAR: {
    key: "POPULAR",
    titleDefault: "Most popular products",
    get: "/api/popular",
    put: "/api/popular",
  },
  JUST: {
    key: "JUST",
    titleDefault: "Just arrived",
    get: "/api/just-arrived",
    put: "/api/just-arrived",
  },
};

// Default row with stock and storefront fields
const newRow = () => ({
  id: crypto.randomUUID(),
  brand: "",
  title: "",
  desc: "",
  img: "",
  visible: true,
  order: 9999,     // local preview order
  unit: "1 UNIT",
  price: 18,
  rating: 4.5,
  discount: 0,
  qty: 0,          // NEW: stock
});

const clamp = {
  price: (v) => Math.max(0, Number.isFinite(+v) ? +v : 0),
  rating: (v) => Math.min(5, Math.max(0, Number.isFinite(+v) ? +v : 0)),
  discount: (v) => Math.min(99, Math.max(0, Number.isFinite(+v) ? Math.floor(+v) : 0)),
  order: (v, i) => Math.max(1, Number.isFinite(+v) ? Math.floor(+v) : i + 1),
  qty: (v) => Math.max(0, Number.isFinite(+v) ? Math.floor(+v) : 0),
};

export default function AdminJustArrived() {
  const [tab, setTab] = useState("POPULAR");
  const [meta, setMeta] = useState({
    POPULAR: { title: CONFIGS.POPULAR.titleDefault, rows: [], loading: true },
    JUST: { title: CONFIGS.JUST.titleDefault, rows: [], loading: true },
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ ok: "", err: "" });

  const cfg = CONFIGS[tab];

  // Initial loads for both tabs
  useEffect(() => {
    let alive = true;
    const load = async (which) => {
      const c = CONFIGS[which];
      try {
        const res = await fetch(`${c.get}?ts=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`GET ${c.get} ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        const list = Array.isArray(data?.cards) ? data.cards : [];
        setMeta((m) => ({
          ...m,
          [which]: {
            title: String(data?.title || c.titleDefault),
            rows: list.slice(0, CAP).map((r, i) => ({
              ...newRow(),
              ...r,
              id: r.id || crypto.randomUUID(),
              brand: String(r.brand || ""),
              title: String(r.title || ""),
              desc: String(r.desc || ""),
              img: String(r.img || ""),
              visible: r.visible !== false,
              unit: String(r.unit || "1 UNIT"),
              price: clamp.price(r.price),
              rating: clamp.rating(r.rating),
              discount: clamp.discount(r.discount),
              order: clamp.order(r.order, i),
              qty: clamp.qty(r.qty),
            })),
            loading: false,
          },
        }));
      } catch (e) {
        if (!alive) return;
        setMeta((m) => ({
          ...m,
          [which]: { ...m[which], rows: [], loading: false },
        }));
        setMsg({ ok: "", err: e?.message || "Load failed" });
      }
    };
    load("POPULAR");
    load("JUST");
    return () => {
      alive = false;
    };
  }, []);

  const rows = meta[tab].rows;
  const title = meta[tab].title;
  const loading = meta[tab].loading;

  const setTitle = (v) => setMeta((m) => ({ ...m, [tab]: { ...m[tab], title: v } }));
  const setRows = (fn) => setMeta((m) => ({ ...m, [tab]: { ...m[tab], rows: fn(m[tab].rows) } }));
  const setCell = (id, key, val) =>
    setRows((arr) =>
      arr.map((r, i) => {
        if (r.id !== id) return r;
        if (key === "price") return { ...r, price: clamp.price(val) };
        if (key === "rating") return { ...r, rating: clamp.rating(val) };
        if (key === "discount") return { ...r, discount: clamp.discount(val) };
        if (key === "order") return { ...r, order: clamp.order(val, i) };
        if (key === "qty") return { ...r, qty: clamp.qty(val) };
        return { ...r, [key]: val };
      })
    );

  const add = () =>
    setRows((arr) => (arr.length >= CAP ? arr : [{ ...newRow(), order: arr.length + 1 }, ...arr]));

  const addN = (n = 4) =>
    setRows((arr) => {
      const free = Math.max(0, CAP - arr.length);
      const cnt = Math.min(free, n);
      const extra = Array.from({ length: cnt }, (_, i) => ({
        ...newRow(),
        order: arr.length + i + 1,
      }));
      return [...extra, ...arr];
    });

  const confirmDel = (count) => window.confirm(`Delete ${count} item(s)? This cannot be undone.`);
  const delOne = (id) => {
    if (!confirmDel(1)) return;
    setRows((a) => a.filter((r) => r.id !== id));
  };

  // Drag reorder (local-only)
  const dragId = useRef(null);
  const onDragStart = (id) => (e) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (id) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onDrop = (id) => (e) => {
    e.preventDefault();
    const from = dragId.current;
    dragId.current = null;
    if (!from || from === id) return;
    setRows((a) => {
      const i = a.findIndex((x) => x.id === from);
      const j = a.findIndex((x) => x.id === id);
      if (i < 0 || j < 0) return a;
      const b = a.slice();
      const [row] = b.splice(i, 1);
      b.splice(j, 0, row);
      return b.map((x, k) => ({ ...x, order: k + 1 }));
    });
  };

  const upload = async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/upload-image", { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Upload failed ${res.status}`);
    const data = await res.json();
    if (!data?.url) throw new Error("No URL");
    return data.url;
  };

  const save = async () => {
    setSaving(true);
    setMsg({ ok: "", err: "" });
    try {
      // Persist full storefront-aligned fields including stock (qty)
      const cleaned = rows.slice(0, CAP).map((r, i) => ({
        id: r.id,
        brand: String(r.brand || "").trim(),
        title: String(r.title || "").trim(),
        desc: String(r.desc || "").trim(),
        img: String(r.img || "").trim(),
        visible: !!r.visible,
        unit: String(r.unit || "1 UNIT").trim(),
        price: clamp.price(r.price),
        rating: clamp.rating(r.rating),
        discount: clamp.discount(r.discount),
        order: clamp.order(r.order, i),
        qty: clamp.qty(r.qty),
      }));
      const payload = { title: String(title || cfg.titleDefault).trim(), cards: cleaned };
      const res = await fetch(cfg.put, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || `Save failed ${res.status}`);
      setMsg({ ok: "Saved", err: "" });
    } catch (e) {
      setMsg({ ok: "", err: e?.message || "Save failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg((m) => ({ ...m, ok: "" })), 1200);
    }
  };

  const countVisible = rows.filter((x) => x.visible).length;

  // NEW: local order simulation (decrement preview stock by 1)
  const orderOne = (id) =>
    setRows((arr) =>
      arr.map((r) => (r.id === id ? { ...r, qty: Math.max(0, clamp.qty((r.qty || 0) - 1)) } : r))
    );

  return (
    <main className="mx-auto max-w-[1300px] px-3 sm:px-4 py-6">
      {/* Tabs */}
      <div className="mb-4 flex items-center gap-6 text-sm">
        {["POPULAR", "JUST"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`pb-2 border-b-2 ${
              tab === t
                ? "border-amber-300 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {t === "POPULAR" ? "Most popular products" : "Just arrived"}
          </button>
        ))}
      </div>

      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-semibold">{cfg.titleDefault}</h1>
          <span className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
            {rows.length}/{CAP} items • {countVisible} visible
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded border px-2 py-1 text-xs"
            placeholder="Section title"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addN(4)}
            disabled={rows.length >= CAP}
            className="h-8 rounded border px-2 text-xs disabled:opacity-50"
            type="button"
          >
            +4
          </button>
          <button
            onClick={add}
            disabled={rows.length >= CAP}
            className="h-8 rounded border px-2 text-xs disabled:opacity-50"
            type="button"
          >
            Add
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="h-8 rounded bg-emerald-600 px-3 text-xs text-white disabled:opacity-60"
            type="button"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {msg.err && (
        <div className="mb-3 rounded border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {msg.err}
        </div>
      )}
      {msg.ok && (
        <div className="mb-3 rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {msg.ok}
        </div>
      )}

      {/* Stack: Table on top, Preview below */}
      <div className="space-y-4">
        {/* Table */}
        <div className="overflow-hidden rounded border">
          <div
            className="sticky top-0 grid items-center gap-2 border-b bg-neutral-50 px-2 py-2 text-[11px] font-medium text-neutral-700
                       grid-cols-[34px_100px_1fr_1fr_1fr_90px_80px_80px_80px_80px_70px_70px_90px]"
          >
            <div>#</div>
            <div>Image</div>
            <div>Brand</div>
            <div>Title</div>
            <div>Subtitle</div>
            <div>Unit</div>
            <div>Price</div>
            <div>Rating</div>
            <div>Discount</div>
            <div>Stock</div>{/* NEW */}
            <div>Visible</div>
            <div>Order</div>
            <div className="text-right pr-2">Actions</div>
          </div>

          <ul className="divide-y">
            {loading ? (
              <li className="p-3 text-xs text-neutral-600">Loading...</li>
            ) : rows.length === 0 ? (
              <li className="p-6 text-center text-xs text-neutral-600">No items — click Add</li>
            ) : (
              rows.map((r, idx) => (
                <li
                  key={r.id}
                  draggable
                  onDragStart={onDragStart(r.id)}
                  onDragOver={onDragOver(r.id)}
                  onDrop={onDrop(r.id)}
                  className="grid items-center gap-2 px-2 py-2
                             grid-cols-[34px_100px_1fr_1fr_1fr_90px_80px_80px_80px_80px_70px_70px_90px]"
                >
                  <div className="text-[11px] text-neutral-400">{idx + 1}</div>

                  {/* Image cell */}
                  <div>
                    <div className="aspect-[4/3] w-[100px] overflow-hidden rounded bg-neutral-50 ring-1 ring-neutral-200 grid place-items-center">
                      {/* eslint-disable-next-line */}
                      {r.img ? (
                        <img src={r.img} alt={r.title || r.brand || "img"} className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-neutral-400">No image</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          e.currentTarget.value = "";
                          if (!f) return;
                          try {
                            const url = await upload(f);
                            setCell(r.id, "img", url);
                          } catch (err) {
                            alert(err?.message || "Upload failed");
                          }
                        }}
                        className="w-[100px] text-[10px]"
                      />
                    </div>
                  </div>

                  <input
                    value={r.brand}
                    onChange={(e) => setCell(r.id, "brand", e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  />
                  <input
                    value={r.title}
                    onChange={(e) => setCell(r.id, "title", e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  />
                  <input
                    value={r.desc}
                    onChange={(e) => setCell(r.id, "desc", e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  />

                  <input
                    value={r.unit}
                    onChange={(e) => setCell(r.id, "unit", e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={r.price}
                    onChange={(e) => setCell(r.id, "price", e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={r.rating}
                    onChange={(e) => setCell(r.id, "rating", e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  />
                  <input
                    type="number"
                    value={r.discount}
                    onChange={(e) => setCell(r.id, "discount", e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  />

                  {/* NEW: Stock (qty) */}
                  <input
                    type="number"
                    min={0}
                    value={r.qty}
                    onChange={(e) => setCell(r.id, "qty", e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  />

                  <label className="flex items-center justify-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={r.visible}
                      onChange={(e) => setCell(r.id, "visible", e.target.checked)}
                    />
                  </label>

                  <input
                    type="number"
                    value={r.order}
                    onChange={(e) => setCell(r.id, "order", e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  />

                  <div className="flex items-center justify-end gap-2 pr-2">
                    <button
                      onClick={() => delOne(r.id)}
                      className="rounded border border-rose-300 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-50"
                      type="button"
                      title="Delete"
                    >
                      Delete
                    </button>
                    <span className="cursor-grab select-none text-[11px] text-neutral-500" title="Drag to reorder">
                      ⠿
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Preview below the table */}
        <section className="rounded border p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Preview</h3>
            <span className="text-[11px] text-neutral-500">Showing up to {CAP} visible items</span>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {rows
              .slice(0, CAP)
              .filter((x) => x.visible)
              .sort(
                (a, b) =>
                  (a.order ?? 9999) - (b.order ?? 9999) ||
                  (a.title || "").localeCompare(b.title || "")
              )
              .map((p) => {
                const isOOS = (Number(p.qty) || 0) <= 0;
                return (
                  <article
                    key={p.id}
                    className="relative rounded-2xl border border-neutral-200 bg-white shadow-sm transition duration-200 hover:shadow-2xl hover:-translate-y-0.5"
                  >
                    {!!p.discount && (
                      <span className="absolute left-4 top-4 rounded-md bg-green-100 text-green-700 text-xs font-semibold px-2 py-1">
                        -{p.discount}%
                      </span>
                    )}
                    {isOOS && (
                      <span className="absolute left-4 top-4 translate-y-8 rounded-md bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-1">
                        Out of Stock
                      </span>
                    )}
                    <button
                      type="button"
                      className="absolute right-4 top-4 h-9 w-9 grid place-items-center rounded-full bg-white/90 ring-1 ring-neutral-200"
                      title="Wishlist"
                    >
                      <span className="text-xs">♡</span>
                    </button>

                    <div className="p-4">
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-50 grid place-items-center">
                        {/* eslint-disable-next-line */}
                        {p.img ? (
                          <img src={p.img} alt={p.title} className="h-full w-full object-contain" />
                        ) : (
                          <div className="text-[10px] text-neutral-400">No image</div>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <h3 className="text-sm text-neutral-500">{p.unit}</h3>
                      <div className="mt-1 flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400">
                          <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.417 8.263L12 19.771 4.583 23.86 6 15.596 0 9.748l8.332-1.73z" />
                        </svg>
                        <span className="text-xs font-medium text-neutral-600">{p.rating}</span>
                      </div>
                      <h2 className="mt-2 line-clamp-2 text-[15px] font-semibold text-neutral-900">
                        {p.title || p.brand || "Untitled"}
                      </h2>
                      <div className="mt-2 text-[22px] font-semibold text-neutral-900">
                        ${Number(p.price).toFixed(2)}
                      </div>

                      {/* NEW: Stock + Order button in preview */}
                      <div className="mt-1 text-[12px]">
                        {isOOS ? (
                          <span className="text-rose-600 font-semibold">Out of Stock</span>
                        ) : (
                          <span className="text-neutral-500">{p.qty} in stock</span>
                        )}
                      </div>

                      <div
                       className="mt-3">
                        <button
                          type="button"
                          onClick={() => orderOne(p.id)}
                          disabled={isOOS}
                          className="h-8 rounded-md border border-neutral-300 px-3 text-sm text-neutral-700 disabled:opacity-60"
                          title={isOOS ? "Out of Stock" : "Order 1 (preview)"}
                        >
                          Order
                        </button>
                        <span className="ml-2 text-[11px] text-neutral-500">
                          Preview only — click Save to persist
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      </div>
    </main>
  );
}
