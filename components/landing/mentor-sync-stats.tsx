"use client"

export default function MentorSyncStats() {
  const stats = [
    {
      number: "4.9/5",
      label: "Average Rating",
      description: "From verified learners"
    },
    {
      number: "500+",
      label: "Verified Experts",
      description: "Across all industries"
    },
    {
      number: "10k+",
      label: "Hours Taught",
      description: "Global mentorship delivered"
    },
    {
      number: "0",
      label: "Scheduling Conflicts",
      description: "AI-powered timezone magic"
    }
  ]

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-purple-50/30">
      <div className="max-w-[1060px] mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Section Header */}
          <div className="flex flex-col items-center gap-3 max-w-[600px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-sm font-semibold text-purple-700">By The Numbers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 leading-tight">
              Results That Speak for Themselves
            </h2>
            <p className="text-lg text-gray-600 text-center">
              MentorSync is transforming how people learn from the world's best experts.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
              >
                {/* Stat Number */}
                <div className="text-5xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                
                {/* Stat Label */}
                <div className="text-lg font-bold text-gray-900 text-center">
                  {stat.label}
                </div>
                
                {/* Stat Description */}
                <div className="text-sm text-gray-600 text-center">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
