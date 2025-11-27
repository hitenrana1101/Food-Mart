// src/pages/AdminJustArrived.jsx
import React, { useEffect, useMemo, useState } from "react";

const CAP = 8;

const blank = () => ({
  id: crypto.randomUUID(),
  brand: "",
  title: "",
  desc: "",
  img: "",
  visible: true,
  unit: "1 UNIT",
  price: 18,
  rating: 4.5,
  discount: 0,
  qty: 0,
  order: 9999,
});

function broadcastRefresh() {
  try {
    const ch = new BroadcastChannel("just-arrived");
    ch.postMessage({ type: "updated", ts: Date.now() });
    ch.close();
  } catch {}
  try {
    localStorage.setItem("just-arrived-updated", String(Date.now()));
  } catch {}
}

export default function AdminJustArrived() {
  const [title, setTitle] = useState("Just arrived");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ ok: "", err: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setMsg({ ok: "", err: "" });
      try {
        const res = await fetch(`/api/just-arrived?ts=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`GET /api/just-arrived ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        setTitle(String(data?.title || "Just arrived"));
        const cards = Array.isArray(data?.cards) ? data.cards.slice(0, CAP) : [];
        setRows(
          cards.map((c, i) => ({
            ...blank(),
            ...c,
            id: c.id || crypto.randomUUID(),
            brand: String(c.brand || ""),
            title: String(c.title || ""),
            desc: String(c.desc || ""),
            img: String(c.img || ""),
            visible: c.visible !== false,
            unit: String(c.unit || "1 UNIT"),
            price: Number.isFinite(Number(c.price)) ? Number(c.price) : 18,
            rating: Number.isFinite(Number(c.rating)) ? Number(c.rating) : 4.5,
            discount: Number.isFinite(Number(c.discount)) ? Number(c.discount) : 0,
            qty: Number.isFinite(Number(c.qty)) ? Number(c.qty) : 0,
            order: Number.isFinite(Number(c.order)) ? Number(c.order) : i + 1,
          }))
        );
      } catch (e) {
        if (!alive) return;
        setRows([]);
        setMsg({ ok: "", err: e?.message || "Load failed" });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setRow = (id, patch) =>
    setRows((arr) => arr.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const add = () =>
    setRows((arr) => {
      if (arr.length >= CAP) return arr;
      return [{ ...blank(), order: arr.length + 1 }, ...arr];
    });

  const delRow = (id) => setRows((arr) => arr.filter((r) => r.id !== id));

  const move = (id, dir) =>
    setRows((arr) => {
      const idx = arr.findIndex((r) => r.id === id);
      if (idx < 0) return arr;
      const j = dir === "up" ? Math.max(0, idx - 1) : Math.min(arr.length - 1, idx + 1);
      const a = arr.slice();
      const [row] = a.splice(idx, 1);
      a.splice(j, 0, row);
      return a.map((r, i) => ({ ...r, order: i + 1 }));
    });

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
        unit: String(r.unit || "1 UNIT"),
        price: Number.isFinite(Number(r.price)) ? Number(r.price) : 18,
        rating: Number.isFinite(Number(r.rating)) ? Number(r.rating) : 4.5,
        discount: Number.isFinite(Number(r.discount)) ? Number(r.discount) : 0,
        qty: Number.isFinite(Number(r.qty)) ? Number(r.qty) : 0,
        order: Number.isFinite(Number(r.order)) ? Number(r.order) : i + 1,
      }));
      const payload = { title: String(title || "Just arrived").trim(), cards: cleaned };
      const res = await fetch("/api/just-arrived", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || `Save failed ${res.status}`);
      setMsg({ ok: "Saved", err: "" });
      broadcastRefresh();
    } catch (e) {
      setMsg({ ok: "", err: e?.message || "Save failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg((m) => ({ ...m, ok: "" })), 1200);
    }
  };

  // Try server-side decrement if endpoint exists, else fall back to local preview decrement
  const orderOne = async (id) => {
    const prod = rows.find((x) => x.id === id);
    const stock = Number(prod?.qty || 0);
    if (stock <= 0) return alert("Out of Stock");
    try {
      const res = await fetch("/api/just-arrived/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, qty: 1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        // local preview fallback
        setRows((arr) => arr.map((r) => (r.id === id ? { ...r, qty: Math.max(0, (Number(r.qty) || 0) - 1) } : r)));
        return alert("Preview order applied locally — click Save to persist");
      }
      // If backend returns remaining qty, trust it
      if (Number.isFinite(Number(data.qty))) {
        setRows((arr) => arr.map((r) => (r.id === id ? { ...r, qty: Number(data.qty) } : r)));
      } else {
        setRows((arr) => arr.map((r) => (r.id === id ? { ...r, qty: Math.max(0, (Number(r.qty) || 0) - 1) } : r)));
      }
    } catch {
      // fallback local
      setRows((arr) => arr.map((r) => (r.id === id ? { ...r, qty: Math.max(0, (Number(r.qty) || 0) - 1) } : r)));
      alert("Preview order applied locally — click Save to persist");
    }
  };

  const counts = useMemo(() => {
    const all = rows.length;
    const vis = rows.filter((r) => r.visible).length;
    const oos = rows.filter((r) => (Number(r.qty) || 0) <= 0).length;
    return { all, vis, oos };
  }, [rows]);

  return (
    <main className="mx-auto max-w-[1472px] px-3 sm:px-4 py-5">
      <title>Food Mart Best Selling</title>

      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-[15px] font-semibold">Best Selling Products</h1>
        <div className="flex items-center gap-2">
          <span className="rounded bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600">
            {counts.all}/{CAP} items • {counts.vis} visible • {counts.oos} OOS
          </span>
          <button
            type="button"
            onClick={add}
            disabled={rows.length >= CAP}
            className="h-8 rounded border px-2 text-xs hover:bg-neutral-50 disabled:opacity-50"
            title={rows.length >= CAP ? "Max 8 items" : "Add item"}
          >
            Add
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="h-8 rounded bg-emerald-600 px-2 text-xs text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-neutral-600">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="grid place-items-center rounded border border-dashed border-neutral-300 py-10 text-xs text-neutral-600">
          No items — click Add
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r, idx) => (
            <li key={r.id} className="rounded border border-neutral-200 bg-white p-2">
              <div className="flex items-start gap-2">
                <div className="w-24 shrink-0">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded bg-neutral-50 ring-1 ring-neutral-200 grid place-items-center">
                    {/* eslint-disable-next-line */}
                    {r.img ? (
                      <img src={r.img} alt={r.title || "img"} className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-[10px] text-neutral-400">No image</div>
                    )}
                  </div>
                  <div className="mt-1 grid grid-cols-1 gap-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        e.currentTarget.value = "";
                        if (!f) return;
                        try {
                          const url = await upload(f);
                          setRow(r.id, { img: url });
                        } catch (err) {
                          alert(err?.message || "Upload failed");
                        }
                      }}
                      className="block w-full text-[10px]"
                    />
                    <input
                      type="url"
                      placeholder="/uploads/..."
                      value={r.img}
                      onChange={(e) => setRow(r.id, { img: e.target.value })}
                      className="rounded border px-2 py-1 text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
                    <input
                      type="text"
                      placeholder="Brand"
                      value={r.brand}
                      onChange={(e) => setRow(r.id, { brand: e.target.value })}
                      className="rounded border px-2 py-1 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={r.title}
                      onChange={(e) => setRow(r.id, { title: e.target.value })}
                      className="rounded border px-2 py-1 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle"
                      value={r.desc}
                      onChange={(e) => setRow(r.id, { desc: e.target.value })}
                      className="rounded border px-2 py-1 text-xs"
                    />
                    <label className="flex items-center justify-end gap-1 text-[11px]">
                      <input
                        type="checkbox"
                        checked={r.visible}
                        onChange={(e) => setRow(r.id, { visible: e.target.checked })}
                      />
                      Visible
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-[160px_repeat(5,minmax(0,1fr))_auto_auto] gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={r.price}
                      onChange={(e) => setRow(r.id, { price: Number(e.target.value) })}
                      className="rounded border px-2 py-1 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={r.unit}
                      onChange={(e) => setRow(r.id, { unit: e.target.value })}
                      className="rounded border px-2 py-1 text-xs"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Rating"
                      value={r.rating}
                      onChange={(e) => setRow(r.id, { rating: Number(e.target.value) })}
                      className="rounded border px-2 py-1 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Discount"
                      value={r.discount}
                      onChange={(e) => setRow(r.id, { discount: Number(e.target.value) })}
                      className="rounded border px-2 py-1 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Stock qty"
                      value={r.qty}
                      onChange={(e) => setRow(r.id, { qty: Number(e.target.value) })}
                      className="rounded border px-2 py-1 text-xs"
                    />

                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => move(r.id, "up")}
                        className="rounded border px-2 py-1 text-[11px] hover:bg-neutral-50"
                        title="Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(r.id, "down")}
                        className="rounded border px-2 py-1 text-[11px] hover:bg-neutral-50"
                        title="Down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => delRow(r.id)}
                        className="rounded border border-rose-300 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-50"
                        title="Delete"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                </div>

                <div className="hidden w-8 shrink-0 sm:block">
                  <span className="text-[10px] text-neutral-400">#{idx + 1}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <h2 className="mb-2 text-[12px] font-semibold text-neutral-800">Preview</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {rows
            .slice(0, CAP)
            .filter((r) => r.visible)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((p) => {
              const isOOS = (Number(p.qty) || 0) <= 0;
              return (
                <article
                  key={p.id}
                  className="relative rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-2xl hover:-translate-y-0.5 duration-200"
                >
                  {!!p.discount && (
                    <span className="absolute left-4 top-4 rounded-md bg-green-100 text-green-700 text-xs font-semibold px-2 py-1">
                      -{p.discount}%
                    </span>
                  )}
                  {isOOS && (
                    <span className="absolute left-4 top-4 rounded-md bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-1">
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
                    <div className="aspect-[4/3] rounded-xl bg-neutral-50 overflow-hidden grid place-items-center">
                      {/* eslint-disable-next-line */}
                      {p.img ? (
                        <img src={p.img} alt={p.title} className="h-full w-full object-contain" />
                      ) : (
                        <div className="text-xs text-neutral-400">No image</div>
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
                    <div className="mt-2 text-lg font-semibold text-neutral-900">
                      ${Number(p.price).toFixed(2)}
                    </div>
                    <div className="mt-1 text-[12px]">
                      {isOOS ? (
                        <span className="text-rose-600 font-semibold">Out of Stock</span>
                      ) : (
                        <span className="text-neutral-500">{p.qty} in stock</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => orderOne(p.id)}
                      disabled={isOOS}
                      className="mt-2 h-8 w-full rounded-md bg-emerald-600 px-3 text-[12px] font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                      title={isOOS ? "Out of Stock" : "Order 1"}
                    >
                      Order
                    </button>
                  </div>
                </article>
              );
            })}
        </div>
      </div>

      {(msg.ok || msg.err) && (
        <div className={`mt-3 text-xs ${msg.ok ? "text-emerald-700" : "text-rose-700"}`}>{msg.ok || msg.err}</div>
      )}
    </main>
  );
}
