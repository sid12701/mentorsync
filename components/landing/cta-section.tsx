"use client"

export default function CTASection() {
  return (
    <div className="w-full relative overflow-hidden flex flex-col justify-center items-center gap-2">
      {/* Content */}
      <div className="self-stretch px-6 md:px-24 py-12 md:py-12 border-t border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6 relative z-10">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="w-full h-full relative">
            {Array.from({ length: 300 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-4 w-full rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                style={{
                  top: `${i * 16 - 120}px`,
                  left: "-100%",
                  width: "300%",
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[586px] px-6 py-5 md:py-8 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-6 relative z-20">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="self-stretch text-center flex justify-center flex-col text-gray-900 text-3xl md:text-5xl font-bold leading-tight md:leading-[56px] font-sans tracking-tight">
              Ready to accelerate your learning?
            </div>
            <div className="self-stretch text-center text-gray-600 text-base leading-7 font-sans font-medium">
              Schedule a personalized demo and see how MentorSync
              <br />
              connects you with the right expert for your goals.
            </div>
          </div>
          <div className="w-full max-w-[497px] flex flex-col justify-center items-center gap-12">
            <div className="flex justify-start items-center gap-4">
              <div className="h-10 px-12 py-[6px] relative bg-purple-700 hover:bg-purple-800 shadow-lg shadow-purple-500/30 overflow-hidden rounded-full flex justify-center items-center cursor-pointer transition-all duration-200">
                <div className="w-44 h-[41px] absolute left-0 top-0 bg-gradient-to-b from-white/0 to-black/10 mix-blend-multiply"></div>
                <div className="flex flex-col justify-center text-white text-[13px] font-bold leading-5 font-sans">
                  Request Demo
                </div>
              </div>
              <div className="h-10 px-12 py-[6px] relative border-2 border-purple-700 hover:bg-purple-50 overflow-hidden rounded-full flex justify-center items-center cursor-pointer transition-all duration-200">
                <div className="flex flex-col justify-center text-purple-700 text-[13px] font-bold leading-5 font-sans">
                  Contact Us
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
