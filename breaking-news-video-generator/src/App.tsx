/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Tv, Flame, Radio, Cpu, FileVideo, VideoOff, Info, HelpCircle } from 'lucide-react';
import { NewsTemplate, BackgroundType, VideoResolution, RESOLUTIONS } from './types';
import { NEWS_PRESETS } from './presets';
import { renderCanvas } from './utils/canvasRenderer';
import TemplateManager from './components/TemplateManager';
import NewsControls from './components/NewsControls';
import MediaPreview from './components/MediaPreview';
import VideoExporter from './components/VideoExporter';

export default function App() {
  // 1. Core States
  const [template, setTemplate] = useState<NewsTemplate>(NEWS_PRESETS[0]);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('preview_dark');
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // 2. Refs for high-performance animation rendering (avoiding state lag)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tickerXRef = useRef<number>(1920);
  const tickerWidthRef = useRef<number>(2000);
  
  // States for clock & blinkers
  const [currentTimeString, setCurrentTimeString] = useState<string>('12:00:00 PM');
  const [blinkState, setBlinkState] = useState<boolean>(true);

  // 3. Ticker Width Calculation (runs when text or resolution changes)
  const calculateTickerWidth = () => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      const { height } = RESOLUTIONS[resolution];
      const S = height / 1080;
      tempCtx.font = `500 ${18 * S}px 'Hind Siliguri', sans-serif`;
      const width = tempCtx.measureText(template.tickerText).width;
      tickerWidthRef.current = width;
    }
  };

  useEffect(() => {
    calculateTickerWidth();
    // Reset ticker to start from right edge when text or resolution changes
    const { width } = RESOLUTIONS[resolution];
    tickerXRef.current = width;
  }, [template.tickerText, resolution]);

  // 4. Real-time Clock Updater (bengali or english style)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format options
      const timeStr = now.toLocaleTimeString('bn-BD', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTimeString(timeStr);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 5. Blinking Badge Timer (500ms intervals)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState((b) => !b);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  // 6. Ticker Scrolling math frame loop
  useEffect(() => {
    let animId: number;
    const { width: canvasWidth } = RESOLUTIONS[resolution];

    const scrollLoop = () => {
      if (isPlaying && !isRecording) {
        // Scroll ticker left based on template speed
        tickerXRef.current -= template.tickerSpeed * 1.5;
        
        // Wrap-around logic
        if (tickerXRef.current < -tickerWidthRef.current) {
          tickerXRef.current = canvasWidth;
        }
      }
      animId = requestAnimationFrame(scrollLoop);
    };

    animId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isRecording, resolution, template.tickerSpeed]);

  // 7. Dynamic Canvas render function shared with MediaPreview
  const handleDrawCanvas = (
    canvas: HTMLCanvasElement,
    unusedStateX: number, // we use ref instead for speed
    sampleMedia: HTMLImageElement | HTMLVideoElement | null,
    showSampleMedia: boolean
  ) => {
    renderCanvas(
      canvas,
      template,
      tickerXRef.current,
      backgroundType,
      {
        blinkState,
        currentTimeString,
        sampleMedia,
        showSampleMedia: !isRecording && showSampleMedia, // Hide sample background during export!
      }
    );
  };

  // 8. Recording stream pipeline triggered from VideoExporter
  const handleStartRecording = (
    durationMs: number,
    onComplete: (url: string, blob: Blob) => void
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set resolution sizes
    const { width: canvasWidth, height: canvasHeight } = RESOLUTIONS[resolution];
    
    // Ensure ticker starts scrolling smoothly from right edge on export
    tickerXRef.current = canvasWidth;

    // Recording configuration: frame rate
    const stream = canvas.captureStream(30); // export locked at standard 30 FPS for reliable media rendering
    
    // Check optimal container codec
    let mimeType = 'video/webm';
    if (backgroundType === 'transparent') {
      const transparentCodecs = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];
      for (const t of transparentCodecs) {
        if (MediaRecorder.isTypeSupported(t)) {
          mimeType = t;
          break;
        }
      }
    } else {
      const chromaCodecs = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];
      for (const t of chromaCodecs) {
        if (MediaRecorder.isTypeSupported(t)) {
          mimeType = t;
          break;
        }
      }
    }

    const options = { mimeType };
    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      onComplete(url, blob);
    };

    // Frame update loop specifically for recorder timing consistency
    let recordAnimId: number;
    let isRecordLoopActive = true;

    const recordTick = () => {
      if (!isRecordLoopActive) return;
      
      // Advance ticker position smoothly
      tickerXRef.current -= template.tickerSpeed * 1.5;
      if (tickerXRef.current < -tickerWidthRef.current) {
        tickerXRef.current = canvasWidth;
      }

      // Draw frame (guarantees sample backdrop is hidden)
      renderCanvas(canvas, template, tickerXRef.current, backgroundType, {
        blinkState,
        currentTimeString,
        sampleMedia: null,
        showSampleMedia: false,
      });

      recordAnimId = requestAnimationFrame(recordTick);
    };

    // Begin recording
    mediaRecorder.start();
    recordTick();

    // Automatically complete after requested duration limit
    setTimeout(() => {
      isRecordLoopActive = false;
      cancelAnimationFrame(recordAnimId);
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }, durationMs);
  };

  // 9. Load Saved Template Callback from localStorage
  const handleLoadTemplate = (selected: NewsTemplate) => {
    setTemplate(selected);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* HEADER BAR */}
      <header className="border-b border-zinc-900 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-600/20">
              <Tv className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5 font-display">
                ব্রেকিং নিউজ ভিডিও মেকার
                <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest font-mono">
                  PRO
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                লোকাল স্টোরেজ ও হাই-পারফরম্যান্স ক্যানভাস রেকর্ডার সম্বলিত স্টুডিও প্যানেল
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400 font-medium">লোকাল ইঞ্জিন রেডি</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: VIEWERS & RECTIFIERS (Width: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Canvas Preview Player Box */}
          <MediaPreview
            canvasRef={canvasRef}
            template={template}
            backgroundType={backgroundType}
            resolution={resolution}
            tickerX={tickerXRef.current}
            setTickerX={(val) => {
              if (typeof val === 'function') {
                tickerXRef.current = val(tickerXRef.current);
              } else {
                tickerXRef.current = val;
              }
            }}
            onDrawCanvas={handleDrawCanvas}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />

          {/* HTML5 Canvas Stream Recorder Box */}
          <VideoExporter
            canvasRef={canvasRef}
            backgroundType={backgroundType}
            resolution={resolution}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            onStartRecordingTrigger={handleStartRecording}
          />
        </div>

        {/* RIGHT COLUMN: CONTROLLERS & DATA LOGS (Width: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Template presets & localStorage saved templates list */}
          <TemplateManager
            currentConfig={template}
            onLoadTemplate={handleLoadTemplate}
          />

          {/* Custom Content editor tabs */}
          <NewsControls
            template={template}
            setTemplate={setTemplate}
            backgroundType={backgroundType}
            setBackgroundType={setBackgroundType}
            resolution={resolution}
            setResolution={setResolution}
          />
        </div>
      </main>

      {/* FLOATING STUDIO FOOTER DETAILED TIPS */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 mt-12 text-xs text-zinc-500 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="flex justify-center items-center gap-6 text-zinc-400 font-semibold text-[11px]">
            <span className="flex items-center gap-1.5"><Radio className="w-4 h-4 text-red-500" /> ওয়াটারমার্ক বিহীন ভিডিও</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-amber-500" /> ব্রাউজার মেমোরি বেসড সেভিংস</span>
            <span className="flex items-center gap-1.5"><FileVideo className="w-4 h-4 text-emerald-500" /> মোবাইল ও পিসিতে ব্যবহারের পূর্ণ স্বাধীনতা</span>
          </div>
          
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 text-left space-y-2 leading-relaxed">
            <h5 className="font-bold text-zinc-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              ভিডিও এডিটরে ব্যবহারের নির্দেশিকা (How to use on any Video Editor):
            </h5>
            <p className="text-[11px] text-zinc-400">
              ১. আপনার তৈরি ভিডিও ডাউনলোড করার পর সেটি আপনার মূল ভিডিওর উপর একটি লেয়ার বা ওভারলে হিসেবে বসান।
            </p>
            <p className="text-[11px] text-zinc-400">
              ২. আপনি যদি <span className="text-amber-400 font-semibold">Transparent</span> ফরম্যাটে ডাউনলোড করেন, তবে Premiere Pro বা OBS এ সরাসরি ব্যাকগ্রাউন্ড ছাড়া ভিডিওটি রেন্ডার হবে। আপনাকে কোনো ক্রোমা কি করতে হবে না।
            </p>
            <p className="text-[11px] text-zinc-400">
              ৩. মোবাইল ক্যাপকাট বা কাইনমাস্টারে ব্যবহারের জন্য <span className="text-emerald-400 font-semibold">Green Screen</span> ফরম্যাটটি ডাউনলোড করুন। এরপর ওভারলেতে ক্লিক করে 'Chroma Key' দিয়ে সবুজ রঙটি বাদ দিলেই ভিডিওটি কাঙ্ক্ষিত রূপ ধারণ করবে।
            </p>
          </div>

          <p className="text-[10px] text-zinc-600">
            © 2026 ব্রেকিং নিউজ ভিডিও মেকার প্রফেশনাল স্টুডিও। All rights reserved. সম্পূর্ণ অফলাইন ও লোকাল সুরক্ষায় সুরক্ষিত।
          </p>
        </div>
      </footer>
    </div>
  );
}
