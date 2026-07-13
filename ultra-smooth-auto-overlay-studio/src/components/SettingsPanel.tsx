import React, { startTransition } from 'react';
import { Settings, Clipboard, RefreshCw, Type, Palette, Move, Sliders, Sparkles, Upload, Trash2, Image, HelpCircle } from 'lucide-react';
import { OverlaySettings, Direction, BgMode } from '../types';

interface SettingsPanelProps {
  settings: OverlaySettings;
  onSettingsChange: (settings: OverlaySettings) => void;
}

const TEXT_PRESETS = [
  {
    label: 'ব্রেকিং নিউজ (News Ticker)',
    direction: 'horizontal' as Direction,
    text: '🚨 ব্রেকিং নিউজ: আমাদের নতুন আল্ট্রা-স্মুথ মোবাইল ওভারলে মেকারে আপনাকে স্বাগতম! যেকোনো নিউজ বা তথ্যচিত্র ভিডিওর জন্য দ্রুত এবং হাই-ডেফিনিশন কোয়ালিটি স্ক্রলিং ওভারলে তৈরি করুন সম্পূর্ণ ফ্রিতে।',
  },
  {
    label: 'স্পোর্টস আপডেট (Sports Update)',
    direction: 'horizontal' as Direction,
    text: '⚽ লাইভ স্কোর আপডেট: ফাইনালে অসাধারণ পারফরম্যান্সের মাধ্যমে বাংলাদেশ ৪ - ৩ গোলে বিজয়ী হয়েছে! ম্যান অফ দ্য ম্যাচ নির্বাচিত হয়েছেন অধিনায়ক তামিম ইকবাল।',
  },
  {
    label: 'ভিডিও ক্রেডিট (End Credits)',
    direction: 'vertical' as Direction,
    text: `🎬 শেষ দৃশ্য (CREDITS)\n\nপরিচালনা ও সম্পাদনা: তানভীর রহমান\nচিত্রগ্রহণ ও দৃশ্যসজ্জা: আবির হাসান\nপ্রধান চরিত্র: সাকিব আল হাসান\nসহযোগী প্রযোজক: রিয়াদ চৌধুরী\n\nবিশেষ ধন্যবাদ: ওভারলে স্টুডিও সমর্থকবৃন্দ`,
  },
  {
    label: 'সাবস্ক্রাইব এলার্ট (Alert)',
    direction: 'horizontal' as Direction,
    text: '🔔 নতুন আপডেট ও আকর্ষণীয় ট্রাভেল ভ্লগ নিয়মিত দেখতে আমাদের ইউটিউব চ্যানেলটি সাবস্ক্রাইব করে রাখুন!',
  }
];

