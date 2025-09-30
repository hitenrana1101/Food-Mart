// src/pages/Recent_blog.jsx
import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

function Meta({ children }) {
  return <span className="text-sm text-slate-500">{children}</span>;
}

function Card({ post }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-black/5 [box-shadow:0_10px_28px_-8px_rgba(0,0,0,0.22)] mb-20 mt-10">
      <div className="relative aspect-[4/3] rounded-xl p-4">
        {/* eslint-disable-next-line */}
        {post.image ? (
          <img src={post.image} alt={post.title} className="h-full w-full rounded-lg object-contain" loading="lazy" />
        ) : (
          <div className="grid h-full w-full place-items-center rounded-lg bg-neutral-50 text-xs text-neutral-400">No image</div>
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-4 text-slate-500">
          <Meta>{post.date || "—"}</Meta>
          <Meta>{post.tag || ""}</Meta>
        </div>
        <h3 className="mt-3 text-[28px] leading-snug font-semibold text-slate-900">{post.title}</h3>
        <p className="mt-3 text-[16px] text-slate-600">{post.excerpt}</p>
      </div>
    </article>
  );
}

export default function Recent_blog() {
  const [title, setTitle] = useState("Our Recent Blog");
  const [ctaText, setCtaText] = useState("Read All Article");
  const [ctaHref, setCtaHref] = useState("#");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadBlogs() {
    const res = await fetch(`/api/blogs?ts=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`GET /api/blogs ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data?.cards) ? data.cards : [];
    setTitle(String(data?.title || "Our Recent Blog"));
    setCtaText(String(data?.ctaText || "Read All Article"));
    setCtaHref(String(data?.ctaHref || "#"));
    setPosts(
      list
        .filter((p) => p.visible !== false)
        .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
        .slice(0, 3)
        .map((p, i) => ({
          id: p.id || `blog-${i}`,
          title: p.title || "",
          date: p.date || "",
          tag: p.tag || "",
          excerpt: p.excerpt || "",
          image: p.image || p.img || "",
        }))
    );
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        await loadBlogs();
      } catch {
        // keep defaults
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // Live refresh on admin save
    let ch;
    try {
      ch = new BroadcastChannel("blogs");
      ch.onmessage = (ev) => {
        if (ev?.data?.type === "updated") loadBlogs();
      };
    } catch {}
    const onStorage = (e) => {
      if (e.key === "blogs-updated") loadBlogs();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      alive = false;
      try { ch && ch.close(); } catch {}
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <section
      className="
        w-full px-4 sm:px-6 lg:px-8
        grid justify-center gap-6
        grid-cols-1
        md:[grid-template-columns:repeat(2,460px)]
        lg:[grid-template-columns:repeat(3,460px)]
      "
    >
      <div className="col-span-full grid grid-cols-1 items-center gap-y-3 gap-x-6 text-center sm:grid-cols-[minmax(0,1fr)_auto] sm:text-left">
        <h2 className="min-w-0 max-w-full break-words leading-tight text-[28px] sm:text-[32px] font-semibold text-[#222222]">
          {title}
        </h2>
        <a href={ctaHref} className="justify-self-center sm:justify-self-end inline-flex items-center gap-2 text-[16px] text-[#747474] shrink-0">
          {ctaText} <FaArrowRight />
        </a>
      </div>

      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
              <div className="aspect-[4/3] rounded-xl bg-neutral-100 animate-pulse" />
              <div className="mt-4 h-5 w-2/3 rounded bg-neutral-100 animate-pulse" />
              <div className="mt-2 h-4 w-1/2 rounded bg-neutral-100 animate-pulse" />
            </div>
          ))
        : posts.map((p) => <Card key={p.id} post={p} />)}
    </section>
  );
}
