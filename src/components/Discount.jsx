import React from "react";

const Discount = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 my-20">
      {/* Background container is always the parent; auto-height on mobile, fixed size only on lg+ */}
      <div className="mx-auto w-full max-w-[1472px] bg-[#E6F3FB] rounded-[28px] overflow-hidden lg:h-[609px]">
        <div className="grid items-center gap-8 p-6 sm:p-8 lg:p-16 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_560px]">
          {/* Left: Copy */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-sans font-semibold text-[28px] sm:text-[40px] lg:text-[56px] leading-tight text-[#0f172a]">
                Get
              </h1>
              <h1 className="font-sans font-semibold text-[28px] sm:text-[40px] lg:text-[56px] leading-tight text-[#ffc43f]">
                25% Discount
              </h1>
            </div>

            <h2 className="mt-2 font-sans font-semibold text-[26px] sm:text-[36px] lg:text-[48px] leading-tight text-[#0f172a] max-w-[38rem] break-words">
              on your first purchase
            </h2>

            <p className="mt-4 text-[15px] sm:text-[16px] leading-7 text-[#747474] max-w-[42rem]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dictumst amet, metus, sit massa posuere maecenas. At tellus ut nunc amet vel egestas.
            </p>
          </div>

          {/* Right: Form */}
          <form className="w-full">
            <label htmlFor="name" className="block text-sm font-medium text-[#747474]">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Name"
              className="mt-2 block h-12 w-full rounded-[10px] bg-white px-3 text-[#222222]
                         ring-1 ring-[#cfe7f5] focus:outline-none focus:ring-2 focus:ring-[#9bd0f0]"
            />

            <label htmlFor="email" className="mt-5 block text-sm font-medium text-[#747474]">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="abc@mail.com"
              className="mt-2 block h-12 w-full rounded-[10px] bg-white px-3 text-[#222222]
                         ring-1 ring-[#cfe7f5] focus:outline-none focus:ring-2 focus:ring-[#9bd0f0]"
            />

            <label className="mt-5 inline-flex items-center gap-3 text-[#747474]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#cfe7f5] text-[#0f172a] focus:ring-[#9bd0f0]"
              />
              <span>Subscribe to the newsletter</span>
            </label>

            <button
              type="submit"
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[10px]
                         bg-[#212529] hover:bg-[#3c3c3c] px-4 text-[18px] sm:text-[20px] font-medium text-white"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Discount;
