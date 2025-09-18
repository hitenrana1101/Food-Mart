import React from "react";
import { FaArrowRight } from "react-icons/fa";
import banner1 from "../img/post-thumb-1.jpg";
import banner2 from "../img/post-thumb-2.jpg";
import banner3 from "../img/post-thumb-3.jpg";

const posts = [
  {
    id: 1,
    title: "Top 10 casual look ideas to dress up your kids",
    date: "22 AUG 2021",
    tag: "TIPS & TRICKS",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipi elit. Aliquet eleifend viverra enim tincidunt donec quam. A in arcu, hendrerit neque dolor morbi...",
    image: banner1,
  },
  {
    id: 2,
    title: "Latest trends of wearing street wears supremely",
    date: "25 AUG 2021",
    tag: "TRENDING",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipi elit. Aliquet eleifend viverra enim tincidunt donec quam. A in arcu, hendrerit neque dolor morbi...",
    image: banner2,
  },
  {
    id: 3,
    title: "10 Different Types of comfortable clothes ideas for women",
    date: "28 AUG 2021",
    tag: "INSPIRATION",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipi elit. Aliquet eleifend viverra enim tincidunt donec quam. A in arcu, hendrerit neque dolor morbi...",
    image: banner3,
  },
];

function Meta({ children }) {
  return <span className="text-sm text-slate-500">{children}</span>;
}

function Card({ post }) {
  return (
    <article
      className="
        overflow-hidden rounded-2xl border border-slate-200 bg-white
        shadow-lg shadow-black/5
        [box-shadow:0_10px_28px_-8px_rgba(0,0,0,0.22)]
        mb-20 mt-10
      "
    >
      {/* Media */}
      <div className="relative aspect-[4/3] rounded-xl p-4">
        <img
          src={post.image}
          alt={post.title}
          className="h-full w-full rounded-lg object-contain"
          loading="lazy"
        />
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-4 text-slate-500">
          <Meta>{post.date}</Meta>
          <Meta>{post.tag}</Meta>
        </div>

        <h3 className="mt-3 text-[28px] leading-snug font-semibold text-slate-900">
          {post.title}
        </h3>

        <p className="mt-3 text-[16px] text-slate-600">{post.excerpt}</p>
      </div>
    </article>
  );
}

export default function Recent_blog() {
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
      {/* Header spans grid so it's always above the centered cards */}
      <div
        className="
          col-span-full
          grid grid-cols-1 items-center gap-y-3 gap-x-6 text-center
          sm:grid-cols-[minmax(0,1fr)_auto] sm:text-left
        "
      >
        <h2 className="min-w-0 max-w-full break-words leading-tight text-[28px] sm:text-[32px] font-semibold text-[#222222]">
          Our Recent Blog
        </h2>
        <a
          href="#"
          className="justify-self-center sm:justify-self-end inline-flex items-center gap-2 text-[16px] text-[#747474] shrink-0"
        >
          Read All Article <FaArrowRight />
        </a>
      </div>

      {/* Cards */}
      {posts.map((p) => (
        <Card key={p.id} post={p} />
      ))}
    </section>
  );
}
