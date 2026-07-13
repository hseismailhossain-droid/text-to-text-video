import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Upload, Image as ImageIcon, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { NewsTemplate, BackgroundType, VideoResolution, RESOLUTIONS } from '../types';

interface MediaPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  template: NewsTemplate;
  backgroundType: BackgroundType;
  resolution: VideoResolution;
  tickerX: number;
  setTickerX: React.Dispatch<React.SetStateAction<number>>;
  onDrawCanvas: (
    canvas: HTMLCanvasElement,
    tickerX: number,
    sampleMedia: HTMLImageElement | HTMLVideoElement | null,
    showSampleMedia: boolean
  ) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export default function MediaPreview({
  canvasRef,
  template,
  backgroundType,
  resolution,
  tickerX,
  setTickerX,
  onDrawCanvas,
  isPlaying,
  setIsPlaying,
}: MediaPreviewProps) {
  const [showSampleBg, setShowSampleBg] = useState<boolean>(true);
  const [sampleBgType, setSampleBgType] = useState<'none' | 'studio' | 'testbars' | 'custom'>('studio');
  const [customFileUrl, setCustomFileUrl] = useState<string | null>(null);
  const [customFileType, setCustomFileType] = useState<'image' | 'video' | null>(null);
  
  const sampleVideoRef = useRef<HTMLVideoElement | null>(null);
  const sampleImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize preloaded sample video/image
  const studioVideoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-news-studio-background-with-flashing-lights-42289-large.mp4';
  const testBarsUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/SMPTE_Color_Bars.svg/1024px-SMPTE_Color_Bars.svg.png';

  // Handle custom sample upload
  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCustomFileUrl(url);
    setSampleBgType('custom');
    setShowSampleBg(true);

    if (file.type.startsWith('video/')) {
      setCustomFileType('video');
      // Set up hidden video element
      if (sampleVideoRef.current) {
        sampleVideoRef.current.src = url;
        sampleVideoRef.current.load();
        sampleVideoRef.current.play().catch(() => {});
      }
    } else {
      setCustomFileType('image');
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (sampleImageRef.current) {
          sampleImageRef.current.src = url;
        }
      };
    }
  };

  // Clean up Object URL on unmount
  useEffect(() => {
    return () => {
      if (customFileUrl) URL.revokeObjectURL(customFileUrl);
    };
  }, [customFileUrl]);

  // Sync default sample background image or video elements
  useEffect(() => {
    if (sampleBgType === 'studio') {
      if (sampleVideoRef.current) {
        sampleVideoRef.current.src = studioVideoUrl;
        sampleVideoRef.current.load();
        sampleVideoRef.current.play().catch(() => {});
      }
    } else if (sampleBgType === 'testbars') {
      const img = new Image();
      img.src = testBarsUrl;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (sampleImageRef.current) {
          sampleImageRef.current.src = testBarsUrl;
        }
      };
    }
  }, [sampleBgType]);

  // Handle active background source element getter
  const getActiveSampleMedia = (): HTMLImageElement | HTMLVideoElement | null => {
    if (!showSampleBg) return null;
    if (sampleBgType === 'studio') return sampleVideoRef.current;
    if (sampleBgType === 'testbars') return sampleImageRef.current;
    if (sampleBgType === 'custom') {
      return customFileType === 'video' ? sampleVideoRef.current : sampleImageRef.current;
    }
    return null;
  };

  // Continuously draw canvas in preview mode (especially for video backgrounds)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;

    const updateFrame = () => {
      const activeMedia = getActiveSampleMedia();
      onDrawCanvas(canvas, tickerX, activeMedia, showSampleBg);
      
      // Request next frame
      animId = requestAnimationFrame(updateFrame);
    };

    animId = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(animId);
  }, [canvasRef, template, backgroundType, resolution, tickerX, showSampleBg, sampleBgType, customFileType]);

  // Reset Ticker Position
  const handleResetTicker = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setTickerX(canvas.width);
    }
  };

  const { width, height } = RESOLUTIONS[resolution];
  const isVertical = resolution === 'vertical_shorts';

  return (
    <div id="media-preview-container" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold text-zinc-100 flex items-center gap-2">
          <Eye className="w-5 h-5 text-red-500" />
          ভিডিও ক্যানভাস প্রিভিউ
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] bg-zinc-950 px-2 py-1 rounded border border-zinc-850">
          <span className="font-semibold text-zinc-300">আউটপুট রেজুলেশন:</span>
          <span className="text-amber-500 font-mono font-bold">
            {width}x{height}
          </span>
        </div>
      </div>

      {/* Actual Canvas with proportional container */}
      <div 
        className={`w-full bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 relative flex items-center justify-center`}
        style={{ aspectRatio: isVertical ? '9/16' : '16/9', maxHeight: '480px' }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="max-w-full max-h-full object-contain"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Hidden elements for media source */}
        <video
          ref={sampleVideoRef}
          crossOrigin="anonymous"
          muted
          loop
          playsInline
          className="hidden"
          src={studioVideoUrl}
        />
        <img
          ref={sampleImageRef}
          crossOrigin="anonymous"
          className="hidden"
          alt="sample background"
          src={testBarsUrl}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleCustomUpload}
          className="hidden"
        />
      </div>

      {/* Preview Player & Controls */}
      <div className="w-full mt-4 flex flex-col gap-3">
        {/* Playback Controls & Ticker Settings */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-850">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isPlaying 
                  ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  পজ করুন
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  প্লে করুন
                </>
              )}
            </button>

            <button
              onClick={handleResetTicker}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition"
              title="টিকার শুরু থেকে আনুন"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Sample Background Overlay Switches */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSampleBg(!showSampleBg)}
              className={`p-1.5 rounded transition ${
                showSampleBg ? 'text-amber-500 bg-amber-500/10' : 'text-zinc-500 bg-zinc-900'
              }`}
              title={showSampleBg ? 'নমুনা ব্যাকগ্রাউন্ড লুকান' : 'নমুনা ব্যাকগ্রাউন্ড দেখান'}
            >
              {showSampleBg ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
            </button>

            {showSampleBg && (
              <div className="flex items-center gap-1 text-[11px]">
                <select
                  value={sampleBgType}
                  onChange={(e) => setSampleBgType(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-zinc-300 focus:outline-none"
                >
                  <option value="studio">স্টুডিও ভিডিও</option>
                  <option value="testbars">টিভি কালার বার</option>
                  <option value="custom">নিজের ফাইল</option>
                </select>

                {sampleBgType === 'custom' && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
                    title="ফাইল আপলোড করুন"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Informative Label */}
        <p className="text-[11px] text-zinc-500 italic text-center">
          * নমুনা ব্যাকগ্রাউন্ডটি শুধুমাত্র আপনার এডিটিংয়ের সুবিধার্থে প্রিভিউতে দেখানোর জন্য। চূড়ান্ত ভিডিও এক্সপোর্ট করার সময় এটি বাদ যাবে এবং নির্বাচিত স্বচ্ছ বা গ্রিন স্ক্রিন ফরম্যাট তৈরি হবে।
        </p>
      </div>
    </div>
  );
}
