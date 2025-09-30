// src/pages/AdminRecentBlog.jsx
import React, { useEffect, useRef, useState } from "react";

const CAP = 3;
const TAGS = ["TIPS & TRICKS", "TRENDING", "INSPIRATION", "NEWS"];

const newPost = () => ({
  id: crypto.randomUUID(),
  title: "",
  date: "",
  tag: TAGS[0],
  excerpt: "",
  image: "",
  visible: true,
  order: 9999,
});

function broadcastRefresh() {
  try { const ch = new BroadcastChannel("blogs"); ch.postMessage({ type: "updated", ts: Date.now() }); ch.close(); } catch {}
  try { localStorage.setItem("blogs-updated", String(Date.now())); } catch {}
}

export default function AdminRecentBlog() {
  const [title, setTitle] = useState("Our Recent Blog");
  const [ctaText, setCtaText] = useState("Read All Article");
  const [ctaHref, setCtaHref] = useState("#");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState({ ok: "", err: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setMsg({ ok: "", err: "" });
      try {
        const res = await fetch(`/api/blogs?ts=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`GET /api/blogs ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        const list = Array.isArray(data?.cards) ? data.cards : [];
        setTitle(String(data?.title || "Our Recent Blog"));
        setCtaText(String(data?.ctaText || "Read All Article"));
        setCtaHref(String(data?.ctaHref || "#"));
        setRows(
          list.slice(0, CAP).map((p, i) => ({
            ...newPost(),
            ...p,
            id: p.id || crypto.randomUUID(),
            title: String(p.title || ""),
            date: String(p.date || ""),
            tag: String(p.tag || TAGS[0]),
            excerpt: String(p.excerpt || ""),
            image: String(p.image || p.img || ""),
            visible: p.visible !== false,
            order: Number.isFinite(Number(p.order)) ? Number(p.order) : i + 1,
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
    return () => { alive = false; };
  }, []);

  useEffect(() => { if (!loading) setDirty(true); }, [title, ctaText, ctaHref]);

  const setCard = (id, patch) => { setRows((a) => a.map((r) => (r.id === id ? { ...r, ...patch } : r))); setDirty(true); };
  const add = () => setRows((a) => (a.length >= CAP ? a : [{ ...newPost(), order: a.length + 1 }, ...a]));
  const duplicate = (id) => setRows((a) => {
    const i = a.findIndex((x) => x.id === id);
    if (i < 0 || a.length >= CAP) return a;
    const clone = { ...a[i], id: crypto.randomUUID(), title: `${a[i].title}` };
    const out = a.slice(); out.splice(i + 1, 0, clone); setDirty(true);
    return out.map((x, k) => ({ ...x, order: k + 1 }));
  });
  const del = (id) => { setRows((a) => a.filter((r) => r.id !== id).map((x, k) => ({ ...x, order: k + 1 }))); setDirty(true); };

  const dragId = useRef(null);
  const onDragStart = (id) => (e) => { dragId.current = id; e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (id) => (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const onDrop = (id) => (e) => {
    e.preventDefault();
    const from = dragId.current; dragId.current = null;
    if (!from || from === id) return;
    setRows((a) => {
      const i = a.findIndex((x) => x.id === from); const j = a.findIndex((x) => x.id === id);
      if (i < 0 || j < 0) return a;
      const copy = a.slice(); const [row] = copy.splice(i, 1); copy.splice(j, 0, row); setDirty(true);
      return copy.map((x, k) => ({ ...x, order: k + 1 }));
    });
  };

  const upload = async (file) => {
    const fd = new FormData(); fd.append("image", file);
    const res = await fetch("/api/upload-image", { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Upload failed ${res.status}`);
    const data = await res.json(); if (!data?.url) throw new Error("No URL");
    return data.url;
  };

  const save = async () => {
    setSaving(true); setMsg({ ok: "", err: "" });
    try {
      const cleaned = rows.slice(0, CAP).map((r, i) => ({
        id: r.id, title: String(r.title || "").trim(), date: String(r.date || "").trim(),
        tag: String(r.tag || TAGS[0]).trim(), excerpt: String(r.excerpt || "").trim(),
        image: String(r.image || "").trim(), visible: !!r.visible,
        order: Number.isFinite(Number(r.order)) ? Number(r.order) : i + 1,
      }));
      const payload = { title: String(title || "Our Recent Blog").trim(), ctaText: String(ctaText || "Read All Article").trim(), ctaHref: String(ctaHref || "#").trim(), cards: cleaned };
      const res = await fetch("/api/blogs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error(data?.error || `Save failed ${res.status}`);
      setMsg({ ok: "Saved", err: "" }); setDirty(false); broadcastRefresh();
    } catch (e) { setMsg({ ok: "", err: e?.message || "Save failed" }); }
    finally { setSaving(false); setTimeout(() => setMsg((m) => ({ ...m, ok: "" })), 1200); }
  };

  useEffect(() => {
    const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (!saving) save(); } };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [saving, rows, title, ctaText, ctaHref]);

  return (
    <main className="mx-auto w-full max-w-screen-xl px-3 sm:px-5 py-6 overflow-x-hidden">
      {/* Top bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 min-w-0 flex-1 rounded-md border border-neutral-300 px-3 text-sm" placeholder="Section title" />
          <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="h-10 rounded-md border border-neutral-300 px-3 text-sm" placeholder="CTA text" />
          <input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} className="h-10 w-56 rounded-md border border-neutral-300 px-3 text-sm" placeholder="CTA link" />
          {dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={add} disabled={rows.length >= CAP} className="h-10 rounded-md border px-3 text-sm disabled:opacity-50" type="button">+ Add Post</button>
          <button onClick={save} disabled={saving} className="h-10 rounded-md bg-emerald-600 px-4 text-sm text-white disabled:opacity-60" type="button">{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>

      {msg.err && <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">{msg.err}</div>}
      {msg.ok && <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">{msg.ok}</div>}

      {/* Editor + Preview */}
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editor cards */}
        <ul className="grid min-w-0 grid-cols-1 gap-4">
          {loading ? (
            <li className="rounded-2xl border bg-white p-4 text-sm text-neutral-600">Loading...</li>
          ) : rows.length === 0 ? (
            <li className="rounded-2xl border bg-white p-8 text-center text-sm text-neutral-600">No posts — click Add</li>
          ) : (
            rows.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)).map((r, idx) => (
              <li key={r.id} draggable onDragStart={onDragStart(r.id)} onDragOver={onDragOver(r.id)} onDrop={onDrop(r.id)} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-600">{idx + 1}</span>
                    <button onClick={() => setCard(r.id, { visible: !r.visible })} className={`rounded-full px-2 py-1 text-xs ring-1 ${r.visible ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`} type="button">
                      {r.visible ? "Visible" : "Hidden"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => duplicate(r.id)} className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-50" type="button">Duplicate</button>
                    <button onClick={() => del(r.id)} className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50" type="button">Delete</button>
                    <span className="cursor-grab select-none text-neutral-500" title="Drag to reorder">⠿</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr]">
                  <div>
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-50 ring-1 ring-neutral-200 grid place-items-center">
                      {/* eslint-disable-next-line */}
                      {r.image ? <img src={r.image} alt={r.title || "image"} className="h-full w-full object-contain" /> : <span className="text-xs text-neutral-400">No image</span>}
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      <label className="text-xs text-neutral-600">Replace image</label>
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const f = e.target.files?.[0]; e.currentTarget.value = ""; if (!f) return;
                        try { const url = await upload(f); setCard(r.id, { image: url }); } catch (err) { alert(err?.message || "Upload failed"); }
                      }} className="text-xs" />
                      <input type="url" value={r.image} onChange={(e) => setCard(r.id, { image: e.target.value })} placeholder="/uploads/..." className="rounded-md border px-2 py-1 text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_150px] gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Title</label>
                        <input value={r.title} onChange={(e) => setCard(r.id, { title: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Post title" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Date</label>
                        <input type="date" value={r.date} onChange={(e) => setCard(r.id, { date: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-700">Tag</label>
                      <div className="flex flex-wrap gap-2">
                        {TAGS.map((t) => (
                          <button key={t} type="button" onClick={() => setCard(r.id, { tag: t })} className={`rounded-full px-3 py-1 text-xs ring-1 ${r.tag === t ? "bg-neutral-900 text-white ring-neutral-900" : "bg-white text-neutral-700 ring-neutral-300 hover:bg-neutral-50"}`}>{t}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-700">Excerpt</label>
                      <textarea rows={3} value={r.excerpt} onChange={(e) => setCard(r.id, { excerpt: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Short description for the card" />
                      <div className="mt-1 text-[11px] text-neutral-500">{(r.excerpt || "").length} chars</div>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Order</label>
                        <input type="number" value={r.order ?? 9999} onChange={(e) => setCard(r.id, { order: Number(e.target.value) })} className="w-full rounded-md border px-3 py-2 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* Live Preview */}
        <aside className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-neutral-800">Preview</h3>
          <div className="col-span-full grid grid-cols-1 items-center gap-y-3 gap-x-6 text-center sm:grid-cols-[minmax(0,1fr)_auto] sm:text-left mb-4">
            <h2 className="min-w-0 max-w-full break-words leading-tight text-[26px] sm:text-[30px] font-semibold text-[#222222]">{title || "Our Recent Blog"}</h2>
            <a href={ctaHref || "#"} className="justify-self-center sm:justify-self-end inline-flex items-center gap-2 text-[15px] text-[#747474] shrink-0">{ctaText || "Read All Article"} →</a>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {rows
              .slice(0, CAP)
              .filter((x) => x.visible)
              .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || (a.title || "").localeCompare(b.title || ""))
              .map((post) => (
                <article key={post.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-black/5">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line */}
                    {post.image ? <img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : <div className="grid h-full w-full place-items-center bg-neutral-50 text-xs text-neutral-400">No image</div>}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200">{post.tag || TAGS[0]}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-4 text-slate-500">
                      <span className="text-sm">{post.date || "—"}</span>
                      <span className="text-sm">{post.tag || TAGS[0]}</span>
                    </div>
                    <h3 className="mt-2 text-[20px] leading-snug font-semibold text-slate-900">{post.title || "Untitled"}</h3>
                    <p className="mt-2 text-[14px] text-slate-600">{post.excerpt || "—"}</p>
                  </div>
                </article>
              ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

