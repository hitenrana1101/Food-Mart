import React from 'react'
import logo from "../img/main_logo.png"
import { TiSocialFacebook } from "react-icons/ti";
import { SlSocialTwitter } from "react-icons/sl";
import { FaYoutube, FaInstagram, FaAmazon } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-white">
      {/* Top Section (centered wrapper + high cap to avoid over-spread on zoom) */}
      <div className="w-full">
        <div className="mx-auto px-6 md:px-12 max-w-[1800px]">
          <div className="my-24 flex flex-col md:flex-row flex-wrap justify-between gap-12">
            {/* Logo + Social Icons */}
            <div>
              <img src={logo} alt="main_logo" className="mb-6" />
              <div className="flex gap-3 mt-15">
                <a href="#" aria-label="Facebook">
                  <TiSocialFacebook className="w-8 h-8 hover:text-black rounded-[5px] p-2 bg-white text-[#747474] border border-[#f1f1f1] hover:bg-[#e4e4e4e5]" />
                </a>
                <a href="#" aria-label="Twitter">
                  <SlSocialTwitter className="w-8 h-8 hover:text-black rounded-[5px] p-2 bg-white text-[#747474] border border-[#f1f1f1] hover:bg-[#e4e4e4e5]" />
                </a>
                <a href="#" aria-label="YouTube">
                  <FaYoutube className="w-8 h-8 hover:text-black rounded-[5px] p-2 bg-white text-[#747474] border border-[#f1f1f1] hover:bg-[#e4e4e4e5]" />
                </a>
                <a href="#" aria-label="Instagram">
                  <FaInstagram className="w-8 h-8 hover:text-black rounded-[5px] p-2 bg-white text-[#747474] border border-[#f1f1f1] hover:bg-[#e4e4e4e5]" />
                </a>
                <a href="#" aria-label="Amazon">
                  <FaAmazon className="w-8 h-8 hover:text-black rounded-[5px] p-2 bg-white text-[#747474] border border-[#f1f1f1] hover:bg-[#e4e4e4e5]" />
                </a>
              </div>
            </div>

            {/* Ultras */}
            <div>
              <h3 className="text-[20px] font-semibold">Ultras</h3>
              <ul className="mt-4 space-y-2 text-[#747474]">
                <li><a href="#">About us</a></li>
                <li><a href="#">Conditions</a></li>
                <li><a href="#">Our Journals</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Affiliate Programme</a></li>
                <li><a href="#">Ultras Press</a></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-[20px] font-semibold">Customer Service</h3>
              <ul className="mt-4 space-y-2 text-[#747474]">
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Returns & Refunds</a></li>
                <li><a href="#">Cookie Guidelines</a></li>
                <li><a href="#">Delivery Information</a></li>
              </ul>
            </div>

            {/* Resources (duplicate heading kept same) */}
            <div>
              <h3 className="text-[20px] font-semibold">Customer Service</h3>
              <ul className="mt-4 space-y-2 text-[#747474]">
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Returns & Refunds</a></li>
                <li><a href="#">Cookie Guidelines</a></li>
                <li><a href="#">Delivery Information</a></li>
              </ul>
            </div>

            {/* Subscribe */}
            <div>
              <h3 className="text-[20px] font-semibold">Subscribe Us</h3>
              <p className="w-full md:w-[340px] mt-3 text-[#747474]">
                Subscribe to our newsletter to get updates about our grand offers
              </p>
              <div className="flex mt-4">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="bg-[#f8f8f8] p-2 rounded-l-[8px] flex-1 outline-none"
                />
                <button className="bg-[#212529] px-4 rounded-r-[8px] text-white">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section (same centered cap) */}
      <div className="w-full border-t border-gray-200">
        <div className="mx-auto px-6 md:px-12 max-w-[1800px]">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left text-[#747474] py-6">
            <p>©2025 Foodmart. All rights reserved.</p>
            <p className="mt-2 md:mt-0">
              Free HTML Template by TemplatesJungle Distributed by ThemeWagon
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
