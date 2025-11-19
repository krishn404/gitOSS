export function FeatureCards() {
  const features = [
    {
      title: "Plan your schedules",
      description: "Explore your data, build your dashboard,\nbring your team together.",
      highlighted: true,
    },
    {
      title: "Data to insights in the minutes",
      description: "Explore your data, build your dashboard,\nbring your team together.",
      highlighted: false,
    },
    {
      title: "Data to insights in the minutes",
      description: "Explore your data, build your dashboard,\nbring your team together.",
      highlighted: false,
    },
  ]

  return (
    <section className="border-t border-[rgba(255,255,255,0.1)] border-b border-[rgba(255,255,255,0.1)]">
      <div className="max-w-[1060px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-6 flex flex-col gap-2 ${
                // Updated feature card borders to 1px
                feature.highlighted ? "bg-[#303030] border border-[rgba(255,255,255,0.1)] shadow-sm" : "border border-[rgba(255,255,255,0.1)]"
                }`}
            >
              {feature.highlighted && (
                <div className="space-y-1 mb-2">
                  <div className="w-full h-0.5 bg-[rgba(255,255,255,0.1)]"></div>
                  <div className="w-32 h-0.5 bg-[#a0a0a0]"></div>
                </div>
              )}
              <h3 className="text-[#d9d9d9] text-sm font-semibold leading-6">{feature.title}</h3>
              <p className="text-[#a0a0a0] text-sm leading-[22px] whitespace-pre-line">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
