import React, { useState, useEffect } from 'react';
import { Play, Download, Loader2, CheckCircle2, ShieldAlert, FileVideo, Cpu } from 'lucide-react';
import { RenderState } from '../types';

interface RenderStatusCardProps {
  duration: number;
  renderState: RenderState;
  onStartRender: () => void;
  onDownload: () => void;
}

export const RenderStatusCard: React.FC<RenderStatusCardProps> = ({
  duration,
  renderState,
  onStartRender,
  onDownload
}) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Check WebCodecs (VideoEncoder) support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supportsWebCodecs = 'VideoEncoder' in window;
      setIsSupported(supportsWebCodecs);
    }
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-full shadow-2xl relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-4">
        {/* Header/Metrics Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center flex flex-col justify-center items-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1 font-bengali">হিসাবকৃত ভিডিও দৈর্ঘ্য</span>
            <div className="flex items-baseline gap-1">
              <span id="duration-display" className="text-3xl font-black text-emerald-400 font-mono">{duration}</span>
              <span className="text-emerald-400 font-bold text-xs font-bengali">সেকেন্ড</span>
            </div>
          </div>
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center flex flex-col justify-center items-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1 font-bengali">আউটপুট ফরম্যাট</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <FileVideo className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400 font-mono">MP4 (H.264)</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 font-mono">30 FPS • 1080P</span>
          </div>
        </div>

        {/* WebCodecs Support Alert */}
        {!isSupported && (
          <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-3.5 space-y-2">
            <div className="flex items-start gap-2 text-amber-400">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold font-bengali leading-snug">
                আপনার ব্রাউজারটি WebCodecs (VideoEncoder) সাপোর্ট করে না!
              </p>
            </div>
            <p className="text-[11px] text-slate-400 font-bengali leading-relaxed">
              সরাসরি MP4 ডাউনলোড করতে অনুগ্রহ করে <b>Google Chrome</b>, <b>Microsoft Edge</b> অথবা যেকোনো আধুনিক Chromium ব্রাউজার ব্যবহার করুন।
            </p>
          </div>
        )}

        {/* Render Progress Section */}
        {renderState.isRecording && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 shadow-inner">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-2 font-bengali">
                <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                {renderState.status}
              </span>
              <span className="text-emerald-400 font-mono font-bold">{renderState.progress}%</span>
            </div>
            
            {/* Elegant Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                style={{ width: `${renderState.progress}%` }}
                className="bg-gradient-to-r from-emerald-500 to-green-500 h-2.5 rounded-full transition-all duration-300 ease-out"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>Frame: {renderState.currentFrame} / {renderState.totalFrames}</span>
            </div>
          </div>
        )}

        {/* Success / Download Card */}
        {renderState.finalBlob && !renderState.isRecording && (
          <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/50 text-center space-y-3 shadow-inner animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 fill-current bg-slate-900 rounded-full" />
              <p className="text-xs font-bold font-bengali">🎉 ভিডিও রেন্ডার সম্পন্ন হয়েছে!</p>
            </div>
            
            <p className="text-xs text-slate-300 font-mono">
              আউটপুট সাইজ: <span className="text-emerald-400 font-bold">{(renderState.finalBlob.size / (1024 * 1024)).toFixed(2)} MB</span>
            </p>

            <button
              type="button"
              id="download-btn-active"
              onClick={onDownload}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-emerald-500/10 transition-all duration-150 flex items-center justify-center gap-2 font-bengali text-sm"
            >
              <Download className="w-4 h-4 stroke-[3px]" />
              গ্যালারিতে MP4 সেভ করুন
            </button>
          </div>
        )}
      </div>

      {/* Main Action Trigger Button */}
      <div className="pt-4 mt-4 border-t border-slate-800/60">
        <button
          type="button"
          id="trigger-render-btn"
          onClick={onStartRender}
          disabled={renderState.isRecording || !isSupported}
          className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 font-bengali ${
            renderState.isRecording
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              : !isSupported
                ? 'bg-slate-850 text-slate-600 cursor-not-allowed shadow-none border border-slate-800'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white hover:shadow-red-900/30'
          }`}
        >
          {renderState.isRecording ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              ভিডিও তৈরি হচ্ছে...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              অটো জেনারেট ও ডাউনলোড করুন (MP4)
            </>
          )}
        </button>
        <p className="text-[10px] text-slate-500 text-center mt-2.5 font-bengali">
          * এটি অফলাইনে সরাসরি ব্রাউজারে রেন্ডার করে। কোনো সার্ভার আপলোড প্রয়োজন হয় না।
        </p>
      </div>
    </div>
  );
};