const FONT_OPTIONS = [
  { value: '"Noto Sans Bengali", sans-serif', label: 'Noto Sans Bengali (আধুনিক)' },
  { value: '"Hind Siliguri", sans-serif', label: 'Hind Siliguri (স্টাইলিশ)' },
  { value: 'Arial, sans-serif', label: 'Sans-Serif (Standard)' },
  { value: 'Georgia, serif', label: 'Serif (Classic)' },
  { value: '"JetBrains Mono", monospace', label: 'JetBrains Mono (Tech)' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
  const updateField = <K extends keyof OverlaySettings>(key: K, value: OverlaySettings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        updateField('text', text);
      }
    } catch {
      alert('সরাসরি টেক্সট বক্সে টাইপ বা পেস্ট করুন।');
    }
  };

  const applyPreset = (preset: typeof TEXT_PRESETS[0]) => {
    onSettingsChange({
      ...settings,
      text: preset.text,
      direction: preset.direction
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-2xl relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Panel Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <Settings className="w-5 h-5 text-emerald-400" />
        <h2 className="text-base font-bold text-slate-200 tracking-wide font-bengali">ওভারলে প্যারামিটার এবং সেটিংস</h2>
      </div>

      {/* Preset Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 font-bengali">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          টেম্পলেট বা ডেমো ডাটা ব্যবহার করুন:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TEXT_PRESETS.map((preset, index) => (
            <button
              key={index}
              type="button"
              id={`preset-btn-${index}`}
              onClick={() => applyPreset(preset)}
              className="text-left text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-emerald-500/30 transition duration-150 truncate font-bengali"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area Input */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 font-bengali">
            <Type className="w-3.5 h-3.5 text-emerald-400" />
            ওভারলে টেক্সট (নিউজ বা ক্রেডিট):
          </label>
          <button
            type="button"
            id="paste-btn"
            onClick={handlePaste}
            className="text-xs bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-emerald-400 px-2 py-1 rounded-md transition duration-150 flex items-center gap-1"
          >
            <Clipboard className="w-3 h-3" />
            পেস্ট করুন
          </button>
        </div>
        <textarea
          id="overlay-text-input"
          value={settings.text}
          onChange={(e) => updateField('text', e.target.value)}
          className="w-full bg-slate-950 p-3 rounded-xl text-slate-100 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none text-sm font-bengali leading-relaxed resize-none h-28"
          placeholder="এখানে আপনার টেক্সট লিখুন..."
        />
      </div>

      {/* Font Styling Options */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-bengali">ফন্ট সাইজ (px):</label>
          <input
            type="number"
            id="font-size-input"
            value={settings.fontSize}
            onChange={(e) => updateField('fontSize', Math.max(12, parseInt(e.target.value) || 20))}
            min="12"
            max="300"
            className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800 focus:border-emerald-500 focus:outline-none text-slate-100 text-sm font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-bengali">লেখার রঙ:</label>
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 h-[42px]">
            <input
              type="color"
              id="text-color-input"
              value={settings.textColor}
              onChange={(e) => updateField('textColor', e.target.value)}
              className="w-8 h-6 bg-transparent cursor-pointer rounded border border-slate-800"
            />
            <span className="text-xs font-mono text-slate-300 uppercase">{settings.textColor}</span>
          </div>
        </div>
      </div>

      {/* speed and Animation Direction */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-bengali">গতি / স্পিড (১-২০):</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="speed-input"
              value={settings.speed}
              onChange={(e) => updateField('speed', Math.min(30, Math.max(1, parseFloat(e.target.value) || 1)))}
              min="1"
              max="30"
              step="0.5"
              className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800 focus:border-emerald-500 focus:outline-none text-slate-100 text-sm font-mono"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-bengali">অ্যানিমেশন দিক:</label>
          <select
            id="direction-select"
            value={settings.direction}
            onChange={(e) => updateField('direction', e.target.value as Direction)}
            className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800 focus:border-emerald-500 focus:outline-none text-slate-100 text-xs font-bengali h-[42px]"
          >
            <option value="horizontal">ডান থেকে বামে (News)</option>
            <option value="vertical">নিচ থেকে উপরে (Credits)</option>
          </select>
        </div>
      </div>

      {/* Background Mode and Font Family */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-bengali">ব্যাকগ্রাউন্ড মোড:</label>
          <select
            id="bg-mode-select"
            value={settings.bgMode}
            onChange={(e) => updateField('bgMode', e.target.value as BgMode)}
            className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800 focus:border-emerald-500 focus:outline-none text-slate-100 text-xs font-bengali h-[42px]"
          >
            <option value="transparent">Transparent (স্বচ্ছ)</option>
            <option value="green">Green Screen (সবুজ পর্দা)</option>
            <option value="custom">Custom PNG/JPG (কাস্টম ইমেজ)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-bengali">ফন্ট স্টাইল:</label>
          <select
            id="font-family-select"
            value={settings.fontFamily}
            onChange={(e) => updateField('fontFamily', e.target.value)}
            className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800 focus:border-emerald-500 focus:outline-none text-slate-100 text-xs font-bengali h-[42px]"
          >
            {FONT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Image Upload Panel (Visible always or conditionally) */}
      {(settings.bgMode === 'custom' || settings.bgImage) && (
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-bengali">
              <Image className="w-3.5 h-3.5 text-emerald-400" />
              ব্যাকগ্রাউন্ড পিএনজি (PNG) বা ইমেজ:
            </label>
            {settings.bgImage && (
              <button
                type="button"
                id="remove-bg-btn"
                onClick={() => {
                  onSettingsChange({
                    ...settings,
                    bgImage: null,
                    bgMode: 'transparent',
                  });
                }}
                className="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded transition flex items-center gap-1 font-bengali"
              >
                <Trash2 className="w-3 h-3" />
                রিমুভ করুন
              </button>
            )}
          </div>

          {settings.bgImage ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 aspect-[16/5] flex items-center justify-center">
              <img
                src={settings.bgImage}
                alt="Background preview"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                <span className="text-[10px] bg-slate-950/80 text-emerald-400 font-mono px-2 py-1 rounded border border-slate-800">
                  PNG BACKGROUND LOADED
                </span>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-800 hover:border-emerald-500/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-950/50 hover:bg-slate-950 text-slate-400 hover:text-slate-300 group">
              <Upload className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition" />
              <div className="text-center">
                <span className="text-xs font-semibold block font-bengali text-slate-300 group-hover:text-emerald-400">
                  PNG ব্যাকগ্রাউন্ড সিলেক্ট করুন
                </span>
                <span className="text-[10px] text-slate-500 font-bengali block mt-0.5">
                  নিউজ স্ট্রিপ, লোগো বা কাস্টম ব্যাকগ্রাউন্ড (16:9 রেশিও সাজেস্টেড)
                </span>
              </div>
              <input
                type="file"
                id="bg-image-upload"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      onSettingsChange({
                        ...settings,
                        bgImage: event.target?.result as string,
                        bgMode: 'custom'
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Notice/Tip Section */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5 text-[11px] text-slate-400 font-bengali leading-relaxed">
        <div className="font-semibold text-emerald-400 flex items-center gap-1">
          <Move className="w-3 h-3" />
          টিপস ও ভিডিও ওভারলে গাইড:
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-300">
          <li>নিউজ স্ক্রল তৈরি করতে <b>ডান থেকে বামে</b> সিলেক্ট করুন।</li>
          <li>ভিডিও শেষ হওয়ার ক্রেডিট স্ক্রল করতে <b>নিচ থেকে উপরে</b> সিলেক্ট করুন।</li>
          <li><b>শতভাগ স্বচ্ছ ওভারলে করার সঠিক উপায়:</b> স্ট্যান্ডার্ড MP4 ভিডিও সরাসরি স্বচ্ছ আলফা চ্যানেল সাপোর্ট করে না। তাই আপনার ব্যাকগ্রাউন্ড পিএনজি লোড করার পর ব্যাকগ্রাউন্ড মোড <b>Green Screen (সবুজ পর্দা)</b> সিলেক্ট করুন। তাহলে আপনার পিএনজি এবং টেক্সটের পেছনে সবুজ পর্দা থাকবে, যা যেকোনো এডিটিং সফটওয়্যারে (যেমন CapCut, Kinemaster, Premiere Pro) <b>Chroma Key</b> বা <b>Color Key</b> দিয়ে ১ সেকেন্ডে দূর করে যেকোনো ভিডিওর ওপর বসাতে পারবেন!</li>
        </ul>
      </div>
    </div>
  );
};
