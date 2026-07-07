"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Globe, ArrowUp, Paperclip, Zap, ArrowLeft, X,
  ShieldCheck, User, Activity, ClipboardCheck, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useAudit } from "@/hooks/useAudit";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import gsap from "gsap";

export default function AnvestraDashboard() {
  const [mode, setMode] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    inputValue, imagePreview, goal, story, aim,
    isAnalyzing, error, results,
    handleInputChange, handleImageUpload, clearImage, startAudit, resetResults,
  } = useAudit();

  const downloadPDF = async () => {
    const element = document.getElementById("audit-report");
    if (!element) return;
    const normalizeColors = (el: HTMLElement) => {
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
      let node: Node | null = walk.currentNode;
      while (node) {
        if (node instanceof HTMLElement) {
          const style = window.getComputedStyle(node);
          if (style.color.includes("lab") || style.color.includes("oklch")) node.style.color = "inherit";
          if (style.backgroundColor.includes("lab") || style.backgroundColor.includes("oklch")) node.style.backgroundColor = "transparent";
        }
        node = walk.nextNode();
      }
    };
    try {
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      document.body.appendChild(clone);
      normalizeColors(clone);
      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#fae8e2", logging: false });
      document.body.removeChild(clone);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, (imgProps.height * pdfWidth) / imgProps.width);
      pdf.save(`Anvestra_Intelligence_Artifact_${results?.overall_score}.pdf`);
    } catch (err) { console.error("PDF Error:", err); }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".dash-reveal", { opacity: 0, y: 20, stagger: 0.1, duration: 1, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return { bg: "bg-emerald-500", text: "text-emerald-500", stroke: "#10b981", light: "bg-emerald-50" };
    if (score >= 70) return { bg: "bg-sky-500", text: "text-sky-500", stroke: "#0ea5e9", light: "bg-sky-50" };
    if (score >= 50) return { bg: "bg-amber-500", text: "text-amber-500", stroke: "#f59e0b", light: "bg-amber-50" };
    return { bg: "bg-rose-500", text: "text-rose-500", stroke: "#f43f5e", light: "bg-rose-50" };
  };

  return (
    <div ref={containerRef} className="premium-bg min-h-screen text-slate-950 flex flex-col items-center p-6 sm:p-12 overflow-x-hidden selection:bg-slate-950 selection:text-white font-sans">

      <Link href="/">
        <div className="fixed top-10 left-10 flex items-center gap-3 text-slate-500 hover:text-slate-950 transition-all z-50 text-[10px] font-black tracking-[0.4em] uppercase group cursor-pointer">
          <div className="p-2 border border-white/40 rounded-full group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm bg-white/20 backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Exit to Lab
        </div>
      </Link>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center pt-20 pb-20">

        {/* Hero */}
        <div className="text-center mb-16 relative z-10 scale-90 sm:scale-100">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 text-white text-[10px] font-black tracking-[0.4em] uppercase mb-8 shadow-2xl">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
            Neural Engine Active
          </div>
          <h1 className="font-instrument text-7xl sm:text-8xl text-slate-950 tracking-tighter leading-none mb-6">Anvestra</h1>
          <div className="font-sans text-xl text-slate-950 max-w-lg mx-auto font-medium leading-relaxed tracking-tight">
            Auditing the future of <span className="underline decoration-slate-300 underline-offset-8">user experience</span>.
          </div>
        </div>

        {/* Glass Controller Panel */}
        <div className="w-full max-w-3xl glass-panel rounded-[3.5rem] p-8 sm:p-14 flex flex-col gap-10 relative z-10">

          {/* Switcher */}
          <div className="flex gap-2 p-1.5 bg-white/20 rounded-2xl w-fit mx-auto border border-white/30 backdrop-blur-md">
  {(["url", "upload"] as const).map((m) => (
    <button key={m} onClick={() => {
      setMode(m);
      // Clear inputs on mode switch
      handleInputChange("inputValue", "");
      handleInputChange("goal", "");
      handleInputChange("story", "");
      handleInputChange("aim", "");
    }}
      className={`px-10 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${mode === m ? "bg-slate-950 text-white shadow-xl scale-105" : "text-slate-500 hover:text-slate-700"}`}>
      {m === "url" ? "URL Protocol" : "Visual Spectrum"}
    </button>
  ))}
</div>

          <div className="min-h-[140px] flex flex-col justify-center">
            {mode === "url" ? (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                </div>
                <input type="text" value={inputValue}
                  onChange={(e) => handleInputChange("inputValue", e.target.value)}
                  placeholder="Enter target URL..."
                  className="block w-full pl-16 pr-8 py-7 bg-white/25 border-2 border-white/30 rounded-3xl outline-none text-slate-950 font-sans text-xl placeholder:text-slate-400 font-bold transition-all focus:border-slate-950 focus:bg-white/40 shadow-sm backdrop-blur-sm"
                  onKeyDown={(e) => e.key === "Enter" && !isAnalyzing && startAudit()}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-center">
                {!imagePreview ? (
                  <div onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/40 bg-white/15 rounded-[2.5rem] p-16 cursor-pointer hover:bg-white/25 hover:border-slate-950 transition-all group backdrop-blur-sm">
                    <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                      <Paperclip className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500">Inject Visual Data</p>
                  </div>
                ) : (
                  <div className="relative group rounded-[3rem] overflow-hidden border-2 border-white/30 bg-white/20 shadow-2xl">
                    <img src={imagePreview} alt="Preview" className="w-full h-80 object-cover" />
                    <button onClick={() => { clearImage(); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute top-6 right-6 w-12 h-12 bg-slate-950 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>

          {/* Context Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/20">
            {[
              { label: "Site Goal", key: "goal", value: goal, placeholder: "Market research..." },
              { label: "User Story", key: "story", value: story, placeholder: "First time buyer..." },
              { label: "Target Aim", key: "aim", value: aim, placeholder: "Tech savvy youth..." },
            ].map((f) => (
              <div key={f.key} className="flex flex-col gap-2">
                <label className="text-[9px] font-black tracking-widest uppercase text-black ml-2">{f.label}</label>
                <input type="text" value={f.value}
                  onChange={(e) => handleInputChange(f.key as any, e.target.value)}
                  placeholder={f.placeholder}
                  className="p-4 bg-white/20 border border-white/30 rounded-2xl outline-none text-slate-950 font-medium placeholder:text-slate-400 text-sm focus:border-slate-950 focus:bg-white/35 transition-all backdrop-blur-sm"
                />
              </div>
            ))}
          </div>

          <button onClick={() => startAudit()}
            disabled={isAnalyzing || (mode === "url" && !inputValue) || (mode === "upload" && !imagePreview)}
            className="w-full bg-slate-950 hover:bg-black disabled:bg-slate-950/10 disabled:text-slate-400 text-white font-black tracking-[0.4em] uppercase text-xs py-9 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-5 group relative overflow-hidden">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center gap-4 z-20">
                <div className="relative">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  <div className="absolute -inset-4 border border-white/10 rounded-full animate-ping opacity-20" />
                </div>
                <span className="text-[10px] tracking-[0.4em] animate-pulse">Initializing Neural Extraction...</span>
              </div>
            )}
            {!isAnalyzing ? (<>Synthesize Audit Results <ArrowUp className="w-6 h-6 group-hover:-translate-y-3 transition-transform duration-500" /></>) : <span className="opacity-0">Computing...</span>}
          </button>
        </div>

        {error && (
          <div className="w-full max-w-3xl mt-6 p-8 rounded-[2.5rem] bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 text-rose-600 font-bold dash-reveal text-center shadow-xl animate-bounce">
            <span className="mr-3 opacity-50">⚠</span> {error}
          </div>
        )}

        {results && (
          <div className="w-full max-w-6xl mt-24 flex flex-col gap-10 pb-40 relative z-10 dash-reveal">

            {/* Report — glass */}
            <div id="audit-report" className="bg-white/15 backdrop-blur-3xl border border-white/30 shadow-[0_80px_160px_-40px_rgba(180,80,60,0.12)] rounded-[4rem] overflow-hidden p-12 sm:p-24 flex flex-col gap-20 relative">

              <div className="absolute top-0 inset-x-0 h-1.5 flex">
                {["bg-emerald-500","bg-sky-500","bg-amber-500","bg-rose-500"].map((c) => (
                  <div key={c} className={`h-full ${c} flex-1 opacity-40`} />
                ))}
              </div>

              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10 pt-4">
                <div className="flex flex-col gap-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
                      <Sparkles className="w-6 h-6 text-white group-hover:scale-125 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-500">Analysis Artifact v4.5</span>
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400/60">Neural Latency: 42ms</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-7xl font-instrument text-slate-950 font-bold tracking-tighter leading-none">Intelligence Artifact</h2>
                  <p className="text-slate-700 text-xl max-w-2xl leading-relaxed italic border-l-4 border-slate-950/10 pl-10 ml-2">"{results.executive_summary}"</p>
                </div>

                {/* Score ring — glass */}
                <div className="flex flex-col items-center gap-6 bg-white/20 backdrop-blur-xl border border-white/30 p-12 rounded-[3.5rem] relative group overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                  <div className={`absolute inset-0 ${getScoreColor(results.overall_score).light} opacity-0 group-hover:opacity-20 transition-opacity`} />
                  <div className="w-48 h-48 relative flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="86" stroke="rgba(255,255,255,0.3)" strokeWidth="16" fill="transparent" />
                      <circle cx="96" cy="96" r="86" stroke={getScoreColor(results.overall_score).stroke} strokeWidth="16" fill="transparent"
                        strokeDasharray={540} strokeDashoffset={540 - (540 * results.overall_score) / 100}
                        strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <span className={`absolute text-6xl font-instrument font-black ${getScoreColor(results.overall_score).text}`}>{results.overall_score}</span>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">System Integrity</span>
                </div>
              </div>

              {/* Neural Grid — glass cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                {[
                  { title: "Usability", data: results.usability_layer, icon: <User className="w-6 h-6" /> },
                  { title: "Performance", data: results.performance_layer, icon: <Zap className="w-6 h-6" /> },
                  { title: "Behavioral", data: results.behavior_layer, icon: <Activity className="w-6 h-6" /> },
                  { title: "Functional", data: results.functional_layer, icon: <ShieldCheck className="w-6 h-6" /> },
                ].map((layer, i) => {
                  if (!layer.data || typeof layer.data.score === "undefined") return null;
                  const colors = getScoreColor(layer.data.score);
                  return (
                    <div key={i} className="bg-white/20 backdrop-blur-xl border border-white/30 p-12 rounded-[3.5rem] flex flex-col gap-8 hover:shadow-[0_40px_80px_-20px_rgba(180,80,60,0.1)] transition-all group/card relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.light} rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover/card:opacity-60 transition-opacity animate-pulse`} />
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-5">
                          <div className={`p-4 ${colors.light} rounded-2xl ${colors.text} shadow-sm`}>{layer.icon}</div>
                          <span className="text-[12px] font-black uppercase tracking-[0.4em] font-sans text-slate-500">{layer.title}</span>
                        </div>
                        <span className={`text-4xl font-instrument font-bold ${colors.text}`}>{layer.data.score}%</span>
                      </div>
                      <div className="w-full bg-white/30 h-3 rounded-full overflow-hidden relative shadow-inner">
                        <div className={`${colors.bg} h-full rounded-full transition-all duration-[1.5s] ease-out`} style={{ width: `${layer.data.score}%` }} />
                      </div>
                      <ul className="flex flex-col gap-4">
                        {(layer.data.insights ?? []).slice(0, 3).map((ins: string, ii: number) => (
                          <li key={ii} className="text-sm text-slate-600 leading-relaxed pl-6 border-l-2 border-white/40 flex gap-5 group/ins">
                            <span className={`${colors.text} opacity-40 group-hover/ins:opacity-100 transition-opacity`}>•</span>
                            <span className="group-hover/ins:text-slate-950 transition-colors">{ins}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Findings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10 pt-16 border-t border-white/20">
                <div className="flex flex-col gap-10">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                    <h3 className="text-[12px] font-black tracking-[0.6em] uppercase text-emerald-600">Structural Strengths</h3>
                  </div>
                  <div className="grid gap-6">
                    {(results.strengths ?? []).map((s: string, i: number) => (
                      <div key={i} className="p-7 bg-emerald-50/20 border border-emerald-100/30 rounded-[2rem] text-md text-slate-800 flex gap-6 items-center group/str transition-all hover:bg-emerald-50/40">
                        <div className="p-3 bg-white/30 backdrop-blur-sm rounded-xl shadow-sm text-emerald-500 group-hover/str:scale-110 transition-transform">
                          <ClipboardCheck className="w-6 h-6" />
                        </div>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-10">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-rose-500 rounded-full" />
                    <h3 className="text-[12px] font-black tracking-[0.6em] uppercase text-rose-600">Critical Risks</h3>
                  </div>
                  <div className="grid gap-6">
                    {(results.critical_issues ?? []).map((c: string, i: number) => (
                      <div key={i} className="p-7 bg-rose-50/20 border border-rose-100/30 rounded-[2rem] text-md text-slate-800 flex gap-6 items-center group/risk transition-all hover:bg-rose-50/40">
                        <div className="p-3 bg-white/30 backdrop-blur-sm rounded-xl shadow-sm text-rose-500 group-hover/risk:scale-110 transition-transform">
                          <X className="w-6 h-6" />
                        </div>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Roadmap */}
              <div className="flex flex-col gap-14 relative z-10 pt-16 border-t border-white/20">
                <h3 className="text-[12px] font-black tracking-[0.6em] uppercase text-slate-400">Execution Roadmap</h3>
                <div className="grid grid-cols-1 gap-8">
                  {(results.improvements ?? []).map((imp: { title: string; fix: string; priority: string }, i: number) => (
                    <div key={i} className="group/item relative bg-slate-950 p-10 rounded-[3rem] hover:bg-black transition-all text-white overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                      <div className="flex flex-col sm:flex-row justify-between gap-8 relative z-10">
                        <div className="flex flex-col gap-5">
                          <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-white/30 tracking-[0.5em]">PROTO_{i + 1}</span>
                            <h4 className="text-3xl font-instrument font-bold text-white tracking-tight">{imp.title}</h4>
                          </div>
                          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">{imp.fix}</p>
                        </div>
                        <div className={`px-8 py-3 h-fit rounded-full text-[11px] font-black tracking-widest uppercase shadow-lg ${imp.priority === "High" ? "bg-rose-500 text-white" : imp.priority === "Medium" ? "bg-amber-500 text-slate-950" : "bg-emerald-500 text-slate-950"}`}>
                          {imp.priority} Priority
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Re-initialize — glass */}
            <div className="flex flex-col sm:flex-row gap-8 relative z-10 px-10">
              <button
                onClick={() => { resetResults(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-slate-950 font-black tracking-[0.5em] uppercase text-[10px] py-12 rounded-[3rem] border border-white/30 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-6 group">
                <div className="p-3 bg-white/30 rounded-xl group-hover:rotate-180 transition-transform duration-700">
                  <Activity className="w-6 h-6" />
                </div>
                Re-Initialize Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Dash Stats */}
        <div className="mt-24 flex flex-wrap justify-center items-center gap-16 dash-reveal opacity-30 hover:opacity-100 transition-all duration-700">
          {[{ label: "Quantum Vision", value: "α-0.98" }, { label: "Semantic Entropy", value: "σ-1.2" }, { label: "Neural Resolution", value: "8K" }].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center group cursor-default">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500 group-hover:text-slate-950 transition-colors">{stat.label}</span>
              <span className="text-[9px] font-medium text-slate-400 mt-1">{stat.value}</span>
              <div className="w-10 h-[1px] bg-slate-950/10 mt-3 group-hover:w-20 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}