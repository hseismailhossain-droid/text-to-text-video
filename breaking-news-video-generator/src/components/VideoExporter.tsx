import React, { useState, useRef, useEffect } from 'react';
import { Play, Video, Download, HelpCircle, AlertCircle, History, Trash2, CheckCircle2 } from 'lucide-react';
import { BackgroundType, VideoResolution, RESOLUTIONS, SavedVideo } from '../types';

interface VideoExporterProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  backgroundType: BackgroundType;
  resolution: VideoResolution;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  onStartRecordingTrigger: (durationMs: number, callback: (blobUrl: string, blob: Blob) => void) => void;
}

export default function VideoExporter({
  canvasRef,
  backgroundType,
  resolution,
  isRecording,
  setIsRecording,
  onStartRecordingTrigger,
}: VideoExporterProps) {
  const [duration, setDuration] = useState<number>(10); // in seconds
  const [fps, setFps] = useState<number>(30);
  const [progress, setProgress] = useState<number>(0);
  const [exportedVideos, setExportedVideos] = useState<SavedVideo[]>([]);
  const [activeTab, setActiveTab] = useState<'export' | 'guide' | 'history'>('export');
  const [latestBlobUrl, setLatestBlobUrl] = useState<string | null>(null);

  // Load exported videos from localStorage (only meta details, URLs are session-based blobs, we can store metadata or we can keep active session blobs)
  useEffect(() => {
    const saved = localStorage.getItem('breaking_news_export_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Omit<SavedVideo, 'url'>[];
        // Filter out old session records if needed or keep them as reference
        setExportedVideos(parsed.map(p => ({ ...p, url: '' }))); // Blob URLs are gone on refresh, but metadata remains
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleStartExport = () => {
    if (isRecording || !canvasRef.current) return;
    
    setIsRecording(true);
    setProgress(0);
    setLatestBlobUrl(null);

    const totalDurationMs = duration * 1000;
    const updateInterval = 100; // update progress bar every 100ms
    let elapsed = 0;

    const progressTimer = setInterval(() => {
      elapsed += updateInterval;
      const pct = Math.min((elapsed / totalDurationMs) * 100, 100);
      setProgress(Math.round(pct));
      if (elapsed >= totalDurationMs) {
        clearInterval(progressTimer);
      }
    }, updateInterval);

    // Call parent trigger to run canvas rendering loop & capture stream
    onStartRecordingTrigger(totalDurationMs, (blobUrl, blob) => {
      clearInterval(progressTimer);
      setProgress(100);
      setIsRecording(false);
      setLatestBlobUrl(blobUrl);

      // Add to session history
      const newVideo: SavedVideo = {
        id: 'vid_' + Date.now(),
        name: `Breaking_News_${resolution}_${backgroundType}_${duration}s.webm`,
        createdAt: Date.now(),
        url: blobUrl,
        duration: duration,
        size: Math.round((blob.size / (1024 * 1024)) * 100) / 100, // MB
      };

      const updated = [newVideo, ...exportedVideos];
      setExportedVideos(updated);
      
      // Store metadata in localStorage
      const metaOnly = updated.map(({ id, name, createdAt, duration, size }) => ({
        id,
        name,
        createdAt,
        duration,
        size,
      }));
      localStorage.setItem('breaking_news_export_history', JSON.stringify(metaOnly));
    });
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = exportedVideos.filter(v => v.id !== id);
    setExportedVideos(updated);
    
    const metaOnly = updated.map(({ id, name, createdAt, duration, size }) => ({
      id,
      name,
      createdAt,
      duration,
      size,
    }));
    localStorage.setItem('breaking_news_export_history', JSON.stringify(metaOnly));
  };

  return (
    <div id="video-exporter-panel" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800 mb-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('export')}
          className={`pb-2.5 px-3 border-b-2 transition -mb-[2px] flex items-center gap-1.5 ${
            activeTab === 'export'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          ভিডিও এক্সপোর্ট (Export)
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`pb-2.5 px-3 border-b-2 transition -mb-[2px] flex items-center gap-1.5 ${
            activeTab === 'guide'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          কিভাবে ব্যবহার করবেন? (Guide)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 px-3 border-b-2 transition -mb-[2px] flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          ইতিহাস ({exportedVideos.filter(v => v.url).length})
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="flex-1 flex flex-col justify-between">
        {activeTab === 'export' && (
          <div className="space-y-4">
            {/* Export Configurations */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 font-medium">রেকর্ডিং সময়কাল (Duration)</label>
                <select
                  value={duration}
                  disabled={isRecording}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value={5}>৫ সেকেন্ড (ফাস্ট লুপ)</option>
                  <option value={10}>১০ সেকেন্ড (স্ট্যান্ডার্ড)</option>
                  <option value={15}>১৫ সেকেন্ড</option>
                  <option value={20}>২০ সেকেন্ড</option>
                  <option value={30}>৩০ সেকেন্ড (লং ক্রল)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 font-medium">ফ্রেম রেট (Frame Rate)</label>
                <select
                  value={fps}
                  disabled={isRecording}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value={30}>30 FPS (স্মুথ)</option>
                  <option value={60}>60 FPS (আল্ট্রা স্মুথ)</option>
                </select>
              </div>
            </div>

            {/* Quality warnings based on selection */}
            <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-850 flex gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-zinc-400 leading-relaxed">
                <span className="font-semibold text-zinc-200">ব্যাকগ্রাউন্ড মোড:</span>{' '}
                {backgroundType === 'transparent' ? (
                  <span className="text-emerald-400">স্বচ্ছ (Transparent) WebM ফরম্যাট এক্সপোর্ট হবে। এটি এডোবি প্রিমিয়ার প্রো, ক্যানভাস বা OBS-এ সরাসরি কোনো ক্রোমা কি ছাড়াই ব্যাকগ্রাউন্ড ছাড়া বসানো যাবে।</span>
                ) : (
                  <span className="text-blue-400">ক্রোমা কি (গ্রিন স্ক্রিন / ব্লু স্ক্রিন) ফরম্যাট এক্সপোর্ট হবে। এটি ক্যাপকাট (CapCut), কাইনমাস্টার বা যেকোনো মোবাইল অ্যাপে ক্রোমা কি দিয়ে ব্যাকগ্রাউন্ড মুছে ব্যবহার করতে পারবেন।</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-zinc-800/50 space-y-3">
              {!isRecording ? (
                <button
                  onClick={handleStartExport}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-zinc-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-red-950/20 active:scale-[0.98] transition cursor-pointer"
                >
                  <Video className="w-5 h-5 shrink-0" />
                  হাই-রেজুলেশন ভিডিও তৈরি করুন
                </button>
              ) : (
                <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-amber-500 animate-pulse flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                      ক্যানভাস রেকর্ড হচ্ছে...
                    </span>
                    <span className="text-zinc-400">{progress}% সম্পন্ন</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-amber-500 h-full transition-all duration-100 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 text-center italic">
                    দয়া করে রেকর্ড চলাকালীন ব্রাউজার ট্যাবটি ওপেন রাখুন।
                  </p>
                </div>
              )}

              {/* Latest exported video download link */}
              {latestBlobUrl && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col items-center justify-center text-center animate-fade-in space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    ভিডিও সফলভাবে তৈরি হয়েছে!
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    নিচের বাটনে ক্লিক করে সরাসরি আপনার কম্পিউটারে সেইভ করুন।
                  </p>
                  <a
                    href={latestBlobUrl}
                    download={`Breaking_News_${resolution}_${backgroundType}_${duration}s.webm`}
                    className="flex items-center gap-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-2.5 px-6 rounded-lg transition shadow-md w-full justify-center"
                  >
                    <Download className="w-4 h-4" />
                    ডাউনলোড করুন (WebM Format)
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-4 text-xs text-zinc-300 leading-relaxed pr-1 max-h-[320px] overflow-y-auto">
            <div className="space-y-2">
              <h4 className="font-bold text-zinc-100 text-sm border-l-2 border-amber-500 pl-2">
                ১. স্বচ্ছ ব্যাকগ্রাউন্ড (Transparent Codec)
              </h4>
              <p>
                যখন আপনি <span className="text-amber-400">Transparent</span> ব্যাকগ্রাউন্ড সিলেক্ট করে ভিডিও তৈরি করবেন, তখন আউটপুট ফাইলটি হবে একটি বিশেষ <span className="font-mono">WebM (Alpha)</span> ভিডিও।
              </p>
              <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                <li><span className="text-zinc-200">পিসি সফটওয়্যার:</span> Premiere Pro, DaVinci Resolve, OBS Studio, Filmora, এবং CapCut (Desktop)-এ সরাসরি কোনো বাড়তি সেটিংস ছাড়াই এটি ট্রান্সপারেন্ট হিসেবে কাজ করে।</li>
                <li><span className="text-zinc-200">সুবিধা:</span> কোনো গ্রিন স্ক্রিন বা ক্রোমা কি করা লাগে না, ফলে টেক্সট ও গ্রাফিক্সের ধারগুলো একদম নিখুঁত ও ক্রিস্টাল ক্লিয়ার দেখায়।</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-zinc-100 text-sm border-l-2 border-amber-500 pl-2">
                ২. ক্রোমা কি ব্যাকগ্রাউন্ড (Green Screen)
              </h4>
              <p>
                মোবাইল অ্যাপস (যেমন CapCut Mobile, Kinemaster, InShot) অনেক সময় ট্রান্সপারেন্ট WebM ফাইল সাপোর্ট করে না। তাদের জন্য <span className="text-emerald-400">Green Screen</span> বা <span className="text-blue-400">Blue Screen</span> বেস্ট অপশন।
              </p>
              <ul className="list-decimal pl-4 space-y-1 text-zinc-400 text-[11px]">
                <li>ভিডিওটি ডাউনলোড করে আপনার মোবাইল এডিটরে মেইন ভিডিওর উপরে ওভারলে হিসেবে যোগ করুন।</li>
                <li>এডিটরের <span className="font-bold text-zinc-200">Chroma Key / Remove Color</span> টুলটি সিলেক্ট করুন।</li>
                <li>কালার পিকার দিয়ে ব্যাকগ্রাউন্ডের সবুজ রঙটি সিলেক্ট করুন এবং <span className="text-zinc-200">Intensity/Strength</span> এডজাস্ট করে ব্যাকগ্রাউন্ড রিমুভ করে ফেলুন।</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2 flex-1 max-h-[320px] overflow-y-auto pr-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">
              কারেন্ট সেশনে তৈরি করা ক্লিপসমূহ
            </span>
            {exportedVideos.filter(v => v.url).length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-lg p-6 text-center text-zinc-600 text-xs">
                কোনো ভিডিও রেকর্ড রেকর্ড পাওয়া যায়নি। এক্সপোর্ট ট্যাব থেকে নতুন ভিডিও তৈরি করুন।
              </div>
            ) : (
              <div className="space-y-2">
                {exportedVideos
                  .filter(v => v.url)
                  .map((video) => (
                    <div
                      key={video.id}
                      className="bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <p className="text-zinc-200 font-medium truncate" title={video.name}>
                          {video.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          সময়কাল: {video.duration} সেকেন্ড • সাইজ: {video.size} MB
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={video.url}
                          download={video.name}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition"
                          title="পুনরায় ডাউনলোড"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={(e) => deleteHistoryItem(video.id, e)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
