 import React from 'react'
import phone from '../img/phone.png'
import app from '../img/app-store.jpg'
import google from '../img/google-play.jpg'

const Shop_faster = () => {
  return (
    <>
      {/* Center-safe container; doesn't change design, just prevents overflow */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="
            flex flex-col lg:flex-row
            justify-evenly items-center
            bg-[#fcf7eb]
            h-auto md:h-[520px]
            mt-[100px] mb-[120px]
            rounded-[28px]
            overflow-visible
            gap-5
            px-5
          "
        >
          {/* Phone with left gap */}
          <div className="pl-5">
            <img
              src={phone}
              alt=""
              className="
                /* Keep original look at md/lg; make small screens safer */
                w-[220px] sm:w-[280px] md:w-[353px]
                h-auto md:h-[520px] lg:h-[730px]
                max-h-[70vh] md:max-h-[520px] lg:max-h-none
                object-contain
              "
              loading="lazy"
            />
          </div>

          {/* Text with right gap */}
          <div className="bg-[#fcf7eb] pr-5 text-left">
            <h1 className="text-[32px] text-[#222222] font-sans font-semibold mb-[24px]">
              Shop faster with foodmart App
            </h1>

            <p
              className="
                w-full md:w-[760px]
                text-[16px] text-[#747474] mb-[16px]
                leading-8 text-justify
              "
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sagittis sed ptibus liberolectus nonet psryroin.
              Amet sed lorem posuere sit iaculis amet, ac urna. Adipiscing fames semper erat ac in suspendisse iaculis.
              Amet blandit tortor praesent ante vitae. A, enim pretiummi senectus magna. Sagittis sed ptibus liberolectus non et psryroin.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <img src={app} alt="" className="h-12 w-auto" />
              <img src={google} alt="" className="h-12 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Shop_faster
