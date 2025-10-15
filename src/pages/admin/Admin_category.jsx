// src/CustomDoorService.jsx
import React, { useMemo, useState } from "react";

// Replace these with real project image imports
import brocoli from "../img/broccoli.png";
import bread from "../img/bread.png";
import bottle from "../img/bottle.png";
import bottle2 from "../img/bottle2.png";
import legpeace from "../img/leg peace.png";
import hearbal_box from "../img/hearbal_box.png";

export default function Categorypage() {
    // Top section fields
    const [title, setTitle] = useState("category");

    // Add New Record form state
    const [firstText, setFirstText] = useState("");
    const [secondText, setSecondText] = useState("");
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    const [frontPreview, setFrontPreview] = useState("");
    const [backPreview, setBackPreview] = useState("");

    // Product catalog
    const products = useMemo(
        () => [
            { id: 1, name: "Fruit & Veges", img: brocoli },
            { id: 2, name: "Breads & Sweets", img: bread },
            { id: 3, name: "Fruit & Veges", img: bottle },
            { id: 4, name: "Fruit & Veges", img: bottle2 },
            { id: 5, name: "Fruit & Veges", img: legpeace },
            { id: 6, name: "Fruit & Veges", img: hearbal_box },
            { id: 7, name: "Fruit & Veges", img: brocoli },
            { id: 8, name: "Fruit & Veges", img: brocoli },
            { id: 9, name: "Fruit & Veges", img: brocoli },
            { id: 10, name: "Fruit & Veges", img: brocoli },
            { id: 11, name: "Fruit & Veges", img: brocoli },
            { id: 12, name: "Fruit & Veges", img: brocoli },
        ],
        []
    );
    const [selectedProductId, setSelectedProductId] = useState(products[0]?.id);

    const [records, setRecords] = useState([
        { id: 101, title: "Custom", subtitle: "Single Swing", img: brocoli },
        { id: 102, title: "Custom", subtitle: "Single Swing + Panel", img: brocoli },
        { id: 103, title: "Custom", subtitle: "Double Swing", img: brocoli },
        { id: 104, title: "Custom", subtitle: "Double Swing + Panel", img: brocoli },
        { id: 105, title: "Custom", subtitle: "Pivot", img: brocoli },
        { id: 106, title: "Custom", subtitle: "Pivot + Panel", img: brocoli },
    ]);

    // Helpers
    const readAsDataUrl = (file, setter) => {
        if (!file) {
            setter("");
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setter(String(ev.target?.result || ""));
        reader.readAsDataURL(file);
    };

    const handleFrontChange = (e) => {
        const f = e.target.files?.[0] || null;
        setFrontFile(f);
        readAsDataUrl(f, setFrontPreview);
    };
    const handleBackChange = (e) => {
        const f = e.target.files?.[0] || null;
        setBackFile(f);
        readAsDataUrl(f, setBackPreview);
    };

    const addRecord = (e) => {
        e.preventDefault();
        const sel = products.find((p) => p.id === selectedProductId);
        const newItem = {
            id: Date.now(),
            title: firstText || "Custom",
            subtitle: secondText || "Single Swing",
            img: sel?.img || prod1,
        };
        setRecords((prev) => [newItem, ...prev]);
        setFirstText("");
        setSecondText("");
        setFrontFile(null);
        setBackFile(null);
        setFrontPreview("");
        setBackPreview("");
        // .reset?.();
    };

    const removeRecord = (id) =>
        setRecords((prev) => prev.filter((r) => r.id !== id));

    return (
        <div className="min-h-screen bg-slate-50 py-6 px-4 md:px-6">
            <title>Food Mart Admin Category</title>
            {/* Top: Service meta card */}
            <section className="mx-auto w-[1200px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h1 className="text-xl font-semibold text-slate-900 mb-2">Custom Door Service</h1>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="block w-full h-10 rounded-md border border-gray-200 px-3 text-sm
                         focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600"
                        />
                    </div>
 
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-white text-sm font-medium
                       hover:bg-slate-800 w-[1155px] focus:outline-none focus:ring-4 focus:ring-slate-900/20"
                    >
                        Update Info
                    </button>
                </div>
            </section>

            {/* Add New Record */}
            <section className="mx-auto mt-6 w-full max-w-[1200px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Add New Record</h2>

                <form onSubmit={addRecord} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">First Text</label>
                            <input
                                value={firstText}
                                onChange={(e) => setFirstText(e.target.value)}
                                className="block w-full h-11 rounded-md border border-gray-200 px-3 text-sm
                           focus:outline-none focus:ring-4 focus:ring-green-600/25 focus:border-green-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Second Text</label>
                            <input
                                value={secondText}
                                onChange={(e) => setSecondText(e.target.value)}
                                className="block w-full h-11 rounded-md border border-gray-200 px-3 text-sm
                           focus:outline-none focus:ring-4 focus:ring-green-600/25 focus:border-green-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Front Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFrontChange}
                                className="block w-full rounded-md border border-gray-200 p-2 text-sm
                           file:mr-4 file:rounded-md file:border-0 file:bg-gray-50 file:px-4 file:py-2
                           focus:outline-none focus:ring-4 focus:ring-green-600/25 focus:border-green-600"
                            />
                            {frontPreview && (
                                <img
                                    src={frontPreview}
                                    alt=""
                                    className="mt-2 h-24 w-40 rounded-md object-cover"
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Back Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBackChange}
                                className="block w-full rounded-md border border-gray-200 p-2 text-sm
                           file:mr-4 file:rounded-md file:border-0 file:bg-gray-50 file:px-4 file:py-2
                           focus:outline-none focus:ring-4 focus:ring-green-600/25 focus:border-green-600"
                            />
                            {backPreview && (
                                <img
                                    src={backPreview}
                                    alt=""
                                    className="mt-2 h-24 w-40 rounded-md object-cover"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Select Product</label>

                        {/* Scrollable grid to match screenshot */}
                        <div className="h-72 overflow-y-auto rounded-md border border-gray-200 p-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {products.map((p) => {
                                    const selected = p.id === selectedProductId;
                                    return (
                                        <button
                                            type="button"
                                            key={p.id}
                                            onClick={() => setSelectedProductId(p.id)}
                                            className={[
                                                "group text-left rounded-md border p-2 transition",
                                                selected
                                                    ? "border-blue-600 ring-2 ring-blue-600/30"
                                                    : "border-gray-200 hover:border-gray-300",
                                            ].join(" ")}
                                        >
                                            <div className="h-28 w-full overflow-hidden rounded-md">
                                                <img
                                                    src={p.img}
                                                    alt={p.name}
                                                    className="h-[100px] w-[fit] mx-23 my- items-center flex justify-center object-cover"
                                                />
                                            </div>
                                            <div className="mt-2 truncate text-xs text-center text-slate-700">
                                                {p.name}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-white text-sm font-semibold
                       hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20"
                    >
                        Add Record
                    </button>
                </form>
            </section>

            {/* Door Records */}
            <section className="mx-auto mt-6 w-full max-w-[1200px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Door Records</h2>

                <ul className="space-y-4">
                    {records.map((r) => (
                        <li
                            key={r.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                                <p className="text-slate-600 text-sm">{r.subtitle}</p>
                            </div>

                            <img
                                src={r.img}
                                alt=""
                                className="h-fit w-fit rounded-md object-cover"
                            />

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => alert("Edit clicked")}
                                    className="rounded-[10px] bg-amber-500 px-4 py-2 text-white text-xs font-medium shadow-sm
                             hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/30"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeRecord(r.id)}
                                    className="rounded-[10px] bg-red-600 px-4 py-2 text-white text-xs font-medium shadow-sm
                             hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/30"
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
