// src/pages/AdminPopularArrived.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const CAP = 8;

const CONFIGS = {
  POPULAR: {
    key: "POPULAR",
    titleDefault: "Most popular products",
    get: "/api/popular",
    put: "/api/popular",
    channel: "popular",
  },
  ARRIVED: {
    key: "ARRIVED",
    titleDefault: "Just arrived",
    get: "/api/new-arrived",
    put: "/api/new-arrived",
    channel: "just-arrived",
  },
};

const newRow = () => ({
  id: crypto.randomUUID(),
  brand: "",
  title: "",
  desc: "",
  img: "",
  visible: true,
  price: 18,
  unit: "1 UNIT",
  rating: 4.5,
  discount: 15,
  order: 9999,
});

function broadcastRefresh(channel) {
  try {
    const ch = new BroadcastChannel(channel);
    ch.postMessage({ type: "updated", ts: Date.now() });
    ch.close();
  } catch {}
  try {
    localStorage.setItem(`${channel}-updated`, String(Date.now()));
  } catch {}
}

export default function AdminPopularArrived() {
  const [tab, setTab] = useState("POPULAR");
  const [meta, setMeta] = useState({
    POPULAR: { title: CONFIGS.POPULAR.titleDefault, rows: [], loading: true },
    ARRIVED: { title: CONFIGS.ARRIVED.titleDefault, rows: [], loading: true },
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ ok: "", err: "" });
  // Selection per tab for bulk delete
  const [sel, setSel] = useState({ POPULAR: new Set(), ARRIVED: new Set() });

  const cfg = CONFIGS[tab];

  useEffect(() => {
    let alive = true;
    async function load(which) {
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
              price: Number.isFinite(Number(r.price)) ? Number(r.price) : 18,
              unit: r.unit || "1 UNIT",
              rating: Number.isFinite(Number(r.rating)) ? Number(r.rating) : 4.5,
              discount: Number.isFinite(Number(r.discount)) ? Number(r.discount) : 15,
              order: Number.isFinite(Number(r.order)) ? Number(r.order) : i + 1,
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
    }
    load("POPULAR");
    load("ARRIVED");
    return () => {
      alive = false;
    };
  }, []);

  const rows = meta[tab].rows;
  const title = meta[tab].title;
  const loading = meta[tab].loading;
  const currentSel = sel[tab];

  const setTitle = (v) => setMeta((m) => ({ ...m, [tab]: { ...m[tab], title: v } }));
  const setRows = (fn) => setMeta((m) => ({ ...m, [tab]: { ...m[tab], rows: fn(m[tab].rows) } }));
  const setCell = (id, key, val) => setRows((arr) => arr.map((r) => (r.id === id ? { ...r, [key]: val } : r)));

  const add = () => setRows((arr) => (arr.length >= CAP ? arr : [{ ...newRow(), order: arr.length + 1 }, ...arr]));
  const addN = (n = 4) =>
    setRows((arr) => {
      const free = Math.max(0, CAP - arr.length);
      const cnt = Math.min(free, n);
      const extra = Array.from({ length: cnt }, (_, i) => ({ ...newRow(), order: arr.length + i + 1 }));
      return [...extra, ...arr];
    });

  const confirmDel = (count) => window.confirm(`Delete ${count} item(s)? This cannot be undone.`);
  const del = (id) => {
    if (!confirmDel(1)) return;
    setRows((a) => a.filter((r) => r.id !== id));
    setSel((s) => ({ ...s, [tab]: new Set([...s[tab]].filter((x) => x !== id)) }));
  };

  // Bulk selection helpers
  const toggleRowSel = (id) =>
    setSel((s) => {
      const copy = new Set(s[tab]);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return { ...s, [tab]: copy };
    });
  const selectAll = () => setSel((s) => ({ ...s, [tab]: new Set(rows.map((r) => r.id)) }));
  const clearSel = () => setSel((s) => ({ ...s, [tab]: new Set() }));
  const deleteSelected = () => {
    const ids = Array.from(currentSel);
    if (ids.length === 0) return;
    if (!confirmDel(ids.length)) return;
    setRows((a) => a.filter((r) => !currentSel.has(r.id)));
    clearSel();
  };

  // Drag reorder
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
      const cleaned = rows.slice(0, CAP).map((r, i) => ({
        id: r.id,
        brand: String(r.brand || "").trim(),
        title: String(r.title || "").trim(),
        desc: String(r.desc || "").trim(),
        img: String(r.img || "").trim(),
        visible: !!r.visible,
        price: Number.isFinite(Number(r.price)) ? Number(r.price) : 18,
        unit: String(r.unit || "1 UNIT"),
        rating: Number.isFinite(Number(r.rating)) ? Number(r.rating) : 4.5,
        discount: Number.isFinite(Number(r.discount)) ? Number(r.discount) : 15,
        order: Number.isFinite(Number(r.order)) ? Number(r.order) : i + 1,
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
      broadcastRefresh(cfg.channel);
    } catch (e) {
      setMsg({ ok: "", err: e?.message || "Save failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg((m) => ({ ...m, ok: "" })), 1200);
    }
  };

  const allChecked = rows.length > 0 && currentSel.size === rows.length;

  return (
    <main className="mx-auto max-w-[1472px] px-3 sm:px-4 py-6">
      {/* Tabs */}
      <div className="mb-4 flex items-center gap-6 text-sm">
        {["POPULAR", "ARRIVED"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`pb-2 border-b-2 ${
              tab === t ? "border-amber-300 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {t === "POPULAR" ? "Most popular products" : "Just arrived"}
          </button>
        ))}
      </div>

      {/* Header controls */}
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-semibold">{cfg.titleDefault}</h1>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded border px-2 py-1 text-xs"
            placeholder="Section title"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => addN(4)} disabled={rows.length >= CAP} className="h-8 rounded border px-2 text-xs disabled:opacity-50" type="button">
            +4
          </button>
          <button onClick={add} disabled={rows.length >= CAP} className="h-8 rounded border px-2 text-xs disabled:opacity-50" type="button">
            Add
          </button>
          <button
            onClick={deleteSelected}
            disabled={currentSel.size === 0}
            className="h-8 rounded border border-rose-300 px-2 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            type="button"
            title="Delete selected"
          >
            Delete Selected ({currentSel.size})
          </button>
          <button onClick={save} disabled={saving} className="h-8 rounded bg-emerald-600 px-3 text-xs text-white disabled:opacity-60" type="button">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {msg.err && <div className="mb-3 rounded border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">{msg.err}</div>}
      {msg.ok && <div className="mb-3 rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{msg.ok}</div>}

      {/* Table + Preview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Table */}
        <div className="lg:col-span-2 overflow-hidden rounded border">
          <div className="sticky top-0 grid grid-cols-[34px_28px_100px_1fr_1fr_1fr_80px_70px_70px_70px_70px_70px_70px] items-center gap-2 border-b bg-neutral-50 px-2 py-2 text-[11px] font-medium text-neutral-700">
            <div>#</div>
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => (e.target.checked ? selectAll() : clearSel())}
                title="Select all"
              />
            </div>
            <div>Image</div>
            <div>Brand</div>
            <div>Title</div>
            <div>Subtitle</div>
            <div>Visible</div>
            <div>Price</div>
            <div>Unit</div>
            <div>Rating</div>
            <div>Discount</div>
            <div>Order</div>
            <div className="text-right pr-2">Actions</div>
          </div>

          <ul className="divide-y">
            {loading ? (
              <li className="p-3 text-xs text-neutral-600">Loading...</li>
            ) : rows.length === 0 ? (
              <li className="p-6 text-center text-xs text-neutral-600">No items — click Add</li>
            ) : (
              rows.map((r, idx) => {
                const checked = currentSel.has(r.id);
                return (
                  <li
                    key={r.id}
                    draggable
                    onDragStart={onDragStart(r.id)}
                    onDragOver={onDragOver(r.id)}
                    onDrop={onDrop(r.id)}
                    className="grid grid-cols-[34px_28px_100px_1fr_1fr_1fr_80px_70px_70px_70px_70px_70px_70px] items-center gap-2 px-2 py-2"
                  >
                    <div className="text-[11px] text-neutral-400">{idx + 1}</div>

                    <label className="flex items-center justify-center">
                      <input type="checkbox" checked={checked} onChange={() => toggleRowSel(r.id)} />
                    </label>

                    {/* Image cell */}
                    <div>
                      <div className="aspect-[4/3] w-[100px] overflow-hidden rounded bg-neutral-50 ring-1 ring-neutral-200 grid place-items-center">
                        {/* eslint-disable-next-line */}
                        {r.img ? <img src={r.img} alt={r.title} className="h-full w-full object-contain" /> : <span className="text-[10px] text-neutral-400">No image</span>}
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

                    <input value={r.brand} onChange={(e) => setCell(r.id, "brand", e.target.value)} className="rounded border px-2 py-1 text-xs" />
                    <input value={r.title} onChange={(e) => setCell(r.id, "title", e.target.value)} className="rounded border px-2 py-1 text-xs" />
                    <input value={r.desc} onChange={(e) => setCell(r.id, "desc", e.target.value)} className="rounded border px-2 py-1 text-xs" />

                    <label className="flex items-center justify-center gap-2 text-xs">
                      <input type="checkbox" checked={r.visible} onChange={(e) => setCell(r.id, "visible", e.target.checked)} />
                    </label>

                    <input type="number" step="0.01" value={r.price} onChange={(e) => setCell(r.id, "price", Number(e.target.value))} className="rounded border px-2 py-1 text-xs" />
                    <input value={r.unit} onChange={(e) => setCell(r.id, "unit", e.target.value)} className="rounded border px-2 py-1 text-xs" />
                    <input type="number" step="0.1" value={r.rating} onChange={(e) => setCell(r.id, "rating", Number(e.target.value))} className="rounded border px-2 py-1 text-xs" />
                    <input type="number" value={r.discount} onChange={(e) => setCell(r.id, "discount", Number(e.target.value))} className="rounded border px-2 py-1 text-xs" />
                    <input type="number" value={r.order ?? 9999} onChange={(e) => setCell(r.id, "order", Number(e.target.value))} className="rounded border px-2 py-1 text-xs" />

                    <div className="flex items-center justify-end gap-2 pr-2">
                      <button
                        onClick={() => del(r.id)}
                        className="rounded border border-rose-300 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-50"
                        type="button"
                        title="Delete"
                      >
                        Delete
                      </button>
                      <span className="cursor-grab select-none text-[11px] text-neutral-500" title="Drag to reorder">⠿</span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Live preview */}
        <aside className="rounded border p-3">
          <h3 className="mb-2 text-sm font-semibold">Preview</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {rows
              .slice(0, CAP)
              .filter((x) => x.visible)
              .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || (a.title || "").localeCompare(b.title || ""))
              .map((p) => (
                <article key={p.id} className="relative rounded-2xl border border-neutral-200 bg-white shadow-sm transition duration-200 hover:shadow-2xl hover:-translate-y-0.5">
                  {!!p.discount && (
                    <span className="absolute left-3 top-3 rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      -{p.discount}%
                    </span>
                  )}
                  <button type="button" className="absolute right-3 top-3 h-8 w-8 grid place-items-center rounded-full bg-white/90 ring-1 ring-neutral-200">
                    <span className="text-xs">♡</span>
                  </button>
                  <div className="p-3">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-50 grid place-items-center">
                      {/* eslint-disable-next-line */}
                      {p.img ? <img src={p.img} alt={p.title} className="h-full w-full object-contain" /> : <div className="text-[10px] text-neutral-400">No image</div>}
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <h2 className="mt-1 line-clamp-2 text-[16px] font-semibold w-[150px] font-sans text-[#333333]">{p.title || p.brand || "Untitled"}</h2>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm text-neutral-500">{p.unit}</h3>
                      <div className="mt-1 flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400">
                          <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.417 8.263L12 19.771 4.583 23.86 6 15.596 0 9.748l8.332-1.73z" />
                        </svg>
                        <span className="text-sm font-medium text-neutral-600">{p.rating}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-[22px] font-semibold text-[#333333]">${Number(p.price).toFixed(2)}</div>
                  </div>
                </article>
              ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
