// src/pages/AdminTrendingSimple.jsx
import React, { useEffect, useMemo, useState } from "react";

const CATS = ["FRUITS & VEGES", "JUICES"];

const blankRow = (cat = "FRUITS & VEGES") => ({
  id: crypto.randomUUID(),
  brand: "",
  title: "",
  desc: "",
  img: "",
  visible: true,
  // Extra UI-only fields (backend may drop them, still fine)
  category: cat,
  price: 18,
  unit: "1 UNIT",
  rating: 4.5,
  discount: 0,
  order: 9999,
});

export default function AdminTrendingSimple() {
  const [title, setTitle] = useState("Trending Products");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [filter, setFilter] = useState("ALL");

  // Load existing
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      setOk("");
      try {
        const res = await fetch(`/api/trending?ts=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`GET /api/trending ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        setTitle(String(data?.title || "Trending Products"));
        const cards = Array.isArray(data?.cards) ? data.cards : [];
        setRows(
          cards.map((c, i) => ({
            ...blankRow(),
            ...c,
            id: c.id || crypto.randomUUID(),
            category: c.category || "FRUITS & VEGES",
            price: Number.isFinite(Number(c.price)) ? Number(c.price) : 18,
            unit: c.unit || "1 UNIT",
            rating: Number.isFinite(Number(c.rating)) ? Number(c.rating) : 4.5,
            discount: Number.isFinite(Number(c.discount)) ? Number(c.discount) : 0,
            order: Number.isFinite(Number(c.order)) ? Number(c.order) : i + 1,
          }))
        );
      } catch (e) {
        if (!alive) return;
        setRows([]);
        setError(e?.message || "Load failed");
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
    setRows((arr) => [{ ...blankRow(filter === "ALL" ? "FRUITS & VEGES" : filter), order: arr.length + 1 }, ...arr]);

  const delRow = (id) => setRows((arr) => arr.filter((r) => r.id !== id));

  const move = (id, dir) =>
    setRows((arr) => {
      const idx = arr.findIndex((r) => r.id === id);
      if (idx < 0) return arr;
      const j = dir === "up" ? Math.max(0, idx - 1) : Math.min(arr.length - 1, idx + 1);
      const copy = arr.slice();
      const [item] = copy.splice(idx, 1);
      copy.splice(j, 0, item);
      return copy.map((r, i) => ({ ...r, order: i + 1 }));
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
    setError("");
    setOk("");
    try {
      const cleaned = rows.map((r, i) => ({
        id: r.id,
        brand: String(r.brand || "").trim(),
        title: String(r.title || "").trim(),
        desc: String(r.desc || "").trim(),
        img: String(r.img || "").trim(),
        visible: !!r.visible,
        // extra fields sent if backend supports
        category: r.category,
        price: r.price,
        unit: r.unit,
        rating: r.rating,
        discount: r.discount,
        order: Number.isFinite(Number(r.order)) ? Number(r.order) : i + 1,
      }));
      const payload = { title: String(title || "Trending Products").trim(), cards: cleaned };
      const res = await fetch("/api/trending", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || `Save failed ${res.status}`);
      setOk("Saved");
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setOk(""), 1200);
    }
  };

  const filtered = useMemo(() => {
    const list = filter === "ALL" ? rows : rows.filter((r) => r.category === filter);
    return list;
  }, [rows, filter]);

  const counts = useMemo(() => {
    const all = rows.length;
    const fv = rows.filter((r) => r.category === "FRUITS & VEGES").length;
    const ju = rows.filter((r) => r.category === "JUICES").length;
    return { ALL: all, "FRUITS & VEGES": fv, JUICES: ju };
  }, [rows]);

  return (
    <main className="mx-auto max-w-[1472px] px-3 sm:px-4 py-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-[15px] font-semibold">Trending Products</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={add}
            className="h-8 rounded border px-2 text-xs hover:bg-neutral-50"
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

      {/* Optional filter tabs (compact like navbar) */}
      <div className="mb-3 flex items-center gap-4 text-xs">
        {["ALL", ...CATS].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`pb-1 border-b ${filter === t ? "border-amber-300 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            type="button"
          >
            {t} <span className="ml-1 text-[10px] text-neutral-400">
              {t === "ALL" ? counts.ALL : counts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-3 rounded border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}
      {ok && (
        <div className="mb-3 rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {ok}
        </div>
      )}

      {/* Rows list - compact like screenshot */}
      {loading ? (
        <div className="text-xs text-neutral-600">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="grid place-items-center rounded border border-dashed border-neutral-300 py-10 text-xs text-neutral-600">
          No items — click Add
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r, idx) => (
            <li key={r.id} className="rounded border border-neutral-200 bg-white p-2">
              <div className="flex items-start gap-2">
                {/* Image cell */}
                <div className="w-16 shrink-0">
                  <div className="aspect-square w-full overflow-hidden rounded bg-neutral-50 ring-1 ring-neutral-200">
                    {r.img ? (
                      // eslint-disable-next-line
                      <img src={r.img} alt={r.title || "img"} className="h-full w-full object-contain" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[10px] text-neutral-400">No image</div>
                    )}
                  </div>
                  <label className="mt-1 block">
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
                  </label>
                </div>

                {/* Text fields area */}
                <div className="grid flex-1 grid-cols-1 gap-2">
                  {/* Top line inputs like screenshot: Brand, Title, Subtitle */}
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
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-[11px] text-neutral-700">
                        <input
                          type="checkbox"
                          checked={r.visible}
                          onChange={(e) => setRow(r.id, { visible: e.target.checked })}
                        />
                        Visible
                      </label>
                    </div>
                  </div>

                  {/* Second line small controls: category + tiny numbers */}
                  <div className="grid grid-cols-2 sm:grid-cols-[160px_repeat(4,minmax(0,1fr))_auto_auto_auto] gap-2">
                    <select
                      value={r.category}
                      onChange={(e) => setRow(r.id, { category: e.target.value })}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      {CATS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
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

                    {/* Actions tiny buttons like screenshot */}
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

                {/* Index bubble like screenshot side space */}
                <div className="hidden w-8 shrink-0 sm:block">
                  <span className="text-[10px] text-neutral-400">#{idx + 1}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Preview */}
      <div className="mt-6">
        <h2 className="mb-2 text-[12px] font-semibold text-neutral-800">Preview</h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {(filter === "ALL" ? rows : rows.filter((r) => r.category === filter))
            .filter((r) => r.visible)
            .map((p) => (
              <article key={p.id} className="relative rounded-2xl bg-white ring-1 ring-neutral-100 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                {!!p.discount && (
                  <span className="absolute left-3 top-3 rounded bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    -{p.discount}%
                  </span>
                )}
                <div className="p-3">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-50 grid place-items-center">
                    {/* eslint-disable-next-line */}
                    {p.img ? (
                      <img src={p.img} alt={p.title} className="h-full w-full object-contain drop-shadow-md" />
                    ) : (
                      <div className="text-[10px] text-neutral-400">No image</div>
                    )}
                  </div>
                </div>
                <div className="px-3 pb-3">
                  <h3 className="text-[11px] text-neutral-500">{p.unit}</h3>
                  <div className="mt-0.5 flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400">
                      <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.417 8.263L12 19.771 4.583 23.86 6 15.596 0 9.748l8.332-1.73z" />
                    </svg>
                    <span className="text-[11px] text-neutral-600">{p.rating}</span>
                  </div>
                  <h2 className="mt-1 line-clamp-2 text-[13px] font-semibold text-neutral-900">{p.title || p.brand || "Untitled"}</h2>
                  <div className="mt-1 text-[18px] font-semibold text-neutral-900">${Number(p.price).toFixed(2)}</div>
                </div>
              </article>
            ))}
        </div>
      </div>
    </main>
  );
}
