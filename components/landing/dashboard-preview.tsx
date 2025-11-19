import { Button } from "@/components/ui/button"
export function DashboardPreview() {
  return (
    <section className="relative pb-16">
      <div className="max-w-[1060px] mx-auto px-4">
        {/* Dashboard Interface Mockup */}
        <div className="relative bg-[#303030] rounded-lg shadow-lg border border-[rgba(255,255,255,0.1)] overflow-hidden">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3">
              <div className="text-[#d9d9d9] font-semibold">Brillance</div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-[#a0a0a0]">Account</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#404040] rounded-full"></div>
            </div>
          </div>

          {/* Sidebar and Main Content */}
          <div className="flex">
            {/* Sidebar */}
            <div className="w-48 bg-[#1a1a1a] border-r border-[rgba(255,255,255,0.1)] p-4">
              <nav className="space-y-2">
                <div className="text-xs font-medium text-[#a0a0a0] uppercase tracking-wide mb-3">Navigation</div>
                {["Home", "Customers", "Billing", "Schedules", "Invoices", "Products"].map((item) => (
                  <div key={item} className="text-sm text-[#d9d9d9] py-1 hover:text-[#d9d9d9]/80 cursor-pointer">
                    {item}
                  </div>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#d9d9d9]">Schedules</h2>
                <Button className="bg-[#d9d9d9] hover:bg-[#d9d9d9]/90 text-[#1a1a1a] text-sm">Create schedule</Button>
              </div>

              {/* Table Mockup */}
              <div className="bg-[#303030] border border-[rgba(255,255,255,0.1)] rounded-lg overflow-hidden">
                <div className="grid grid-cols-6 gap-4 p-4 bg-[#1a1a1a] border-b border-[rgba(255,255,255,0.1)] text-sm font-medium text-[#a0a0a0]">
                  <div>Customer</div>
                  <div>Status</div>
                  <div>Products</div>
                  <div>Total</div>
                  <div>Start date</div>
                  <div>End date</div>
                </div>

                {/* Table Rows */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b border-[rgba(255,255,255,0.1)] text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#404040] rounded-full"></div>
                      <span className="text-[#d9d9d9]">Hypernise</span>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${i % 3 === 0
                            ? "bg-green-900/20 text-green-400"
                            : i % 3 === 1
                              ? "bg-blue-900/20 text-blue-400"
                              : "bg-[#404040] text-[#a0a0a0]"
                          }`}
                      >
                        {i % 3 === 0 ? "Complete" : i % 3 === 1 ? "Active" : "Draft"}
                      </span>
                    </div>
                    <div className="text-[#a0a0a0]">Platform access fee</div>
                    <div className="font-medium text-[#d9d9d9]">$3,862.32</div>
                    <div className="text-[#a0a0a0]">1 Aug 2024</div>
                    <div className="text-[#a0a0a0]">10 Jun 2024</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
