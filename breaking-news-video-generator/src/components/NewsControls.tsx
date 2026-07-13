import React, { useState } from 'react';
import { Sliders, Type, Palette, Video, Info } from 'lucide-react';
import { NewsTemplate, BackgroundType, VideoResolution, RESOLUTIONS } from '../types';

interface NewsControlsProps {
  template: NewsTemplate;
  setTemplate: React.Dispatch<React.SetStateAction<NewsTemplate>>;
  backgroundType: BackgroundType;
  setBackgroundType: (bg: BackgroundType) => void;
  resolution: VideoResolution;
  setResolution: (res: VideoResolution) => void;
}

export default function NewsControls({
  template,
  setTemplate,
  backgroundType,
  setBackgroundType,
  resolution,
  setResolution,
}: NewsControlsProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'overlay'>('content');

  // Input change handler
  const handleInputChange = (field: keyof NewsTemplate, value: any) => {
    setTemplate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div id="news-editor-controls" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-zinc-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-red-500" />
          ব্রেকিং নিউজ এডিটর প্যানেল
        </h3>
      </div>

      {/* Controller Tabs */}
      <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-850 mb-4 text-xs">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition font-medium ${
            activeTab === 'content'
              ? 'bg-amber-500 text-zinc-950'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          টেক্সট ও কন্টেন্ট
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition font-medium ${
            activeTab === 'style'
              ? 'bg-amber-500 text-zinc-950'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          স্টাইল ও কালার
        </button>
        <button
          onClick={() => setActiveTab('overlay')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition font-medium ${
            activeTab === 'overlay'
              ? 'bg-amber-500 text-zinc-950'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          ব্যাজ ও রেজুলেশন
        </button>
      </div>

      {/* TAB CONTENT: Content & Texts */}
      <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] pr-1">
        {activeTab === 'content' && (
          <div className="space-y-3">
            {/* Headline */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-medium">প্রধান খবর / শিরোনাম (Headline)</label>
              <textarea
                value={template.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                maxLength={120}
                rows={2}
                placeholder="ব্রেকিং নিউজ শিরোনাম এখানে লিখুন..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-600 resize-none"
              />
              <div className="text-right text-[10px] text-zinc-500 mt-0.5">
                {template.headline.length}/120 ক্যারেক্টার
              </div>
            </div>

            {/* Ticker scrolling text */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-medium">নিচের চলমান টিকার টেক্সট (Scrolling Ticker)</label>
              <textarea
                value={template.tickerText}
                onChange={(e) => handleInputChange('tickerText', e.target.value)}
                rows={3}
                placeholder="চলমান খবর এখানে লিখুন..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-600 resize-none leading-relaxed"
              />
              <p className="text-[10px] text-zinc-500 mt-0.5">
                * টিকার টেক্সটের শেষে একটি '★' বা '•' সাইন দিলে লুপ হওয়ার সময় দেখতে সুন্দর লাগে।
              </p>
            </div>

            {/* Reporter details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">প্রতিবেদক (Reporter)</label>
                <input
                  type="text"
                  value={template.subHeadline}
                  onChange={(e) => handleInputChange('subHeadline', e.target.value)}
                  placeholder="যেমন: নিজস্ব প্রতিবেদক"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-600"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">স্থান (Location)</label>
                <input
                  type="text"
                  value={template.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="যেমন: ঢাকা"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-600"
                />
              </div>
            </div>

            {/* News Channel Name */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-medium">চ্যানেলের নাম (Channel Name)</label>
              <input
                type="text"
                value={template.channelName}
                onChange={(e) => handleInputChange('channelName', e.target.value)}
                placeholder="যেমন: সময় নিউজ"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-600"
              />
            </div>
          </div>
        )}

        {/* TAB CONTENT: Style & Colors */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Visual Design Style */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5 font-medium">ডিজাইন স্টাইল (Layout Style)</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'classic', label: 'Classic News (ঐতিহ্যবাহী)' },
                  { id: 'modern', label: 'Modern Float (ভাসমান)' },
                  { id: 'cyber', label: 'Cyber Neon (ডিজিটাল)' },
                  { id: 'minimal', label: 'Minimalist (মার্জিত)' },
                ].map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => handleInputChange('layoutStyle', layout.id)}
                    className={`p-2.5 rounded-lg border transition text-left ${
                      template.layoutStyle === layout.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-semibold'
                        : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-850 text-zinc-300'
                    }`}
                  >
                    {layout.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hex Color Palette configuration */}
            <div className="space-y-2.5">
              <span className="text-xs text-zinc-400 block font-medium">রঙের প্যালেট (Color Palette)</span>
              
              <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                {/* Primary color */}
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-zinc-300">প্রধান রঙ</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{template.primaryColor}</span>
                  </div>
                  <input
                    type="color"
                    value={template.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                  />
                </div>

                {/* Secondary color */}
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-zinc-300">সহকারী রঙ</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{template.secondaryColor}</span>
                  </div>
                  <input
                    type="color"
                    value={template.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                  />
                </div>

                {/* Accent/Charcoal color */}
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-zinc-300">অ্যাকসেন্ট রঙ</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{template.accentColor}</span>
                  </div>
                  <input
                    type="color"
                    value={template.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                  />
                </div>

                {/* Headline Text color */}
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-zinc-300">শিরোনাম টেক্সট</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{template.textColor}</span>
                  </div>
                  <input
                    type="color"
                    value={template.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                  />
                </div>

                {/* Ticker Text color */}
                <div className="flex items-center gap-2 justify-between col-span-2 border-t border-zinc-850 pt-2.5 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-zinc-300">চলমান টিকার টেক্সটের রঙ</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{template.tickerTextColor}</span>
                  </div>
                  <input
                    type="color"
                    value={template.tickerTextColor}
                    onChange={(e) => handleInputChange('tickerTextColor', e.target.value)}
                    className="w-12 h-7 rounded border border-zinc-800 bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Ticker Speed slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-zinc-400 block font-medium">টিকার গতি (Ticker Speed)</label>
                <span className="text-[11px] font-mono text-amber-500 font-semibold">{template.tickerSpeed}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={template.tickerSpeed}
                onChange={(e) => handleInputChange('tickerSpeed', Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-zinc-950 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB CONTENT: Badges & Output settings */}
        {activeTab === 'overlay' && (
          <div className="space-y-4">
            {/* Background selection */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5 font-medium">আউটপুট ব্যাকগ্রাউন্ড (Export Background)</label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'transparent', label: 'স্বচ্ছ (Transparent WebM)', desc: 'কোনো ব্যাকগ্রাউন্ড থাকবে না, নিখুঁত ওভারলে পাবেন।' },
                  { id: 'greenscreen', label: 'গ্রিন স্ক্রিন (Chroma Green)', desc: 'CapCut বা মোবাইলে ক্রোমা কি দিয়ে ব্যাকগ্রাউন্ড মুছুন।' },
                  { id: 'bluescreen', label: 'ব্লু স্ক্রিন (Chroma Blue)', desc: 'সবুজ জামাকাপড় থাকলে বিকল্প হিসেবে ব্লু ব্যবহার করুন।' },
                  { id: 'preview_dark', label: 'প্রিভিউ ডার্ক (Slate Background)', desc: 'শুধু মাত্র এডিটিং করার সুবিধার্থে (ডাউনলোড করা যাবে না)।' }
                ].map((bg) => (
                  <label
                    key={bg.id}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition ${
                      backgroundType === bg.id
                        ? 'border-amber-500 bg-amber-500/5 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-850 text-zinc-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="backgroundType"
                      checked={backgroundType === bg.id}
                      onChange={() => setBackgroundType(bg.id as any)}
                      className="mt-1 accent-amber-500 shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-[11px]">{bg.label}</span>
                      <span className="text-[9.5px] text-zinc-500 mt-0.5 leading-tight">{bg.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Resolution selection */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5 font-medium">রেজুলেশন (Video Aspect Ratio)</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                {Object.entries(RESOLUTIONS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* UI Toggles */}
            <div className="space-y-2 bg-zinc-950 p-3 rounded-lg border border-zinc-850">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold block mb-1.5">
                অতিরিক্ত গ্যাজেটস (Overlay Toggles)
              </span>

              {/* Show Live Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">লাইভ ব্যাজ (Live Badge)</span>
                <input
                  type="checkbox"
                  checked={template.showLiveBadge}
                  onChange={(e) => handleInputChange('showLiveBadge', e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500"
                />
              </div>

              {template.showLiveBadge && (
                <div className="pl-4 mt-1 border-l border-zinc-800">
                  <label className="text-[10px] text-zinc-500 block mb-1">ব্যাজের টেক্সট (যেমন: লাইভ, LIVE, ALERT)</label>
                  <input
                    type="text"
                    value={template.liveBadgeText}
                    onChange={(e) => handleInputChange('liveBadgeText', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-100 focus:outline-none"
                  />
                </div>
              )}

              {/* Show Clock */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-850">
                <span className="text-xs text-zinc-300">ঘড়ি দেখান (Clock Badge)</span>
                <input
                  type="checkbox"
                  checked={template.showClock}
                  onChange={(e) => handleInputChange('showClock', e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500"
                />
              </div>

              {/* Show Location */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-850">
                <span className="text-xs text-zinc-300">রিপোর্টার ও স্থান বার (Location Bar)</span>
                <input
                  type="checkbox"
                  checked={template.showLocation}
                  onChange={(e) => handleInputChange('showLocation', e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-850 flex gap-2 text-[10px] text-zinc-500 leading-relaxed">
        <Info className="w-4.5 h-4.5 text-zinc-600 shrink-0 mt-0.5" />
        <span>যেকোনো পরিবর্তন সাথে সাথেই বামপাশের ক্যানভাস স্ক্রিনে রেন্ডার হয়ে যাবে। সেটিং চূড়ান্ত করার পর এক্সপোর্ট করুন।</span>
      </div>
    </div>
  );
}
