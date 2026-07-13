import React, { useState, useEffect } from 'react';
import { FolderOpen, Save, Trash2, Sparkles, Check, Plus } from 'lucide-react';
import { NewsTemplate } from '../types';
import { NEWS_PRESETS } from '../presets';

interface TemplateManagerProps {
  currentConfig: Omit<NewsTemplate, 'id' | 'createdAt' | 'name'>;
  onLoadTemplate: (template: NewsTemplate) => void;
}

export default function TemplateManager({ currentConfig, onLoadTemplate }: TemplateManagerProps) {
  const [savedTemplates, setSavedTemplates] = useState<NewsTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [activeId, setActiveId] = useState<string>('somoy_style');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Load custom templates from localStorage on mount
  useEffect(() => {
    const loadSaved = () => {
      try {
        const data = localStorage.getItem('breaking_news_custom_templates');
        if (data) {
          setSavedTemplates(JSON.parse(data));
        }
      } catch (e) {
        console.error('Failed to load templates from localStorage:', e);
      }
    };
    loadSaved();
  }, []);

  // Save current template to local storage
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const id = 'custom_' + Date.now();
    const newTemplate: NewsTemplate = {
      ...currentConfig,
      id,
      name: newTemplateName.trim(),
      createdAt: Date.now(),
    };

    const updated = [newTemplate, ...savedTemplates];
    setSavedTemplates(updated);
    localStorage.setItem('breaking_news_custom_templates', JSON.stringify(updated));
    setNewTemplateName('');
    setActiveId(id);
    setShowSaveModal(false);
    onLoadTemplate(newTemplate);
  };

  // Delete a custom template
  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('breaking_news_custom_templates', JSON.stringify(updated));
    if (activeId === id) {
      setActiveId('somoy_style');
      onLoadTemplate(NEWS_PRESETS[0]);
    }
  };

  const handleSelectTemplate = (template: NewsTemplate) => {
    setActiveId(template.id);
    onLoadTemplate(template);
  };

  return (
    <div id="template-manager-card" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-zinc-100 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-amber-500" />
          টেমপ্লেট ম্যানেজার (Templates)
        </h3>
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-lg transition"
          id="btn-save-current"
        >
          <Save className="w-3.5 h-3.5" />
          ডিজাইন সেভ করুন
        </button>
      </div>

      {/* Save Template Modal Overlay */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h4 className="text-lg font-bold text-zinc-100 mb-2 flex items-center gap-2">
              <Save className="w-5 h-5 text-amber-500" />
              কাস্টম ডিজাইন সেভ করুন
            </h4>
            <p className="text-xs text-zinc-400 mb-4">
              আপনার তৈরি করা কাস্টম কালার কম্বিনেশন, টিকার টেক্সট ও চ্যানেলের নাম পরবর্তীতে ব্যবহার করার জন্য লোকাল স্টোরেজে সেভ করে রাখুন।
            </p>
            <form onSubmit={handleSaveTemplate}>
              <input
                type="text"
                required
                placeholder="ডিজাইনের নাম লিখুন (উদা: আমার লাল-সবুজ থিম)"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 mb-4"
              />
              <div className="flex justify-end gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preset Library Section */}
      <div className="mb-4">
        <span className="text-xs text-zinc-400 uppercase tracking-wider block mb-2 font-mono">
          স্ট্যান্ডার্ড প্রিসেট (Standard Presets)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {NEWS_PRESETS.map((preset) => {
            const isActive = activeId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectTemplate(preset)}
                className={`flex items-center justify-between p-3 rounded-lg text-left transition border ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                    : 'bg-zinc-950 hover:bg-zinc-850 border-zinc-850 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <span className="text-xs font-medium truncate max-w-[130px]">{preset.name}</span>
                </div>
                {isActive && <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Library Section */}
      <div>
        <span className="text-xs text-zinc-400 uppercase tracking-wider block mb-2 font-mono">
          আপনার সংরক্ষিত ডিজাইনসমূহ ({savedTemplates.length})
        </span>
        {savedTemplates.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-lg p-5 text-center text-zinc-500 text-xs">
            <Sparkles className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
            কোনো কাস্টম টেমপ্লেট পাওয়া যায়নি। উপরের বাটনে ক্লিক করে বর্তমান ডিজাইনটি সেভ করতে পারেন।
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {savedTemplates.map((template) => {
              const isActive = activeId === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition border text-xs ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-zinc-950 hover:bg-zinc-850 border-zinc-850 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: template.primaryColor }}
                    />
                    <span className="font-medium truncate">{template.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isActive && <Check className="w-3.5 h-3.5 text-amber-500" />}
                    <button
                      onClick={(e) => handleDeleteTemplate(template.id, e)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
