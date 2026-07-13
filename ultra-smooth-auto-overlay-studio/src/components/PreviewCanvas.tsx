import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, Grid, Shield, Maximize2, Sparkles, Tv, Camera, Download } from 'lucide-react';
import { OverlaySettings } from '../types';

interface PreviewCanvasProps {
  settings: OverlaySettings;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isRecording: boolean;
  onDurationCalculated: (duration: number) => void;
  // Shared positioning refs so render and preview don't clash
  textXRef: React.MutableRefObject<number>;
  textYRef: React.MutableRefObject<number>;
  cachedLines: string[];
  setCachedLines: (lines: string[]) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  settings,
  canvasRef,
  isRecording,
  onDurationCalculated,
  textXRef,
  textYRef,
  cachedLines,
  setCachedLines
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [showCameraGuides, setShowCameraGuides] = useState<boolean>(true);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!settings.bgImage) {
      setBgImg(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setBgImg(img);
    };
    img.src = settings.bgImage;
  }, [settings.bgImage]);

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create an offscreen canvas to guarantee transparent PNG capture
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    // Draw background image if provided and background mode is custom
    if (settings.bgImage && settings.bgMode === 'custom' && bgImg) {
      exportCtx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else if (settings.bgMode === 'green') {
      // If user wants green screen in image too, draw green background
      exportCtx.fillStyle = '#00FF00';
      exportCtx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Set text styles
    exportCtx.fillStyle = settings.textColor;
    exportCtx.font = `bold ${settings.fontSize}px ${settings.fontFamily}`;
    
    exportCtx.shadowColor = "rgba(0, 0, 0, 0.4)";
    exportCtx.shadowBlur = 8;
    exportCtx.shadowOffsetX = 4;
    exportCtx.shadowOffsetY = 4;

    if (settings.direction === 'horizontal') {
      exportCtx.textAlign = "left";
      exportCtx.fillText(settings.text, Math.round(textXRef.current), Math.round(canvas.height / 2 + settings.fontSize / 3));
    } else {
      exportCtx.textAlign = "center";
      const lineHeight = settings.fontSize * 1.4;
      cachedLines.forEach((line, index) => {
        exportCtx.fillText(line, canvas.width / 2, Math.round(textYRef.current + (index * lineHeight)));
      });
    }

    // Convert to transparent PNG and trigger download
    const dataUrl = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `overlay-frame-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Helper to split text into lines
  const getLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(/(\s+)/);
    const lines: string[] = [];
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.includes('\n')) {
        const subWords = word.split('\n');
        currentLine += subWords[0];
        lines.push(currentLine);
        for (let j = 1; j < subWords.length - 1; j++) {
          lines.push(subWords[j]);
        }
        currentLine = subWords[subWords.length - 1];
      } else {
        const testLine = currentLine + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
    }
    lines.push(currentLine);
    return lines.filter(line => line.trim() !== "");
  };

  // Recalculate duration when settings change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = `bold ${settings.fontSize}px ${settings.fontFamily}`;
    const speed = settings.speed;

    let duration = 10;
    if (settings.direction === 'horizontal') {
      const textWidth = ctx.measureText(settings.text).width;
      // Calculate duration at 60fps
      duration = Math.ceil((textWidth + canvas.width) / (speed * 60));
    } else {
      const lines = getLines(ctx, settings.text, canvas.width - 300);
      setCachedLines(lines);
      const totalHeight = lines.length * (settings.fontSize * 1.4);
      duration = Math.ceil((totalHeight + canvas.height) / (speed * 60));
    }

    onDurationCalculated(Math.max(2, duration));
  }, [settings.text, settings.fontSize, settings.speed, settings.direction, settings.fontFamily]);

  // Reset positions when settings or direction changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    textXRef.current = canvas.width;
    textYRef.current = canvas.height;
  }, [settings.direction, settings.text, settings.fontSize]);

  // Live preview animation loop
  useEffect(() => {
    if (isRecording || !isPlaying) return;

    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // 1. Clear background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (settings.bgMode === 'green') {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (settings.bgMode === 'custom' && bgImg) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      }

      // Draw active preview bounds
      ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
      ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Set font & styles
      ctx.fillStyle = settings.textColor;
      ctx.font = `bold ${settings.fontSize}px ${settings.fontFamily}`;
      
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;

      const speed = settings.speed;

      if (settings.direction === 'horizontal') {
        ctx.textAlign = "left";
        ctx.fillText(settings.text, Math.round(textXRef.current), Math.round(canvas.height / 2 + settings.fontSize / 3));
        textXRef.current -= speed;
        const textWidth = ctx.measureText(settings.text).width;
        if (textXRef.current < -textWidth) {
          textXRef.current = canvas.width;
        }
      } else {
        ctx.textAlign = "center";
        const lineHeight = settings.fontSize * 1.4;
        cachedLines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, Math.round(textYRef.current + (index * lineHeight)));
        });
        textYRef.current -= speed;
        const totalHeight = cachedLines.length * lineHeight;
        if (textYRef.current < -totalHeight) {
          textYRef.current = canvas.height;
        }
      }

      // Reset shadow for subsequent draws
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, isRecording, settings, cachedLines, bgImg]);

  // Draw once if paused or static change
  useEffect(() => {
    if (isPlaying || isRecording) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (settings.bgMode === 'green') {
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (settings.bgMode === 'custom' && bgImg) {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    }

    ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
    ctx.lineWidth = 12;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    ctx.fillStyle = settings.textColor;
    ctx.font = `bold ${settings.fontSize}px ${settings.fontFamily}`;
    
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    if (settings.direction === 'horizontal') {
      ctx.textAlign = "left";
      ctx.fillText(settings.text, Math.round(textXRef.current), Math.round(canvas.height / 2 + settings.fontSize / 3));
    } else {
      ctx.textAlign = "center";
      const lineHeight = settings.fontSize * 1.4;
      cachedLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, Math.round(textYRef.current + (index * lineHeight)));
      });
    }

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }, [isPlaying, settings, cachedLines, bgImg]);

  return (
    <div className="space-y-4">
      {/* Control Buttons row above canvas */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isRecording}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 font-bengali shadow-sm ${
              isRecording 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                সাময়িক বিরতি (Pause)
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                চালু করুন (Play)
              </>
            )}
          </button>

          <button
            type="button"
            id="reset-pos-btn"
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) {
                textXRef.current = canvas.width;
                textYRef.current = canvas.height;
              }
            }}
            disabled={isRecording}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition font-bengali border border-slate-700/50"
          >
            শুরু থেকে দেখুন
          </button>

          <button
            type="button"
            id="download-png-frame-btn"
            onClick={handleDownloadPNG}
            disabled={isRecording}
            className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white bg-slate-950 hover:bg-slate-850 px-3.5 py-2 rounded-lg transition font-bengali border border-emerald-500/20 shadow-sm"
            title="বর্তমান স্ক্রিনের একটি স্বচ্ছ PNG ইমেজ ডাউনলোড করুন"
          >
            <Camera className="w-3.5 h-3.5" />
            PNG ফ্রেম ডাউনলোড
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Safe Zones Toggle */}
          <button
            type="button"
            id="toggle-safezone-btn"
            onClick={() => setShowSafeZone(!showSafeZone)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition border ${
              showSafeZone 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold' 
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
            title="টিভি সেফ জোন সীমানা (Action/Title Safe)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bengali">টিভি সেফ জোন</span>
          </button>

          {/* Camera Guidelines Toggle */}
          <button
            type="button"
            id="toggle-guides-btn"
            onClick={() => setShowCameraGuides(!showCameraGuides)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition border ${
              showCameraGuides 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold' 
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
            title="ক্যামেরা গাইডলাইনস"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bengali">ক্যামেরা গ্রিড</span>
          </button>
        </div>
      </div>

      {/* Responsive Canvas Container with neon styling */}
      <div className={`relative w-full aspect-video bg-slate-950 rounded-2xl border ${isRecording ? 'border-red-500 neon-glow-red' : 'border-emerald-500/30 neon-glow-green'} overflow-hidden transition-all duration-300`}>
        
        {/* Canvas Element */}
        <canvas
          id="canvas"
          ref={canvasRef}
          width="1920"
          height="1080"
          className="w-full h-full object-contain block bg-transparent"
        />

        {/* --- HTML/CSS Overlays (Not captured in output video) --- */}
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-white block"></span>
            REC • HD 1080P
          </div>
        )}

        {/* Live Preview Info Label */}
        {!isRecording && (
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-md border border-slate-800">
            LIVE PREVIEW
          </div>
        )}

        {/* Dimension Badge */}
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1">
          <Tv className="w-3 h-3 text-emerald-400" />
          1920 x 1080 (16:9 Full HD)
        </div>

        {/* Safe Zone Grid Overlays */}
        {showSafeZone && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Title Safe Zone (80% box) */}
            <div className="absolute inset-[10%] border border-dashed border-emerald-500/20 rounded">
              <div className="absolute -top-4 left-2 text-[9px] font-mono text-emerald-500/40">TITLE SAFE (90%)</div>
            </div>
            {/* Action Safe Zone (90% box) */}
            <div className="absolute inset-[5%] border border-dashed border-cyan-500/25 rounded">
              <div className="absolute -top-4 left-2 text-[9px] font-mono text-cyan-500/40">ACTION SAFE (95%)</div>
            </div>
          </div>
        )}

        {/* Tech Camera Grid Lines */}
        {showCameraGuides && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 opacity-50">
            {/* Crosshair in Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="w-8 h-[1px] bg-slate-500/30 absolute"></div>
              <div className="h-8 w-[1px] bg-slate-500/30 absolute"></div>
              <div className="w-2 h-2 rounded-full border border-slate-500/40"></div>
            </div>

            {/* Corner Bracket Graphics */}
            <div className="flex justify-between w-full">
              <div className="w-6 h-6 border-t-2 border-l-2 border-slate-700/60 rounded-tl"></div>
              <div className="w-6 h-6 border-t-2 border-r-2 border-slate-700/60 rounded-tr"></div>
            </div>
            <div className="flex justify-between w-full mt-auto">
              <div className="w-6 h-6 border-b-2 border-l-2 border-slate-700/60 rounded-bl"></div>
              <div className="w-6 h-6 border-b-2 border-r-2 border-slate-700/60 rounded-br"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
