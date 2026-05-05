"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, Download, CheckCircle2, Loader2, Image as ImageIcon, MessageSquare, AlertCircle } from 'lucide-react';

export function GeneratorPanel() {
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('Technology');
  const [length, setLength] = useState('30s');
  const [voice, setVoice] = useState('af_nova');
  const [status, setStatus] = useState<'idle' | 'generating' | 'preview' | 'rendering' | 'complete' | 'error'>('idle');
  const [scriptData, setScriptData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const randomTopics = [
    "Future of Mars Colonization",
    "How AI will change coding in 2026",
    "The secret to building a million dollar brand",
    "Why 99% of people fail at fitness",
    "The hidden physics of black holes"
  ];

  const handleRandomTopic = () => {
    const random = randomTopics[Math.floor(Math.random() * randomTopics.length)];
    setTopic(random);
  };

  const handleGenerate = async () => {
    if (!topic) {
      setErrorMessage("Please enter a topic first!");
      setStatus('error');
      return;
    }
    setStatus('generating');
    setErrorMessage('');
    setProgress(20);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, niche, length, voice })
      });
      if (!res.ok) throw new Error('Failed to generate script');
      const data = await res.json();
      setProgress(100);
      setTimeout(() => {
        setScriptData(data);
        setStatus('preview');
      }, 500);
    } catch (e: any) {
      setErrorMessage(e.message);
      setStatus('error');
    }
  };

  const handleRender = async () => {
    setStatus('rendering');
    setErrorMessage('');
    setProgress(10);
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrls: scriptData.imageUrls,
          audioBase64: scriptData.audioBase64,
          script: scriptData.script
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Rendering failed');
      }

      const data = await res.json();
      setVideoUrl(data.videoUrl);
      setStatus('complete');
    } catch (e: any) {
      setErrorMessage(e.message);
      setStatus('error');
    }
  };

  return (
    <div className="glass rounded-3xl p-1 glow-blue animate-float">
      <div className="bg-slate-950/80 rounded-[1.4rem] p-8 flex flex-col h-full border border-slate-800/50">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-heading font-bold text-white tracking-tight">Generator Lab</h3>
        </div>
        
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 flex-grow"
            >
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2 px-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Topic</label>
                    <button 
                      onClick={handleRandomTopic}
                      className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Suggest
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                    placeholder="e.g. Life on Mars by 2050..."
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Niche</label>
                    <input 
                      type="text" 
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Length</label>
                    <select 
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none text-sm"
                    >
                      <option value="15s">15s</option>
                      <option value="30s">30s</option>
                      <option value="60s">60s</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Voice</label>
                    <select 
                      value={voice}
                      onChange={(e) => setVoice(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none text-sm"
                    >
                      <option value="af_nova">Nova</option>
                      <option value="af_sky">Sky</option>
                      <option value="bf_isabella">Isabella</option>
                      <option value="am_adam">Adam</option>
                      <option value="bm_marcus">Marcus</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-5 px-6 rounded-2xl shadow-xl shadow-blue-900/20 transform transition active:scale-95 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Generate Script & Preview
                </span>
              </button>
            </motion.div>
          )}

          {(status === 'generating' || status === 'rendering') && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-heading font-bold text-white capitalize">{status}...</h4>
                <p className="text-sm text-slate-500 mt-1">Processing in Emergent Environment</p>
              </div>
            </motion.div>
          )}

          {status === 'preview' && scriptData && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest px-1">
                  <MessageSquare className="w-4 h-4" />
                  Script Draft
                </div>
                <div className="space-y-3 text-sm text-slate-300 leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  <p><span className="text-slate-500 font-bold">HOOK:</span> {scriptData.script?.hook}</p>
                  <p><span className="text-slate-500 font-bold">BODY:</span> {scriptData.script?.body}</p>
                  <p><span className="text-slate-500 font-bold">CTA:</span> {scriptData.script?.cta}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-widest px-1">
                  <ImageIcon className="w-4 h-4" />
                  Visual Assets
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                  {scriptData.imageUrls?.map((url: string, i: number) => (
                    <div key={i} className="relative group flex-shrink-0">
                      <img src={url} alt={`Scene ${i+1}`} className="w-24 h-40 object-cover rounded-xl border border-slate-800" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStatus('idle')}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-4 px-6 rounded-2xl border border-slate-800 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={handleRender}
                  className="flex-[2] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Render MP4
                </button>
              </div>
            </motion.div>
          )}

          {status === 'complete' && videoUrl && (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center space-y-8"
            >
              <div className="w-full aspect-[9/16] max-h-80 bg-slate-900 rounded-3xl border-2 border-slate-800 relative overflow-hidden shadow-2xl">
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="w-full flex gap-4">
                <button 
                   onClick={() => setStatus('idle')}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-4 px-6 rounded-2xl border border-slate-800 transition-colors"
                >
                  New Short
                </button>
                <a 
                  href={videoUrl} 
                  download 
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95 text-center"
                >
                  <Download className="w-5 h-5" />
                  Download
                </a>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold text-white">Generation Failed</h4>
                <p className="text-sm text-slate-500 mt-2">{errorMessage}</p>
              </div>
              <button 
                onClick={() => setStatus('idle')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-2xl border border-slate-800"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
