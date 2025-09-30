// src/pages/admin/NewlyArrivedAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";

export default function NewlyArrivedAdmin() {
  const [title, setTitle] = useState("Newly Arrived Brands");
  const [cards, setCards] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchJSON = async (url, init) => {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`${init?.method || "GET"} ${url} failed ${res.status}`);
    return res.json();
  };

  useEffect(() => {
    (async () => {
      try {
        const json = await fetchJSON("/api/new-arrived", { cache: "no-store" });
        setTitle(json.title || "Newly Arrived Brands");
        setCards(Array.isArray(json.cards) ? json.cards : []);
        setDirty(false);
      } catch (e) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const add = () => { setCards((p) => [...p, { id: Date.now(), brand: "", title: "", desc: "", img: "", visible: true }]); setDirty(true); };
  const patch = (id, patchData) => { setCards((p) => p.map((c) => (c.id === id ? { ...c, ...patchData } : c))); setDirty(true); };
  const remove = (id) => { setCards((p) => p.filter((c) => c.id !== id)); setDirty(true); };

  const move = (id, dir) => {
    setCards((prev) => {
      const i = prev.findIndex((c) => c.id === id);
      const j = i + (dir === "up" ? -1 : 1);
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setDirty(true);
  };

  const upload = async (id, file) => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/upload-image", { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Upload failed ${res.status}`);
    const { url } = await res.json();
    patch(id, { img: url });
  };

  const onPick = (id, input) => {
    const f = input.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/") || f.size > 5 * 1024 * 1024) { alert("Only images up to 5MB"); input.value = ""; return; }
    upload(id, f).catch((e) => alert(e.message)).finally(() => { input.value = ""; });
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetchJSON("/api/new-arrived", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, cards }),
      });
      setDirty(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const preview = useMemo(() => cards.slice(0, 6), [cards]);
  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between gap-4 mb-6">
        <input className="flex-1 text-3xl font-semibold outline-none" value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} />
        <div className="flex gap-2">
          <button onClick={add} className="border px-3 py-2 rounded-md">Add</button>
          <button onClick={save} disabled={!dirty || saving} className="px-3 py-2 rounded-md text-white disabled:opacity-40 bg-emerald-600">Save</button>
        </div>
      </div>

      <div className="grid gap-5">
        {cards.map((c, idx) => (
          <div key={c.id} className="rounded-2xl bg-white p-5 ring-1 ring-black/5 flex gap-5">
            <label className="w-[132px] shrink-0 cursor-pointer">
              {c.img ? <img src={c.img} alt="" className="w-[132px] h-[132px] object-cover rounded-xl border" /> : <div className="w-[132px] h-[132px] rounded-xl border bg-neutral-100" />}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPick(c.id, e.target)} />
              <span className="text-[11px] text-neutral-600">Click to change</span>
            </label>

            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="col-span-2">
                <label className="text-xs text-neutral-500">Brand</label>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={c.brand} onChange={(e) => patch(c.id, { brand: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Title</label>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={c.title} onChange={(e) => patch(c.id, { title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Subtitle</label>
                <input className="mt-1 w-full border rounded-md px-3 py-2" value={c.desc} onChange={(e) => patch(c.id, { desc: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 select-none">
                <input type="checkbox" checked={!!c.visible} onChange={(e) => patch(c.id, { visible: e.target.checked })} className="h-4 w-4 accent-emerald-600" />
                <span className="text-sm">Visible</span>
              </label>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => move(c.id, "up")} disabled={idx === 0} className="border px-3 py-2 rounded-md disabled:opacity-40">↑</button>
                <button onClick={() => move(c.id, "down")} disabled={idx === cards.length - 1} className="border px-3 py-2 rounded-md disabled:opacity-40">↓</button>
                <button onClick={() => remove(c.id)} className="text-red-600 hover:bg-red-50 border border-red-200 px-3 py-2 rounded-md text-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-3">Preview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {preview.map((i) => (
            <article key={i.id} className={`rounded-3xl bg-white p-6 ring-1 ring-black/5 text-center ${i.visible ? "" : "opacity-50"}`}>
              {i.img ? <img src={i.img} alt={i.title} className="w-[132px] h-[132px] rounded-xl object-cover mx-auto" /> : <div className="w-[132px] h-[132px] rounded-xl bg-neutral-100 mx-auto" />}
              <div className="mt-4">
                <p className="text-neutral-500 text-sm">{i.brand}</p>
                <h4 className="text-lg font-semibold">{i.title}</h4>
                <p className="text-neutral-600">{i.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
