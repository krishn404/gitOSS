"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import SmartSimpleBrilliant from "@/components/landing/smart-simple-brilliant"
import YourWorkInSync from "@/components/landing/your-work-in-sync"
import EffortlessIntegration from "@/components/landing/effortless-integration-updated"
import NumbersThatSpeak from "@/components/landing/numbers-that-speak"
import DocumentationSection from "@/components/landing/documentation-section"
import FAQSection from "@/components/landing/faq-section"
import CTASection from "@/components/landing/cta-section"
import FooterSection from "@/components/landing/footer-section"
import { HomeSection } from "@/components/opensource/home-section"
import Link from "next/link"

type Repo = {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  stargazers_count: number
  forks_count: number
  topics: string[]
  html_url: string
  owner: { login: string; avatar_url: string }
}

// Reusable Badge Component
function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-[14px] py-[6px] bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] border border-[rgba(2,6,23,0.08)] shadow-xs">
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center">{icon}</div>
      <div className="text-center flex justify-center flex-col text-[#37322F] text-xs font-medium leading-3 font-sans">
        {text}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [activeCard, setActiveCard] = useState(0)
  const [progress, setProgress] = useState(0)
  const mountedRef = useRef(true)
  const [repositories, setRepositories] = useState<Repo[]>([])
  const [loadingRepositories, setLoadingRepositories] = useState(true)

  useEffect(() => {
    const fetchRepositories = async () => {
      setLoadingRepositories(true)
      try {
        const params = new URLSearchParams()
        params.append("trending", "1")
        params.append("trendingPeriod", "day")
        params.append("sortBy", "stars")

        const response = await fetch(`/api/opensource?${params.toString()}`)
        const data = await response.json()
        setRepositories((data.repositories || []).slice(0, 10))
      } catch (error) {
        console.error("Error fetching repositories for landing hero:", error)
      } finally {
        setLoadingRepositories(false)
      }
    }

    fetchRepositories()
  }, [])

  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (!mountedRef.current) return

      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((current) => (current + 1) % 3)
          }
          return 0
        }
        return prev + 2 // 2% every 100ms = 5 seconds total
      })
    }, 100)

    return () => {
      clearInterval(progressInterval)
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleCardClick = (index: number) => {
    if (!mountedRef.current) return
    setActiveCard(index)
    setProgress(0)
  }

  const getDashboardContent = () => {
    switch (activeCard) {
      case 0:
        return <div className="text-[#828387] text-sm">Customer Subscription Status and Details</div>
      case 1:
        return <div className="text-[#828387] text-sm">Analytics Dashboard - Real-time Insights</div>
      case 2:
        return <div className="text-[#828387] text-sm">Data Visualization - Charts and Metrics</div>
      default:
        return <div className="text-[#828387] text-sm">Customer Subscription Status and Details</div>
    }
  }

  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center">
      <div className="relative flex flex-col justify-start items-center w-full">
        {/* Main container with proper margins */}
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
          {/* Left vertical line */}
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          {/* Right vertical line */}
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="self-stretch pt-[9px] overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            {/* Navigation */}
            <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
              <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

              <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-[#F7F5F3] backdrop-blur-sm shadow-[0px_0px_0px_2px_white] overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
                <div className="flex justify-center items-center">
                  <div className="flex justify-start items-center">
                    <div className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans">
                      GitOSS
                    </div>
                  </div>
                  
                </div>
                <div className="h-6 sm:h-7 md:h-8 flex justify-start items-start gap-2 sm:gap-3">
                <Link href="/opensource">
                    <div className="cursor-pointer px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] overflow-hidden rounded-full flex justify-center items-center">
                      <div className="text-[#37322F] text-xs md:text-[13px] font-medium leading-5 font-sans">
                        Log in
                      </div>
                    </div>
                  </Link>

                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[216px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
              <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  <div className="w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col text-[#37322F] text-[20px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0">
                    Explore.Filter. Review. Contribute.
                  </div>
                  <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
                    GitOSS helps you search, filter, and explore GitHub repositories
                    so you can find the right projects to learn from and contribute to.
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[497px] lg:w-[497px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
                <div className="backdrop-blur-[8.25px] flex justify-start items-center gap-4">
                <Link href="/opensource">
                <div className="cursor-pointer h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center">
                  <div className="w-20 sm:w-24 md:w-28 lg:w-44 h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                  <div className="text-white text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans">
                    Start for free
                  </div>
                </div>
              </Link>

                </div>
              </div>

              <div className="absolute top-[232px] sm:top-[248px] md:top-[264px] lg:top-[320px] left-1/2 transform -translate-x-1/2 z-0 pointer-events-none">
                <img
                  src="/mask-group-pattern.svg"
                  alt=""
                  className="w-[936px] sm:w-[1404px] md:w-[2106px] lg:w-[2808px] h-auto opacity-30 sm:opacity-40 md:opacity-50 mix-blend-multiply"
                  style={{
                    filter: "hue-rotate(15deg) saturate(0.7) brightness(1.2)",
                  }}
                />
              </div>

              <div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-16 mb-0 lg:pb-0">

              <div className="relative w-full max-w-[960px] lg:w-[960px] bg-white shadow-[0px_0px_0px_0.9px_rgba(0,0,0,0.08)] overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9px]">
                <HomeSection
                  repositories={repositories}
                  loading={loadingRepositories}
                  variant="landing"
                />
              </div>

                <div className="relative w-full max-w-[1000px] lg:w-[1000px] -mt-60 pointer-events-none">
                <div className="relative w-full h-80 flex items-center justify-center pointer-events-auto rounded-b-[12px] overflow-hidden">

                  <div
                    className="absolute inset-0 backdrop-blur-[8px]"
                    style={{
                      maskImage:
                        "linear-gradient(to bottom, transparent 0%, black 12%, black 100%), linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, black 12%, black 100%), linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
                      maskComposite: "intersect",
                      WebkitMaskComposite: "source-in"
                    }}
                  />

                  <div
                    className="absolute inset-0 backdrop-blur-[15px]"
                    style={{
                      maskImage:
                        "linear-gradient(to bottom, transparent 0%, black 10%, black 60%, transparent 100%), linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, black 10%, black 60%, transparent 100%), linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)",
                      maskComposite: "intersect",
                      WebkitMaskComposite: "source-in"
                    }}
                  />

                  <div
                    className="absolute inset-0 backdrop-blur-[25px]"
                    style={{
                      maskImage:
                        "linear-gradient(to top, black 0%, black 55%, transparent 100%), linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to top, black 0%, black 55%, transparent 100%), linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
                      maskComposite: "intersect",
                      WebkitMaskComposite: "source-in"
                    }}
                  />

                <Link href="/opensource">
                  <div className="cursor-pointer relative z-10 px-4 py-2 bg-black text-white rounded-md text-sm shadow-sm">
                    Sign in to unlock
                  </div>
                </Link>

                </div>
              </div>

            </div>
              <div className="self-stretch border-t border-[#E0DEDB] border-b border-[#E0DEDB] flex justify-center items-start">
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  {/* Left decorative pattern */}
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  {/* Right decorative pattern */}
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Bento Grid Section */}
              <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
                {/* Header Section */}
                <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
                  <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
                    <Badge
                      icon={
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                          <rect x="7" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                          <rect x="1" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                          <rect x="7" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                        </svg>
                      }
                      text="Why gitOSS"
                    />
                    <div className="w-full max-w-[598.06px] lg:w-[598.06px] text-center flex justify-center flex-col text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
                      Built for clarity when exploring open source
                    </div>
                    <div className="self-stretch text-center text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
                      Stay focused with tools that organize search, context,
                      <br />
                      and turn repository data into confident decisions.
                    </div>
                  </div>
                </div>

                {/* Bento Grid Content */}
                <div className="self-stretch flex justify-center items-start">
                {/* Left pattern */}
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col">
                    {Array.from({ length: 200 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 border-l border-r border-[rgba(55,50,47,0.12)]">

                  {/* Top Left – Minimal Repo Overview */}
                  <div className="border-b md:border-r border-[rgba(55,50,47,0.12)] p-6 lg:p-12 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[#37322F] text-xl font-semibold">Repository insights</h3>
                      <p className="text-[#605A57] text-base">
                        A distilled view of stars, activity, and structure so you capture signal fast.
                      </p>
                    </div>

                    <div className="w-full h-[240px] rounded-lg bg-[#F7F5F3] relative flex items-center justify-center">
                      {/* Minimal block visualization */}
                      <div className="grid grid-cols-4 gap-3 w-3/4">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="h-6 rounded bg-[rgba(3,7,18,0.10)]" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Right – Commit Line Flow */}
                  <div className="border-b border-[rgba(55,50,47,0.12)] p-6 lg:p-12 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[#37322F] text-xl font-semibold">Commit rhythm</h3>
                      <p className="text-[#605A57] text-base">
                        A minimal signature of commit frequency and flow across time.
                      </p>
                    </div>

                    <div className="w-full h-[240px] rounded-lg bg-[#F7F5F3] relative overflow-hidden flex items-center">
                      <svg viewBox="0 0 400 200" className="w-full h-full opacity-70">
                        <polyline
                          points="0,140 40,120 80,130 120,90 160,110 200,70 240,95 280,60 320,80 360,55 400,65"
                          fill="none"
                          stroke="rgba(3,7,18,0.35)"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Bottom Left – Minimal Dependency Indicators */}
                  <div className="md:border-r border-[rgba(55,50,47,0.12)] p-6 lg:p-12 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[#37322F] text-xl font-semibold">Dependency snapshot</h3>
                      <p className="text-[#605A57] text-base">
                        Clean representation of linked components and their roles.
                      </p>
                    </div>

                    <div className="w-full h-[240px] rounded-lg bg-[#F7F5F3] relative flex items-center justify-center">
                      <div className="flex items-center gap-6">
                        <div className="w-4 h-4 rounded-full bg-[#37322F]" />
                        <div className="w-20 h-[2px] bg-[rgba(3,7,18,0.15)]" />
                        <div className="w-3 h-3 rounded-full bg-[#605A57]" />
                        <div className="w-16 h-[2px] bg-[rgba(3,7,18,0.15)]" />
                        <div className="w-3 h-3 rounded-full bg-[#605A57]" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Right – Minimal Issue Activity */}
                  <div className="p-6 lg:p-12 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[#37322F] text-xl font-semibold">Issue activity</h3>
                      <p className="text-[#605A57] text-base">
                        Lightweight signal of responsiveness and maintenance health.
                      </p>
                    </div>

                    <div className="w-full h-[240px] rounded-lg bg-[#F7F5F3] relative flex items-center justify-center">
                      <div className="grid grid-cols-10 gap-2">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-sm"
                            style={{
                              backgroundColor:
                                i % 11 === 0
                                  ? "rgba(37,211,102,0.35)"
                                  : "rgba(3,7,18,0.10)"
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right pattern */}
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col">
                    {Array.from({ length: 200 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      />
                    ))}
                  </div>
                </div>
              </div>

              </div>

              {/* Documentation Section */}
              <DocumentationSection />

              {/* FAQ Section */}
              <FAQSection />

              {/* CTA Section */}
              <CTASection />

              {/* Footer Section */}
              <FooterSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// FeatureCard component definition inline to fix import error
function FeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
}: {
  title: string
  description: string
  isActive: boolean
  progress: number
  onClick: () => void
}) {
  return (
    <div
      className={`w-full md:flex-1 self-stretch px-6 py-5 overflow-hidden flex flex-col justify-start items-start gap-2 cursor-pointer relative border-b md:border-b-0 last:border-b-0 ${
        isActive
          ? "bg-white shadow-[0px_0px_0px_0.75px_#E0DEDB_inset]"
          : "border-l-0 border-r-0 md:border border-[#E0DEDB]/80"
      }`}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-[rgba(50,45,43,0.08)]">
          <div
            className="h-full bg-[#322D2B] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="self-stretch flex justify-center flex-col text-[#49423D] text-sm md:text-sm font-semibold leading-6 md:leading-6 font-sans">
        {title}
      </div>
      <div className="self-stretch text-[#605A57] text-[13px] md:text-[13px] font-normal leading-[22px] md:leading-[22px] font-sans">
        {description}
      </div>
    </div>
  )
}
