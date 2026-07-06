import React, { useState } from "react";
import { FileText, Upload, Trash2, Eye, BookOpen, Layers } from "lucide-react";

export default function ThesisReader() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setFileName(file.name);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const clearPdf = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setFileName(null);
  };

  return (
    <div className="space-y-6 flex flex-col h-[75vh]">
      {/* Header */}
      <div className="border-b border-[#D1CEC7] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A] font-serif flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-800" />
            Doctoral Dissertation Library
          </h2>
          <p className="text-xs text-[#8C887F] font-mono uppercase tracking-wider mt-1">
            Read your PhD thesis side-by-side with your manuscript drafting tools
          </p>
        </div>
        {fileName && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono bg-amber-500/10 text-amber-900 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 max-w-[250px] truncate" title={fileName}>
              <Eye className="w-3.5 h-3.5" />
              {fileName}
            </span>
            <button
              onClick={clearPdf}
              className="p-1.5 border border-[#D1CEC7] hover:border-red-500/20 text-[#8C887F] hover:text-red-600 rounded-lg transition-all cursor-pointer"
              title="Remove PDF"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main split workbench layout */}
      <div className="grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-0">
        {/* Left Side: Viewer (lg:7 or lg:8 if PDF uploaded, else lg:5) */}
        <div className={`flex flex-col border border-[#D1CEC7] rounded-2xl overflow-hidden bg-[#FAF9F6] ${
          pdfUrl ? "lg:col-span-8" : "lg:col-span-5"
        }`}>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Dissertation PDF Reader"
            />
          ) : (
            <div className="grow p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-amber-800/5 border border-amber-800/15 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-amber-800" />
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="text-base font-bold text-[#1A1A1A] font-serif">
                  Upload Dissertation PDF
                </h3>
                <p className="text-xs text-[#8C887F] leading-normal">
                  Drop your full doctoral thesis PDF here to read, scroll, and reference it side-by-side within the browser.
                </p>
              </div>
              <label className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer transition-all">
                Select PDF File
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Side: Chapter Summary index (lg:5 or lg:4 if PDF is open, else lg:7) */}
        <div className={`flex flex-col border border-[#D1CEC7] bg-[#FAF9F6] rounded-2xl overflow-hidden min-h-0 ${
          pdfUrl ? "lg:col-span-4" : "lg:col-span-7"
        }`}>
          <div className="bg-[#FAF9F6] border-b border-[#D1CEC7] px-4 py-3 flex items-center justify-between shrink-0">
            <span className="text-xs font-mono font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-700" />
              Thesis Abstract & Chapters Overview
            </span>
            <span className="text-[10px] text-[#8C887F] font-mono">TRIBHUVAN UNIVERSITY</span>
          </div>

          <div className="grow overflow-y-auto p-5 space-y-6 text-[#1A1A1A] font-sans">
            {/* Title / Info card */}
            <div className="space-y-2 border-b border-[#D1CEC7] pb-4">
              <span className="text-[9px] font-bold font-mono px-2.5 py-0.5 bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 rounded-md">
                PhD Dissertation Summary
              </span>
              <h3 className="text-base font-bold font-serif leading-snug">
                International Relations and Diplomatic History of Nepal: Ethical Accountabilities and Welfare Statecraft
              </h3>
              <p className="text-xs font-serif italic text-[#6B665E]">
                Dr. Govinda Kumar Shah, PhD (Tribhuvan University, Kathmandu, Nepal)
              </p>
            </div>

            {/* Chapters */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-[#1A1A1A] font-mono uppercase text-[10px] text-amber-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0"></span>
                  Chapter 1: Diplomatic Frameworks of South Asia
                </h4>
                <p className="text-[#6B665E] leading-relaxed pl-3 font-sans">
                  Establishes historical security dimensions and regional equilibrium constructs. Bridges ancient Nepalese diplomacy to regional sovereign integrity models.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#1A1A1A] font-mono uppercase text-[10px] text-amber-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0"></span>
                  Chapter 2: Ethics in Regional Welfare Policy
                </h4>
                <p className="text-[#6B665E] leading-relaxed pl-3 font-sans">
                  Compares classical state governance metrics with modern public accountability structures. Evaluates Kautilya’s Rajadharma and Yogakshema principles in domestic statecraft.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#1A1A1A] font-mono uppercase text-[10px] text-amber-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0"></span>
                  Chapter 3: Philosophical Roots of Dharmic Stewardship
                </h4>
                <p className="text-[#6B665E] leading-relaxed pl-3 font-sans font-medium">
                  Detailed analysis of Upanishadic trusteeship (Isavasya). Formulates the model showing that capital resources act as a social trust (Tyaktena Bhunjitha) designated for Lokasangraha (social preservation).
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#1A1A1A] font-mono uppercase text-[10px] text-amber-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0"></span>
                  Chapter 4: Comparative Public Trust Audits
                </h4>
                <p className="text-[#6B665E] leading-relaxed pl-3 font-sans">
                  Sifts regional corporate case studies in South Asia, comparing traditional family-trustee values with standard shareholder-maximizing outcomes.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#1A1A1A] font-mono uppercase text-[10px] text-amber-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0"></span>
                  Chapter 5: Synthesis and Policy Declarations
                </h4>
                <p className="text-[#6B665E] leading-relaxed pl-3 font-sans">
                  Outlines concrete ethical reforms for modern governance, arguing for indigenous, Dharmic-stewardship (Corporate Dharmic Responsibility - CDR) integration as a baseline.
                </p>
              </div>
            </div>

            {/* Quick references memo */}
            <div className="p-3 bg-white border border-[#D1CEC7] rounded-xl flex gap-2.5 items-start">
              <BookOpen className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#6B665E] leading-normal font-sans">
                <strong className="text-[#1A1A1A] block mb-0.5">Quick Reference Tag:</strong>
                Shah, G. K. (2018). <em>International Relations and Diplomatic History of Nepal</em> (Doctoral Dissertation). Tribhuvan University, Kathmandu, Nepal.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
