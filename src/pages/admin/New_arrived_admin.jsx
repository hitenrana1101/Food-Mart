import React, { useEffect, useState } from "react";

import thumb from "../../img/thumb.jpg";
import thumb2 from "../../img/thumb2.jpg";
import thumb3 from "../../img/thumb3.jpg";
import thumb4 from "../../img/thumb4.jpg";

const loadLS = (k, f) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : f;
  } catch {
    return f;
  }
};
const saveLS = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch { }
};

const makeCard = (i) => ({
  id: crypto.randomUUID(),
  brand: ["Amber Jar", "Pouch", "Tin Pack", "Snack Co", "Herbal", "Spice Mix"][i % 6],
  title: ["Honey best", "Dried fruits", "Green fish", "Tomato soup", "Herbal mix", "Masala spice"][i % 6],
  desc: "nectar you wish to get",
  img: [thumb, thumb2, thumb3, thumb4, thumb, thumb2][i % 6],
  visible: true,
});

export default function Newarrived() {
  const [sectionTitle, setSectionTitle] = useState(() =>
    loadLS("na:title", "Newly Arrived Brands")
  );
  const [cards, setCards] = useState(() =>
    loadLS("na:cards", Array.from({ length: 6 }, (_, i) => makeCard(i)))
  );
  // const [data, setData] = useState({}); // 👈 Flask API data

  // const fetchData = async () => {
  //   try {
  //     const response = await fetch("http://localhost:5000/api/data");
  //     const jsonData = await response.json();
  //     setData(jsonData);
  //   } catch (error) {
  //     console.log("Error", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  useEffect(() => saveLS("na:title", sectionTitle), [sectionTitle]);
  useEffect(() => saveLS("na:cards", cards), [cards]);

  const update = (id, patch) =>
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const removeCard = (id) => setCards((p) => p.filter((c) => c.id !== id));

  const move = (id, dir) =>
    setCards((prev) => {
      const i = prev.findIndex((c) => c.id === id);
      const j = i + (dir === "up" ? -1 : 1);
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  function pickImage(id, inputEl) {
    const file = inputEl.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      update(id, { img: reader.result });
      inputEl.value = "";
    };
    reader.readAsDataURL(file);
  }

  const preview = cards.slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto p-5 md:p-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-6">
        <div className="flex-1">
          <label className="text-xs text-neutral-500">Section title</label>
          <input
            className="mt-1 w-full bg-transparent text-3xl md:text-4xl font-semibold outline-none"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              localStorage.removeItem("na:title");
              localStorage.removeItem("na:cards");
              setSectionTitle("Newly Arrived Brands");
              setCards(Array.from({ length: 6 }, (_, i) => makeCard(i)));
            }}
            className="px-4 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
            type="button"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Editor list */}
      <div className="grid gap-5">
        {cards.map((c, idx) => (
          <div
            key={c.id}
            className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 flex items-center gap-5"
          >
            {/* Image + picker */}
            <div className="w-[132px] shrink-0">
              <label className="block cursor-pointer">
                <img
                  src={c.img}
                  key={c.img}
                  alt={c.title}
                  className="w-[132px] h-[132px] object-cover rounded-xl border border-neutral-200"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => pickImage(c.id, e.target)}
                />
                <span className="text-[11px] inline-block mt-1 text-neutral-600">
                  Click to change
                </span>
              </label>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="col-span-2">
                <label className="text-xs text-neutral-500">
                  {/* {data.message || ""}*/} Brand 
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                  value={c.brand}
                  onChange={(e) => update(c.id, { brand: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Title</label>
                <input
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                  value={c.title}
                  onChange={(e) => update(c.id, { title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Subtitle</label>
                <input
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                  value={c.desc}
                  onChange={(e) => update(c.id, { desc: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={c.visible}
                  onChange={(e) => update(c.id, { visible: e.target.checked })}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span className="text-sm">Visible</span>
              </label>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => move(c.id, "up")}
                  disabled={idx === 0}
                  className="px-3 py-2 rounded-md border border-neutral-300 disabled:opacity-40"
                  type="button"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(c.id, "down")}
                  disabled={idx === cards.length - 1}
                  className="px-3 py-2 rounded-md border border-neutral-300 disabled:opacity-40"
                  type="button"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeCard(c.id)}
                  className="text-red-600 hover:bg-red-50 border border-red-200 px-3 py-2 rounded-md text-sm"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-3">Preview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {preview.map((i) => (
            <article
              key={i.id}
              className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 text-center ${i.visible ? "" : "opacity-50"
                }`}
            >
              <img
                src={i.img}
                key={i.img}
                alt={i.title}
                className="w-[132px] h-[132px] rounded-xl object-cover mx-auto"
              />
              <div className="mt-4">
                <p className="text-neutral-500 text-sm">{i.brand}</p>
                <h4 className="text-lg font-semibold">{i.title}</h4>
                <p className="text-neutral-600">{i.desc}</p>
                {!i.visible && (
                  <span className="mt-2 inline-block text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Hidden
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
  0
}
