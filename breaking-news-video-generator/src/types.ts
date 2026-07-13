export interface NewsTemplate {
  id: string;
  name: string;
  channelName: string;
  headline: string;
  subHeadline: string;
  tickerText: string;
  location: string;
  themePreset: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  tickerTextColor: string;
  showLiveBadge: boolean;
  liveBadgeText: string;
  showClock: boolean;
  showLocation: boolean;
  logoIcon: string; // lucide icon name
  tickerSpeed: number; // pixels per frame or speed multiplier
  layoutStyle: 'modern' | 'classic' | 'cyber' | 'minimal';
  createdAt: number;
}

export interface SavedVideo {
  id: string;
  name: string;
  createdAt: number;
  url: string;
  duration: number;
  size: number;
}

export type BackgroundType = 'transparent' | 'greenscreen' | 'bluescreen' | 'preview_dark';
export type VideoResolution = '1080p' | '720p' | 'vertical_shorts';

export interface ResolutionConfig {
  width: number;
  height: number;
  label: string;
}

export const RESOLUTIONS: Record<VideoResolution, ResolutionConfig> = {
  '1080p': { width: 1920, height: 1080, label: 'Full HD (1920x1080) - Horizontal' },
  '720p': { width: 1280, height: 720, label: 'HD (1280x720) - Horizontal' },
  'vertical_shorts': { width: 1080, height: 1920, label: 'Shorts/Reels (1080x1920) - Vertical' },
};
