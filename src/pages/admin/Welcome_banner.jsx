import React, { useState } from "react";
import img1 from "../img/product-thumb-1.png";
import img2 from "../img/product-thumb-1.png";
import img3 from "../img/product-thumb-2.png";

export default function WelcomeBannerPage() {
  // Initial list data (as shown in screenshot)
  const [banners, setBanners] = useState([
    { id: 1, title: "Welcome To", subtitle: "Food Mart ", image: img1 },
    { id: 2, title: "Welcome To", subtitle: "Food Mart", image: img2 },
    { id: 3, title: "welcome to", subtitle: "Food Mart", image: img3 },
  ]);

  // Form state
  const [firstText, setFirstText] = useState("");
  const [secondText, setSecondText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // Create a new item using form values (fallback to a placeholder if no image chosen)
    const next = {
      id: Date.now(),
      title: firstText || "Welcome To",
      subtitle: secondText || "Food Mart",
      image: preview || img1,
    };
    setBanners((p) => [next, ...p]);
    // reset form
    setFirstText("");
    setSecondText("");
    setFile(null);
    setPreview("");
    // also clear file input value
    if (e.target && e.target.reset) e.target.reset();
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(String(ev.target?.result || ""));
      reader.readAsDataURL(f);
    } else {
      setPreview("");
    }
  };

  const onDelete = (id) => setBanners((p) => p.filter((b) => b.id !== id));

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-6">
      {/* Card 1: Welcome Banner (form) */}
      <div className="mx-auto w-[1200px] rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-950 mb-4">
          Welcome Banner
        </h1>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="firstText"
              className="block text-sm font-medium text-[#747474] mb-2"
            >
              First Text
            </label>
            <input
              id="firstText"
              type="text"
              value={firstText}
              onChange={(e) => setFirstText(e.target.value)}
              className="block w-full h-12 rounded-lg border border-gray-200 px-4 text-base placeholder:text-gray-400
                         focus:outline-none focus:ring-4 focus:ring-green-600/30 focus:border-green-600"
            />
          </div>

          <div>
            <label
              htmlFor="secondText"
              className="block text-sm font-medium text-[#747474] mb-2"
            >
              Second Text
            </label>
            <input
              id="secondText"
              type="text"
              value={secondText}
              onChange={(e) => setSecondText(e.target.value)}
              className="block w-full h-12 rounded-lg border border-gray-200 px-4 text-base placeholder:text-gray-400
                         focus:outline-none focus:ring-4 focus:ring-green-600/30 focus:border-green-600"
            />
          </div>

          <div>
            <label
              htmlFor="bannerImage"
              className="block text-sm font-medium text-[#747474] mb-2"
            >
              Banner Image
            </label>
            <input
              id="bannerImage"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block w-full rounded-lg border border-gray-200 p-2.5 text-base
                         file:mr-4 file:rounded-md file:border-0 file:bg-gray-50 file:px-4 file:py-2
                         focus:outline-none focus:ring-4 focus:ring-green-600/30 focus:border-green-600"
            />
          </div>

          <button
            type="submit"
            className="block w-full h-9 rounded-lg bg-green-600 text-white font-medium
                       hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-600/30"
          >
            Add Banner
          </button>
        </form>
      </div>

      {/* Card 2: Banner List */}
      <section className="mx-auto mt-6 w-full max-w-[1440px] rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-2xl md:text-3xl font-bold text-slate-900">
          Banner List
        </h2>

        <ul className="space-y-5">
          {banners.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              {/* Left: text */}
              <div className="min-w-0">
                <p className="text-lg font-semibold text-slate-900">{b.title}</p>
                <p className="text-slate-600">{b.subtitle}</p>
              </div>

              {/* Middle: image thumbnail */}
              <img
                src={b.image}
                alt=""
                className="h-12 w-[35px] rounded-md object-cover"
              />

              {/* Right: actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-[10px] bg-amber-500 px-5 py-2 text-white font-medium shadow-sm
                             hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/30"
                  onClick={() => alert("Edit clicked")}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-[10px] bg-red-600 px-5 py-2 text-white font-medium shadow-sm
                             hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/30"
                  onClick={() => onDelete(b.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
