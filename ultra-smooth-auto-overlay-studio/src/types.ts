export type Direction = 'horizontal' | 'vertical';
export type BgMode = 'transparent' | 'green' | 'custom';

export interface OverlaySettings {
  text: string;
  fontSize: number;
  textColor: string;
  speed: number;
  direction: Direction;
  bgMode: BgMode;
  fontFamily: string;
  bgImage: string | null; // Data URL of uploaded background image
}

export interface RenderState {
  isRecording: boolean;
  currentFrame: number;
  totalFrames: number;
  progress: number;
  status: string;
  finalBlob: Blob | null;
}
