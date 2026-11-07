import React, { useState } from 'react';
import { SURVIVAL_DOCUMENTS, TravelDocumentItem } from '../data/survivalDocuments';
import { sounds, speakEnglish } from '../utils/audio';
import { X, Volume2, ShieldCheck, FileText, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface SurvivalDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDocId?: string;
}

export const SurvivalDocumentsModal: React.FC<SurvivalDocumentsModalProps> = ({
  isOpen,
  onClose,
  activeDocId,
}) => {
  const [selectedId, setSelectedId] = useState<string>(activeDocId || SURVIVAL_DOCUMENTS[0].id);

  if (!isOpen) return null;

  const currentDoc: TravelDocumentItem =
    SURVIVAL_DOCUMENTS.find((d) => d.id === selectedId) || SURVIVAL_DOCUMENTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-xl shadow-inner">
              🎒
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-100 flex items-center gap-2">
                Hayatta Kalma Çantam & Resmi Seyahat Belgelerim
              </h2>
              <p className="text-xs text-indigo-300">
                Gümrük memurunun istediği tüm yasal İngiltere seyahat kanıtları
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 overflow-x-auto bg-slate-950/60 p-2 gap-1.5 scrollbar-thin">
          {SURVIVAL_DOCUMENTS.map((doc) => {
            const isSel = doc.id === currentDoc.id;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  sounds.playPaperRustle();
                  setSelectedId(doc.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{doc.icon}</span>
                <span>{doc.titleTr}</span>
              </button>
            );
          })}
        </div>

        {/* Document Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Document Paper Container */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-5">
            
            {/* Title & Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  OFFICIAL UK IMMIGRATION COMPLIANCE EVIDENCE
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>{currentDoc.icon}</span>
                  <span>{currentDoc.title}</span>
                </h3>
                <p className="text-xs text-indigo-300 font-medium">{currentDoc.titleTr}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentDoc.badge}
                </span>
              </div>
            </div>

            {/* Purpose / Why you need this */}
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-300">Bu belge nerede sorulur?</span>
                <p className="mt-0.5 text-slate-300 leading-relaxed">{currentDoc.purpose}</p>
              </div>
            </div>

            {/* Document Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentDoc.fields.map((f, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    {f.label} {f.hintTr && <span className="text-slate-400">({f.hintTr})</span>}
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-100 break-words">
                    {f.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Officer Cultural Warning & Tip */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">🇬🇧 Sınır Polisi Taktik Uyarısı:</span>
                <p className="mt-0.5 text-slate-300 leading-relaxed">{currentDoc.officerTip}</p>
              </div>
            </div>

            {/* Key English Terms in This Document */}
            <div className="space-y-2 pt-2">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                📄 Bu Belgede Geçen Kritik İngilizce Kelimeler & Kalıplar:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentDoc.keyTerms.map((term, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-indigo-200">{term.en}</span>
                        <span className="text-[10px] text-amber-300 font-mono">{term.phoneticTr}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{term.tr}</p>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        speakEnglish(term.en);
                      }}
                      className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-600 text-indigo-300 hover:text-white transition flex items-center justify-center ml-2"
                      title="Telaffuzu Dinle"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>💡 Belgelerinizi memura gösterirken &ldquo;Here is my confirmation, Officer.&rdquo; diyebilirsiniz.</span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition text-xs"
          >
            Tamamdır
          </button>
        </div>

      </div>
    </div>
  );
};
