import { NewsTemplate } from './types';

export const NEWS_PRESETS: NewsTemplate[] = [
  {
    id: 'somoy_style',
    name: 'ঐতিহ্যবাহী লাল-হলুদ (Classic News)',
    channelName: 'সময় সংবাদ',
    headline: 'ব্রেকিং নিউজ: দেশজুড়ে ডিজিটাল কনটেন্ট তৈরির হিড়িক!',
    subHeadline: 'নিজস্ব প্রতিবেদক',
    tickerText: '★ এইমাত্র পাওয়া: লোকাল স্টোরেজ ও ক্যানভাস রেকর্ডিং প্রযুক্তি ব্যবহার করে তৈরি হলো চমৎকার ব্রেকিং নিউজ মেকার ★ যেকোনো ভিডিওর ওপরে খুব সহজেই বসানো যাবে এই স্বচ্ছ ভিডিওটি ★ পছন্দমতো যেকোনো বাংলা টেক্সট লিখে সরাসরি ডাউনলোড করুন ★',
    location: 'ঢাকা',
    themePreset: 'somoy_style',
    primaryColor: '#D32F2F', // Intense red
    secondaryColor: '#FFEB3B', // Golden yellow
    accentColor: '#1A1A1A', // Dark charcoal
    textColor: '#FFFFFF',
    tickerTextColor: '#000000',
    showLiveBadge: true,
    liveBadgeText: 'সরাসরি',
    showClock: true,
    showLocation: true,
    logoIcon: 'Tv',
    tickerSpeed: 3,
    layoutStyle: 'classic',
    createdAt: Date.now(),
  },
  {
    id: 'jamuna_style',
    name: 'গোল্ডেন লাক্সারি (Premium Gold)',
    channelName: 'ডিজিটাল ২৪',
    headline: 'বিশেষ ঘোষণা: আজকের সেরা প্রযুক্তির উদ্ভাবন!',
    subHeadline: 'বিশেষ সংবাদদাতা',
    tickerText: '★ নতুন ফিচার উন্মোচিত: সম্পূর্ণ বিনামূল্যে ওয়াটারমার্ক ছাড়া ব্রেকিং নিউজ ভিডিও তৈরি করুন ★ প্রফেশনাল এডিটিং প্যানেল, কাস্টম কালার স্কিম ও রিয়েলটাইম প্রিভিউ ★ শর্টস ও রিলস এর জন্য রয়েছে চমৎকার পোর্ট্রেট মোড সাপোর্ট ★',
    location: 'চট্টগ্রাম',
    themePreset: 'jamuna_style',
    primaryColor: '#1E293B', // Slate dark
    secondaryColor: '#D97706', // Premium Gold/Amber
    accentColor: '#FFFFFF',
    textColor: '#FFFFFF',
    tickerTextColor: '#FFFFFF',
    showLiveBadge: true,
    liveBadgeText: 'লাইভ',
    showClock: true,
    showLocation: true,
    logoIcon: 'Globe',
    tickerSpeed: 2.5,
    layoutStyle: 'modern',
    createdAt: Date.now(),
  },
  {
    id: 'cyber_crime',
    name: 'সাইবার ক্রাইম (Cyber Neon)',
    channelName: 'CYBER ALERTS',
    headline: 'সতর্কতা: অনলাইনে ছড়াচ্ছে নতুন ধরণের ম্যালওয়্যার!',
    subHeadline: 'তথ্যপ্রযুক্তি ডেস্ক',
    tickerText: '⚠ জরুরি নিরাপত্তা সতর্কবার্তা: অজানা কোনো সোর্স থেকে আসা ফাইল বা লিংকে ক্লিক করা থেকে বিরত থাকুন ⚠ আপনার পাসওয়ার্ডগুলো নিয়মিত পরিবর্তন করুন এবং টু-ফ্যাক্টর অথেনটিকেশন সচল রাখুন ⚠ প্রযুক্তিগত সহায়তার জন্য আমাদের পেজ ফলো করুন ⚠',
    location: 'সাইবার স্পেস',
    themePreset: 'cyber_crime',
    primaryColor: '#0F172A', // Slate-900
    secondaryColor: '#22C55E', // Neon green
    accentColor: '#06B6D4', // Cyan
    textColor: '#39FF14', // Neon lime
    tickerTextColor: '#22C55E',
    showLiveBadge: true,
    liveBadgeText: 'ALERT',
    showClock: true,
    showLocation: true,
    logoIcon: 'ShieldAlert',
    tickerSpeed: 4,
    layoutStyle: 'cyber',
    createdAt: Date.now(),
  },
  {
    id: 'minimal_clean',
    name: 'ক্লিন মিনিমাল (Minimal Light)',
    channelName: 'INFO SHORTS',
    headline: 'সহজ কথায় চমৎকার সব ভিডিও তৈরি করুন চোখের পলকে',
    subHeadline: 'টেক ডায়েরি',
    tickerText: '• আধুনিক ইনফ্লুয়েন্সারদের জন্য স্পেশাল ডিজাইন • কোনো জটিল সফটওয়্যার ছাড়াই মোবাইল বা কম্পিউটারে ডাউনলোড করে ব্যবহারযোগ্য ব্রেকিং নিউজ টিকার প্যানেল • স্টাইলিশ ফন্ট ও মার্জিত কালার কম্বিনেশন •',
    location: 'লাইভ স্টুডিও',
    themePreset: 'minimal_clean',
    primaryColor: '#09090B', // Zinc-950
    secondaryColor: '#E4E4E7', // Zinc-200
    accentColor: '#EC4899', // Pink-500
    textColor: '#FFFFFF',
    tickerTextColor: '#09090B',
    showLiveBadge: true,
    liveBadgeText: 'INFO',
    showClock: false,
    showLocation: true,
    logoIcon: 'Sparkles',
    tickerSpeed: 2,
    layoutStyle: 'minimal',
    createdAt: Date.now(),
  }
];
