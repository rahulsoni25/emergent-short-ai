"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Cpu, ShieldCheck } from 'lucide-react';

export function LandingHero() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 md:pr-10"
    >
      <motion.div variants={item}>
        <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
          2026 AI Generation Engine
        </span>
        <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight leading-[1.1]">
          <span className="block text-white">AI YouTube</span>
          <span className="text-gradient">Shorts Generator</span>
        </h1>
      </motion.div>

      <motion.p variants={item} className="text-xl text-slate-400 max-w-xl leading-relaxed">
        Create faceless viral videos with AI in seconds. The ultimate AI video generator tailored for creators, agencies, and performance marketers.
      </motion.p>
      
      <motion.div variants={item} className="grid sm:grid-cols-2 gap-4 mt-2">
        <BenefitItem icon={<Zap className="w-5 h-5 text-blue-400" />} title="Zero Cost" desc="Runs entirely on CPU" />
        <BenefitItem icon={<Cpu className="w-5 h-5 text-purple-400" />} title="Built for Virality" desc="Automated hooks & pacing" />
        <BenefitItem icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} title="Private & Secure" desc="No script storage" />
        <BenefitItem icon={<CheckCircle2 className="w-5 h-5 text-pink-400" />} title="AEO Optimized" desc="Answer-engine ready" />
      </motion.div>

      <motion.div variants={item} className="space-y-8 mt-4 border-l border-slate-800 pl-6 py-2">
        <section>
          <h2 className="text-2xl font-heading font-bold text-white mb-3">What is an AI YouTube Shorts generator?</h2>
          <p className="text-slate-400">
            An AI YouTube Shorts generator is a web-based tool that uses large language models and image synthesis to automatically create vertical videos. It converts your text prompt into a script, generates relevant imagery, and synthesizes an engaging voiceover without requiring manual editing.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-heading font-bold text-white mb-2">How do I create faceless viral videos with AI?</h3>
          <p className="text-slate-400">
            To create faceless viral videos with AI, simply enter your niche and topic into our generator. Our engine writes a compelling hook, generates matching Pollinations images, creates a Piper TTS voiceover, and uses FFmpeg to compile everything into a ready-to-post 1080x1920 MP4 file.
          </p>
        </section>
      </motion.div>

      <motion.div variants={item} className="flex gap-6 pt-4 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          CPU rendering active
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Pollinations API connected
        </div>
      </motion.div>
    </motion.div>
  );
}

function BenefitItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="mt-1 p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-200 text-sm">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
