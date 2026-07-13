import React, { useState, useRef } from 'react';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { Tv, Sparkles, Youtube, Film, CheckCircle2, Shield, Video, Flame } from 'lucide-react';
import { OverlaySettings, RenderState } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { RenderStatusCard } from './components/RenderStatusCard';

const INITIAL_SETTINGS: OverlaySettings = {
  text: '🚨 ব্রেকিং নিউজ: আমাদের নতুন আল্ট্রা-স্মুথ মোবাইল ওভারলে মেকারে আপনাকে স্বাগত! যেকোনো নিউজ বা তথ্যচিত্র ভিডিওর জন্য দ্রুত এবং হাই-ডেফিনিশন কোয়ালিটি স্ক্রলিং ওভারলে তৈরি করুন সম্পূর্ণ ফ্রিতে।',
  fontSize: 90,
  textColor: '#ffffff',
  speed: 6,
  direction: 'horizontal',
  bgMode: 'transparent',
  bgImage: null,
  fontFamily: '"Noto Sans Bengali", sans-serif',
};

const INITIAL_RENDER_STATE: RenderState = {
  isRecording: false,
  currentFrame: 0,
  totalFrames: 0,
  progress: 0,
  status: 'নিষ্ক্রিয় (Ready)',
  finalBlob: null,
};

