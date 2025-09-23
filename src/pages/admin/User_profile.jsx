// ProfilePageTailwind.jsx
import React from "react";
import { FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiEdit2 } from "react-icons/fi";
import Welcome_banner from "./Welcome_banner";
import main from "../img/main_logo.png"

export default function UserProfilePage() {
  return (
    <main className="min-h-svh w-[1200px] bg-[#f5f7fb] py-7 px-5 text-slate-900">
      <div className="w-[1200px] mx-auto">
        <h1 className="text-[20px] font-bold tracking-[0.2px] ml-1 mb-4">Profile</h1>

        {/* Top profile card */}
        <section className="bg-white border border-[#e9edf3] rounded-[14px] shadow-sm p-6 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
            <div>
              <img src={main} alt="" className="w-[180px]" />
            </div>
              <div className="text-[18px] font-bold truncate"></div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <a href="#facebook" className="w-11 h-11 rounded-full border border-[#e9edf3] bg-white grid place-items-center text-gray-800 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">
                <FaFacebookF size={18} />
              </a>
              <a href="#x" className="w-11 h-11 rounded-full border border-[#e9edf3] bg-white grid place-items-center text-gray-800 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">
                <FaXTwitter size={18} />
              </a>
              <a href="#linkedin" className="w-11 h-11 rounded-full border border-[#e9edf3] bg-white grid place-items-center text-gray-800 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">
                <FaLinkedinIn size={18} />
              </a>
              <a href="#instagram" className="w-11 h-11 rounded-full border border-[#e9edf3] bg-white grid place-items-center text-gray-800 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">
                <FaInstagram size={18} />
              </a>

              <button type="button" className="h-11 px-4 rounded-full border border-[#e9edf3] bg-white font-medium text-gray-700 inline-flex items-center gap-2 hover:border-gray-200 hover:shadow-[inset_0_1px_0_rgba(16,24,40,.04)] focus:outline-none focus:ring-4 focus:ring-gray-900/10 transition">
                <FiEdit2 /> Edit
              </button>
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="bg-white border border-[#e9edf3] rounded-[14px] shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[18px] font-bold">Personal Information</div>
            <button type="button" className="h-11 px-4 rounded-full border border-[#e9edf3] bg-white font-medium text-gray-700 inline-flex items-center gap-2 hover:border-gray-200 hover:shadow-[inset_0_1px_0_rgba(16,24,40,.04)] focus:outline-none focus:ring-4 focus:ring-gray-900/10 transition">
              <FiEdit2 /> Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-5 pt-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-[#667085]">Admin Name</span>
              <span className="text-[16px] font-semibold">Hiten Rana</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-[#667085]">Site Name</span>
              <span className="text-[16px] font-semibold">FOOD MART</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-[#667085]">Phone</span>
              <span className="text-[16px] font-semibold">+91 7888557390</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-[#667085]">Email</span>
              <span className="text-[16px] font-semibold">hiten9968@gmail</span>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-sm text-[#667085]">Address</span>
              <span className="text-[16px] font-semibold">
                17-ax, guru nanak tower, model town extension, ludhiana, punjab, india
              </span>
            </div>
          </div>
        </section>
      </div>
     </main>
  );
}
