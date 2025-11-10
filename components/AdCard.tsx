"use client"

import { ArrowUpRight, Github, Star } from "lucide-react"
import React from "react"

export const AdCard = () => {
  return (
    <div className="group relative w-full rounded-2xl border border-white/10 bg-[#0f0f10] p-4 overflow-hidden transition-all duration-500">
      {/* Internal Gradient Glow */}
      <div className="absolute -top-28 -right-20 h-[280px] w-[280px] rounded-full bg-gradient-to-tr from-[#4e46dc]/40 via-[#6a5eff]/30 to-transparent blur-3xl opacity-70 transition-all duration-700 group-hover:scale-110 group-hover:opacity-90"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#000000]">
              <Github className="h-5 w-5 text-white fill-white/90" />
            </div>
          </div>

          <a
            href="https://github.com/krishn404/gitOSS"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1.5 rounded-lg bg-[#2b2b2d] px-5 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-[#3b3b3d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_1px_4px_rgba(0,0,0,0.4)]"
          >
            <span className="relative z-10 text-white transition-opacity duration-300 group-hover:opacity-90">
              Star Us
            </span>
            <Star
              fill="yellow"
              size={16}
              className="relative z-10 transition-transform duration-300 text-yellow-500"
            />
          </a>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2 mt-1">
          <p className="text-[15px] font-semibold leading-snug text-white">
            Star us on GitHub
          </p>
          <p className="text-sm text-gray-300 leading-snug">
            Enjoy using GitOSS? Show your support by starring our GitHub repository. It helps
            others discover the project and keeps development active.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
          <span>OSS Finder</span>
          <span>Community Ad</span>
        </div>
      </div>
    </div>
  )
}