export default function App() {
  const [settings, setSettings] = useState<OverlaySettings>(INITIAL_SETTINGS);
  const [duration, setDuration] = useState<number>(10);
  const [renderState, setRenderState] = useState<RenderState>(INITIAL_RENDER_STATE);
  const [cachedLines, setCachedLines] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Shared positioning refs to track scrolling position
  const textXRef = useRef<number>(1920);
  const textYRef = useRef<number>(1080);

  // Function to draw a single frame to a specified context & coordinates
  const drawRenderFrame = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    x: number,
    y: number,
    targetSettings: OverlaySettings,
    lines: string[],
    bgImgElement: HTMLImageElement | null
  ) => {
    // 1. Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 2. Draw background if Green Screen or Custom Image
    if (targetSettings.bgMode === 'green') {
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(0, 0, width, height);
    } else if (targetSettings.bgMode === 'custom' && bgImgElement) {
      ctx.drawImage(bgImgElement, 0, 0, width, height);
    }

    // Draw active safe border if green screen mode is enabled
    if (targetSettings.bgMode === 'green') {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 16;
      ctx.strokeRect(40, 40, width - 80, height - 80);
    }

    // 3. Set text styling
    ctx.fillStyle = targetSettings.textColor;
    ctx.font = `bold ${targetSettings.fontSize}px ${targetSettings.fontFamily}`;
    
    // Add professional soft shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    if (targetSettings.direction === 'horizontal') {
      ctx.textAlign = 'left';
      ctx.fillText(targetSettings.text, Math.round(x), Math.round(height / 2 + targetSettings.fontSize / 3));
    } else {
      ctx.textAlign = 'center';
      const lineHeight = targetSettings.fontSize * 1.4;
      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, Math.round(y + (index * lineHeight)));
      });
    }

    // Clean up shadow settings
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  // Main rendering handler
  const handleStartRender = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Temporarily pause preview and reset position for exact capture
    const fps = 30;
    const totalFrames = duration * fps;
    
    setRenderState({
      isRecording: true,
      currentFrame: 0,
      totalFrames,
      progress: 0,
      status: '🎬 হাই-কোয়ালিটি MP4 ফাইল তৈরি হচ্ছে...',
      finalBlob: null,
    });

    let bgImgElement: HTMLImageElement | null = null;
    try {
      if (settings.bgImage && settings.bgMode === 'custom') {
        bgImgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = settings.bgImage!;
        });
      }

      // 1. Setup Mp4 Muxer (Using ArrayBufferTarget for offline assembly)
      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width: canvas.width,
          height: canvas.height,
        },
        fastStart: 'in-memory',
      });

      // 2. Setup Native VideoEncoder
      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => {
          console.error('VideoEncoder error:', e);
          alert('রেন্ডারিং করতে সমস্যা হয়েছে! দয়া করে গুগল ক্রোম ব্রাউজার ব্যবহার করুন।');
          setRenderState(prev => ({ ...prev, isRecording: false }));
        },
      });

      videoEncoder.configure({
        codec: 'avc1.4d002a', // Baseline profile for maximum phone/web compatibility
        width: canvas.width,
        height: canvas.height,
        bitrate: 3_000_000, // 3 Mbps for high quality Full HD
      });

      // Prepare local positions
      let localTextX = canvas.width;
      let localTextY = canvas.height;
      let currentFrameIndex = 0;

      // Temporary offscreen canvas to avoid polluting live preview canvas during encode
      const renderCanvas = document.createElement('canvas');
      renderCanvas.width = canvas.width;
      renderCanvas.height = canvas.height;
      const renderCtx = renderCanvas.getContext('2d');
      if (!renderCtx) throw new Error('Could not create offscreen 2D context');

      // Calculate text width once for horizontal wrap calculations
      renderCtx.font = `bold ${settings.fontSize}px ${settings.fontFamily}`;
      const textWidth = renderCtx.measureText(settings.text).width;
      const lineHeight = settings.fontSize * 1.4;
      const totalHeight = cachedLines.length * lineHeight;

      const encodeNextFrame = async () => {
        if (currentFrameIndex >= totalFrames) {
          // Finalize encoding
          setRenderState(prev => ({ ...prev, status: '💾 এনকোডিং সম্পন্ন হচ্ছে...' }));
          await videoEncoder.flush();
          muxer.finalize();

          const { buffer } = muxer.target;
          const finalBlob = new Blob([buffer], { type: 'video/mp4' });

          setRenderState({
            isRecording: false,
            currentFrame: totalFrames,
            totalFrames,
            progress: 100,
            status: '🎉 রেন্ডার কমপ্লিট!',
            finalBlob,
          });

          // Trigger auto-download
          triggerDownload(finalBlob);
          return;
        }

        // Calculate progress percentage
        const progress = Math.ceil((currentFrameIndex / totalFrames) * 100);
        setRenderState(prev => ({
          ...prev,
          currentFrame: currentFrameIndex + 1,
          progress,
        }));

        // Draw current frame onto offscreen rendering canvas
        drawRenderFrame(
          renderCtx,
          renderCanvas.width,
          renderCanvas.height,
          localTextX,
          localTextY,
          settings,
          cachedLines,
          bgImgElement
        );

        // Capture offscreen canvas frame as a bitmap
        const bitmap = await createImageBitmap(renderCanvas);
        const timestamp = (currentFrameIndex * 1000 / fps) * 1000; // in microseconds

        // Create a native VideoFrame from the image bitmap
        const videoFrame = new VideoFrame(bitmap, { timestamp });

        // Encode the video frame
        videoEncoder.encode(videoFrame, {
          keyFrame: currentFrameIndex % 30 === 0, // Keyframe every 1 second
        });
        
        videoFrame.close(); // Close the VideoFrame to release underlying resources
        bitmap.close(); // Immediate memory cleanup

        // Advance positioning parameters by speed (factoring 30fps rendering vs 60fps preview)
        const frameSpeed = settings.speed * 2;
        if (settings.direction === 'horizontal') {
          localTextX -= frameSpeed;
          if (localTextX < -textWidth) {
            localTextX = canvas.width;
          }
        } else {
          localTextY -= frameSpeed;
          if (localTextY < -totalHeight) {
            localTextY = canvas.height;
          }
        }

        currentFrameIndex++;
        // Small interval to keep UI responsive and allow progress updates
        setTimeout(encodeNextFrame, 8);
      };

      // Boot up encoder thread loop
      encodeNextFrame();

    } catch (err) {
      console.error(err);
      alert('রেন্ডার করার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      setRenderState(prev => ({ ...prev, isRecording: false }));
    }
  };

  const triggerDownload = (blobToDownload?: Blob) => {
    const targetBlob = blobToDownload || renderState.finalBlob;
    if (!targetBlob) return;

    const fileName = `overlay-${Date.now()}.mp4`;
    const url = URL.createObjectURL(targetBlob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Decorative Top Accent Glow Line */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 shadow-[0_1px_15px_rgba(16,185,129,0.5)]" />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Futuristic App Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2.5 rounded-xl text-slate-950 shadow-lg shadow-emerald-500/10 shrink-0">
              <Tv className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-wide font-bengali text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 flex items-center gap-2">
                আল্ট্রা-স্মুথ অটো ওভারলে স্টুডিও
                <span className="text-[10px] bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-black px-2 py-0.5 rounded-md leading-none uppercase">Pro v8</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-bengali">
                যেকোনো ভিডিওর জন্য মোবাইল ফ্রেন্ডলি ব্রেকিং নিউজ এবং অ্যান্ড-ক্রেডিট ওভারলে মেকার
              </p>
            </div>
          </div>

          {/* Active Status Badge */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/60 px-3.5 py-1.5 rounded-full text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${renderState.isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'} shrink-0`} />
            <span className="text-[10px] text-slate-400 font-semibold font-bengali uppercase">
              {renderState.isRecording ? 'রেন্ডারিং সক্রিয়' : 'স্টুডিও অনলাইন'}
            </span>
          </div>
        </header>

        {/* Studio Control & Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parameter Settings */}
          <div className="lg:col-span-5 h-fit">
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
            />
          </div>

          {/* Right Column: Calculations & Video Rendering controls */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <RenderStatusCard
              duration={duration}
              renderState={renderState}
              onStartRender={handleStartRender}
              onDownload={() => triggerDownload()}
            />
          </div>
        </div>

        {/* Widescreen Interactive Live Monitor */}
        <section className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 md:p-5 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-300 font-bengali">লাইভ ওভারলে ভিউয়ার (Preview)</h3>
            </div>
            <div className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
              60 FPS RENDERER
            </div>
          </div>

          <PreviewCanvas
            settings={settings}
            canvasRef={canvasRef}
            isRecording={renderState.isRecording}
            onDurationCalculated={setDuration}
            textXRef={textXRef}
            textYRef={textYRef}
            cachedLines={cachedLines}
            setCachedLines={setCachedLines}
          />
        </section>

        {/* Dynamic Step-by-Step Production Guide */}
        <footer className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-850">
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-850/50">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-bengali">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-[10px] font-bold">১</span>
              ওভারলে সাজান
            </div>
            <p className="text-[11px] text-slate-400 font-bengali leading-relaxed">
              আপনার ব্রেকিং নিউজ বা তথ্য টেক্সট বক্সে টাইপ করুন। এরপর লেখার সাইজ, কালার ও অ্যানিমেশনের গতি পরিবর্তন করে লাইভ প্রিভিউ দেখুন।
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-850/50">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs font-bengali">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/10 text-[10px] font-bold">২</span>
              ভিডিও তৈরি করুন
            </div>
            <p className="text-[11px] text-slate-400 font-bengali leading-relaxed">
              <b>"অটো জেনারেট করুন"</b> বাটনে ক্লিক করুন। এটি সম্পূর্ণ অফলাইনে কোনো ফ্রেম মিস না করে হাই-কোয়ালিটি MP4 ফাইল জেনারেট করবে।
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-850/50">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs font-bengali">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 text-[10px] font-bold">৩</span>
              এডিটিং সফটওয়্যারে ব্যবহার
            </div>
            <p className="text-[11px] text-slate-400 font-bengali leading-relaxed">
              ডাউনলোডকৃত ফাইলটি OBS-এ Media Source হিসেবে সরাসরি বসান। অথবা CapCut বা KineMaster-এ গ্রিন স্ক্রিন মোডের সবুজ অংশ Chrome Key দিয়ে বাদ দিন।
            </p>
          </div>
        </footer>
      </main>

      {/* Decorative Bottom Credit bar */}
      <footer className="py-4 text-center border-t border-slate-900 text-[11px] text-slate-500 font-bengali mt-auto">
        <div className="flex items-center justify-center gap-1.5">
          <span>আল্ট্রা-স্মুথ অটো ওভারলে স্টুডিও © ২০২৬</span>
          <span>•</span>
          <span className="text-slate-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-current animate-pulse" />
            মোবাইল ও পিসির জন্য শতভাগ নিরাপদ
          </span>
        </div>
      </footer>
    </div>
  );
}
