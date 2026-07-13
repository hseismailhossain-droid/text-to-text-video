import { NewsTemplate } from '../types';

/**
 * Draw a beautiful breaking news template on the canvas.
 * Handles different resolutions by using relative scaling (S = height / 1080).
 */
export function renderCanvas(
  canvas: HTMLCanvasElement,
  template: NewsTemplate,
  tickerX: number,
  backgroundType: 'transparent' | 'greenscreen' | 'bluescreen' | 'preview_dark',
  options: {
    blinkState: boolean;
    currentTimeString: string;
    sampleMedia?: HTMLImageElement | HTMLVideoElement | null;
    showSampleMedia?: boolean;
    customLogoImage?: HTMLImageElement | null;
  }
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;
  const S = height / 1080; // Relative scaling factor based on Full HD 1080p height

  ctx.save();

  // 1. Draw Background
  if (backgroundType === 'greenscreen') {
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, width, height);
  } else if (backgroundType === 'bluescreen') {
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(0, 0, width, height);
  } else if (backgroundType === 'preview_dark') {
    // Slate dark dashboard background for preview
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle tech grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 60 * S;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Centered alignment help lines (very subtle)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  } else {
    // Transparent: clear the canvas
    ctx.clearRect(0, 0, width, height);
  }

  // 2. Draw Sample Media if provided (useful for overlay previews)
  if (options.sampleMedia && options.showSampleMedia) {
    try {
      // Draw centered object-cover style
      const mediaWidth = options.sampleMedia.width || (options.sampleMedia as any).videoWidth;
      const mediaHeight = options.sampleMedia.height || (options.sampleMedia as any).videoHeight;
      if (mediaWidth && mediaHeight) {
        const hRatio = width / mediaWidth;
        const vRatio = height / mediaHeight;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (width - mediaWidth * ratio) / 2;
        const centerShift_y = (height - mediaHeight * ratio) / 2;
        ctx.drawImage(
          options.sampleMedia,
          0,
          0,
          mediaWidth,
          mediaHeight,
          centerShift_x,
          centerShift_y,
          mediaWidth * ratio,
          mediaHeight * ratio
        );
      } else {
        ctx.drawImage(options.sampleMedia, 0, 0, width, height);
      }
    } catch (e) {
      // Fail-safe
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Determine fonts based on design choices
  const banglaFont = "'Hind Siliguri', 'Inter', sans-serif";
  const banglaFontSerif = "'Tiro Bangla', serif";
  const monoFont = "'JetBrains Mono', monospace";
  const displayFont = "'Space Grotesk', sans-serif";

  // 3. Render Channel Logo Bug (Top Right)
  if (template.channelName) {
    ctx.save();
    const bugPadding = 20 * S;
    const bugX = width - (150 * S) - bugPadding;
    const bugY = 50 * S;
    const bugW = 160 * S;
    const bugH = 60 * S;

    // Glassmorphism channel bug container
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = template.primaryColor;
    ctx.lineWidth = 2 * S;
    
    // Draw modern bug shape
    ctx.beginPath();
    ctx.roundRect(width - bugW - 30 * S, bugY, bugW, bugH, 6 * S);
    ctx.fill();
    ctx.stroke();

    // Red/Accent top indicator bar
    ctx.fillStyle = template.secondaryColor;
    ctx.fillRect(width - bugW - 30 * S, bugY, bugW, 4 * S);

    // Channel Name text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${20 * S}px ${banglaFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(template.channelName, width - 30 * S - (bugW / 2), bugY + (bugH / 2) + 2 * S);

    // Blinking dot next to logo if live
    if (template.showLiveBadge) {
      ctx.fillStyle = options.blinkState ? '#EF4444' : '#7F1D1D';
      ctx.beginPath();
      ctx.arc(width - bugW - 15 * S, bugY + (bugH / 2), 6 * S, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 4. Render Live Badge & Clock (Top Left)
  if (template.showLiveBadge || template.showClock) {
    ctx.save();
    const topLeftX = 40 * S;
    let topLeftY = 50 * S;

    if (template.showLiveBadge) {
      const badgeText = template.liveBadgeText || 'LIVE';
      ctx.font = `bold ${22 * S}px ${displayFont}`;
      const textMetrics = ctx.measureText(badgeText);
      const badgeW = textMetrics.width + 50 * S;
      const badgeH = 45 * S;

      // Draw red LIVE container
      ctx.fillStyle = template.primaryColor;
      ctx.beginPath();
      ctx.roundRect(topLeftX, topLeftY, badgeW, badgeH, 4 * S);
      ctx.fill();

      // Blinking circle
      ctx.fillStyle = options.blinkState ? '#FFFFFF' : 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(topLeftX + 20 * S, topLeftY + (badgeH / 2), 5 * S, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, topLeftX + 35 * S, topLeftY + (badgeH / 2) + 1 * S);

      // Move Clock down or right. Let's place clock right next to the Live badge!
      if (template.showClock) {
        const clockX = topLeftX + badgeW + 15 * S;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1 * S;
        const clockW = 160 * S;
        ctx.beginPath();
        ctx.roundRect(clockX, topLeftY, clockW, badgeH, 4 * S);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${18 * S}px ${monoFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(options.currentTimeString, clockX + (clockW / 2), topLeftY + (badgeH / 2) + 1 * S);
      }
    } else if (template.showClock) {
      // Just clock alone
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      const clockW = 160 * S;
      const badgeH = 45 * S;
      ctx.beginPath();
      ctx.roundRect(topLeftX, topLeftY, clockW, badgeH, 4 * S);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${18 * S}px ${monoFont}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(options.currentTimeString, topLeftX + (clockW / 2), topLeftY + (badgeH / 2) + 1 * S);
    }
    ctx.restore();
  }

  // 5. LOWER THIRD MAIN OVERLAY RENDERER (Classic, Modern, Cyber, Minimal)
  const isVertical = width < height; // Vertical shorts mode

  // Base offsets based on vertical/horizontal layout
  const bottomMargin = isVertical ? 250 * S : 40 * S; // Push up on vertical screens to avoid TikTok overlay controls
  const sideMargin = isVertical ? 25 * S : 40 * S;

  const tickerHeight = isVertical ? 65 * S : 55 * S;
  const headlineHeight = isVertical ? 110 * S : 95 * S;
  const subStrapHeight = 35 * S;

  const tickerY = height - bottomMargin - tickerHeight;
  const headlineY = tickerY - headlineHeight;
  const subStrapY = headlineY - subStrapHeight;

  const mainWidth = width - (sideMargin * 2);

  // LAYOUT STYLES FUNCTION
  if (template.layoutStyle === 'classic') {
    // --- CLASSIC NEWS LAYOUT (SHARP, SOLID, BIG BOLD BADGES) ---
    ctx.save();

    // A. Sub-strap (Reporter Desk)
    if (template.showLocation && template.location) {
      ctx.fillStyle = template.accentColor; // e.g. Charcoal black
      ctx.fillRect(sideMargin + 20 * S, subStrapY, 350 * S, subStrapHeight);

      // Angled cuts for classic feel
      ctx.fillStyle = template.secondaryColor;
      ctx.beginPath();
      ctx.moveTo(sideMargin + 370 * S, subStrapY);
      ctx.lineTo(sideMargin + 390 * S, subStrapY + subStrapHeight);
      ctx.lineTo(sideMargin + 350 * S, subStrapY + subStrapHeight);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${18 * S}px ${banglaFont}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const reporterText = template.subHeadline 
        ? `${template.subHeadline} | ${template.location}`
        : template.location;
      ctx.fillText(reporterText, sideMargin + 35 * S, subStrapY + (subStrapHeight / 2) + 1 * S);
    }

    // B. Headline Bar (Main Box)
    // Red backplate
    ctx.fillStyle = template.primaryColor;
    ctx.fillRect(sideMargin, headlineY, mainWidth, headlineHeight);

    // Left "BREAKING NEWS" label (Angled classic style)
    const labelW = isVertical ? 180 * S : 240 * S;
    ctx.fillStyle = template.secondaryColor;
    ctx.beginPath();
    ctx.moveTo(sideMargin, headlineY);
    ctx.lineTo(sideMargin + labelW, headlineY);
    ctx.lineTo(sideMargin + labelW - 30 * S, headlineY + headlineHeight);
    ctx.lineTo(sideMargin, headlineY + headlineHeight);
    ctx.closePath();
    ctx.fill();

    // Left label Text
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${isVertical ? 22 * S : 28 * S}px ${banglaFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ব্রেকিং নিউজ', sideMargin + (labelW / 2) - 10 * S, headlineY + (headlineHeight / 2) + 2 * S);

    // Headline Text
    ctx.fillStyle = template.textColor;
    const maxTextWidth = mainWidth - labelW - 40 * S;
    const textX = sideMargin + labelW + 15 * S;
    const textY = headlineY + (headlineHeight / 2) + 2 * S;

    // Adjust font size dynamically to prevent overflow
    ctx.font = `bold ${isVertical ? 24 * S : 34 * S}px ${banglaFont}`;
    let currentFontSize = isVertical ? 24 * S : 34 * S;
    while (ctx.measureText(template.headline).width > maxTextWidth && currentFontSize > 14 * S) {
      currentFontSize -= 1 * S;
      ctx.font = `bold ${currentFontSize}px ${banglaFont}`;
    }
    
    ctx.textAlign = 'left';
    ctx.fillText(template.headline, textX, textY);

    // C. Ticker Bar
    // Yellow backplate
    ctx.fillStyle = template.secondaryColor;
    ctx.fillRect(sideMargin, tickerY, mainWidth, tickerHeight);

    // Red ticker prefix
    const tickPrefixW = 120 * S;
    ctx.fillStyle = template.primaryColor;
    ctx.beginPath();
    ctx.moveTo(sideMargin, tickerY);
    ctx.lineTo(sideMargin + tickPrefixW, tickerY);
    ctx.lineTo(sideMargin + tickPrefixW - 15 * S, tickerY + tickerHeight);
    ctx.lineTo(sideMargin, tickerY + tickerHeight);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${16 * S}px ${banglaFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('এইমাত্র', sideMargin + (tickPrefixW / 2) - 5 * S, tickerY + (tickerHeight / 2) + 1 * S);

    // Scrolling Ticker Text
    ctx.save();
    // Clip path to keep text within ticker bounds (behind prefix and main width)
    ctx.beginPath();
    ctx.rect(sideMargin + tickPrefixW, tickerY, mainWidth - tickPrefixW, tickerHeight);
    ctx.clip();

    ctx.fillStyle = template.tickerTextColor;
    ctx.font = `500 ${18 * S}px ${banglaFont}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(template.tickerText, tickerX, tickerY + (tickerHeight / 2) + 1 * S);
    ctx.restore();

    ctx.restore();

  } else if (template.layoutStyle === 'modern') {
    // --- MODERN FLOATING GLASSMORPHISM STYLE (ROUNDED, GRADIENT, TRANSLUCENT) ---
    ctx.save();

    // Floating plate background glow/shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 20 * S;
    ctx.shadowOffsetY = 8 * S;

    // Main Floating Box container (combining headline + ticker smoothly)
    const floatW = mainWidth;
    const floatH = headlineHeight + tickerHeight;
    const floatY = headlineY;

    // Draw glass plate
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // Deep Slate
    ctx.beginPath();
    ctx.roundRect(sideMargin, floatY, floatW, floatH, 12 * S);
    ctx.fill();
    ctx.shadowColor = 'transparent'; // Reset shadow for child drawing

    // Subtle colorful border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1 * S;
    ctx.stroke();

    // Primary gradient highlight strip on top of headline
    const grad = ctx.createLinearGradient(sideMargin, floatY, sideMargin + floatW, floatY);
    grad.addColorStop(0, template.primaryColor);
    grad.addColorStop(0.5, template.secondaryColor);
    grad.addColorStop(1, template.primaryColor);
    ctx.fillStyle = grad;
    ctx.fillRect(sideMargin + 15 * S, floatY, floatW - (30 * S), 3 * S);

    // A. Headline section (Top half of plate)
    // Left circular badge "গুরুত্বপূর্ণ"
    const badgeX = sideMargin + 25 * S;
    const badgeY = floatY + 20 * S;
    const badgeH = 34 * S;
    const badgeText = 'বিশেষ খবর';
    ctx.font = `bold ${16 * S}px ${banglaFont}`;
    const badgeTextW = ctx.measureText(badgeText).width;
    const badgeW = badgeTextW + 30 * S;

    // Draw badge background
    ctx.fillStyle = template.secondaryColor;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 17 * S);
    ctx.fill();

    ctx.fillStyle = template.tickerTextColor; // Black typically
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + (badgeW / 2), badgeY + (badgeH / 2) + 1 * S);

    // Headline Text
    ctx.fillStyle = '#FFFFFF';
    const textX = badgeX + badgeW + 15 * S;
    const textY = floatY + (headlineHeight / 2);
    const maxTextWidth = floatW - badgeW - 80 * S;

    ctx.font = `600 ${isVertical ? 22 * S : 30 * S}px ${banglaFont}`;
    let currentFontSize = isVertical ? 22 * S : 30 * S;
    while (ctx.measureText(template.headline).width > maxTextWidth && currentFontSize > 14 * S) {
      currentFontSize -= 1 * S;
      ctx.font = `600 ${currentFontSize}px ${banglaFont}`;
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(template.headline, textX, textY);

    // B. Sub-strap / Reporter detail (placed tiny inside headline top corner)
    if (template.showLocation && template.location) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = `bold ${13 * S}px ${monoFont}`;
      ctx.textAlign = 'right';
      const locText = template.location.toUpperCase() + (template.subHeadline ? ` / ${template.subHeadline.toUpperCase()}` : '');
      ctx.fillText(locText, sideMargin + floatW - 25 * S, floatY + 20 * S);
    }

    // Separator line between Headline and Ticker
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(sideMargin + 15 * S, floatY + headlineHeight);
    ctx.lineTo(sideMargin + floatW - 15 * S, floatY + headlineHeight);
    ctx.stroke();

    // C. Ticker Section (Bottom half of plate)
    // Dynamic Neon Indicator on left
    const indicatorX = sideMargin + 25 * S;
    const indicatorY = floatY + headlineHeight + (tickerHeight / 2);
    
    ctx.fillStyle = template.primaryColor;
    ctx.beginPath();
    ctx.roundRect(indicatorX, indicatorY - 12 * S, 6 * S, 24 * S, 3 * S);
    ctx.fill();

    // Scrolling Ticker Text
    ctx.save();
    // Clip window for scrolling
    ctx.beginPath();
    ctx.rect(indicatorX + 20 * S, floatY + headlineHeight, floatW - 60 * S, tickerHeight);
    ctx.clip();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `500 ${17 * S}px ${banglaFont}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(template.tickerText, tickerX, floatY + headlineHeight + (tickerHeight / 2) + 1 * S);
    ctx.restore();

    ctx.restore();

  } else if (template.layoutStyle === 'cyber') {
    // --- CYBERPUNK FUTURISTIC NEON STYLE (GLOW, CORNER BRACKETS, TECH SYMBOLS) ---
    ctx.save();

    // Neon drop shadow
    ctx.shadowColor = template.secondaryColor;
    ctx.shadowBlur = 8 * S;

    // A. Main box layout
    // Dark transparent body with cyan outline
    ctx.fillStyle = 'rgba(10, 15, 30, 0.9)'; // Deep tech dark
    ctx.strokeStyle = template.secondaryColor; // Neon green
    ctx.lineWidth = 2 * S;

    // Draw main frame with sharp chamfer corner
    ctx.beginPath();
    const cornerCut = 25 * S;
    ctx.moveTo(sideMargin + cornerCut, headlineY);
    ctx.lineTo(sideMargin + mainWidth, headlineY);
    ctx.lineTo(sideMargin + mainWidth, tickerY + tickerHeight);
    ctx.lineTo(sideMargin, tickerY + tickerHeight);
    ctx.lineTo(sideMargin, headlineY + cornerCut);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0; // Disable shadow for internal elements

    // Accent warning color block on the chamfer
    ctx.fillStyle = template.accentColor; // Cyan
    ctx.beginPath();
    ctx.moveTo(sideMargin, headlineY + cornerCut);
    ctx.lineTo(sideMargin + cornerCut, headlineY);
    ctx.lineTo(sideMargin + cornerCut + 45 * S, headlineY);
    ctx.lineTo(sideMargin, headlineY + cornerCut + 45 * S);
    ctx.closePath();
    ctx.fill();

    // Headline Text
    ctx.fillStyle = template.textColor; // Lime/neon text
    ctx.font = `700 ${isVertical ? 22 * S : 28 * S}px ${monoFont}`;
    const headTextX = sideMargin + 45 * S;
    const headTextY = headlineY + (headlineHeight / 2);
    const maxHeadW = mainWidth - 90 * S;

    let headFontSize = isVertical ? 22 * S : 28 * S;
    ctx.font = `bold ${headFontSize}px ${banglaFont}`;
    while (ctx.measureText(template.headline).width > maxHeadW && headFontSize > 14 * S) {
      headFontSize -= 1 * S;
      ctx.font = `bold ${headFontSize}px ${banglaFont}`;
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(template.headline, headTextX, headTextY);

    // Horizontal cyber separator line
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)'; // Semi transparent cyan
    ctx.lineWidth = 1 * S;
    ctx.beginPath();
    ctx.moveTo(sideMargin + 10 * S, tickerY);
    ctx.lineTo(sideMargin + mainWidth - 10 * S, tickerY);
    ctx.stroke();

    // B. Scrolling Ticker
    ctx.save();
    // Clip ticker window
    ctx.beginPath();
    ctx.rect(sideMargin + 20 * S, tickerY, mainWidth - 40 * S, tickerHeight);
    ctx.clip();

    ctx.fillStyle = template.tickerTextColor;
    ctx.font = `600 ${16 * S}px ${monoFont}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(template.tickerText, tickerX, tickerY + (tickerHeight / 2) + 1 * S);
    ctx.restore();

    // Corner decorative bracket lines (cyber vibe)
    ctx.strokeStyle = template.accentColor;
    ctx.lineWidth = 3 * S;
    // Top right corner bracket
    ctx.beginPath();
    ctx.moveTo(sideMargin + mainWidth - 25 * S, headlineY);
    ctx.lineTo(sideMargin + mainWidth, headlineY);
    ctx.lineTo(sideMargin + mainWidth, headlineY + 25 * S);
    ctx.stroke();

    // Location / Source details
    if (template.showLocation && template.location) {
      ctx.fillStyle = template.accentColor;
      ctx.font = `bold ${12 * S}px ${monoFont}`;
      ctx.textAlign = 'right';
      ctx.fillText(`SYS_LOC: ${template.location.toUpperCase()}`, sideMargin + mainWidth - 15 * S, headlineY - 10 * S);
    }

    ctx.restore();

  } else {
    // --- MINIMALIST CLEAN STYLE (THIN LINES, SOPHISTICATED TYPOGRAPHY, SOFT OPACITY) ---
    ctx.save();

    // Gentle backdrop glass plate
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(sideMargin, headlineY, mainWidth, headlineHeight + tickerHeight, 4 * S);
    ctx.fill();

    // Bottom solid borderline
    ctx.strokeStyle = template.primaryColor;
    ctx.lineWidth = 2 * S;
    ctx.beginPath();
    ctx.moveTo(sideMargin, tickerY + tickerHeight);
    ctx.lineTo(sideMargin + mainWidth, tickerY + tickerHeight);
    ctx.stroke();

    // Thin top borderline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1 * S;
    ctx.beginPath();
    ctx.moveTo(sideMargin, headlineY);
    ctx.lineTo(sideMargin + mainWidth, headlineY);
    ctx.stroke();

    // Headline Text (Elegant Serif or Clean display font)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isVertical ? 24 * S : 32 * S}px ${banglaFontSerif}`;
    const minTextX = sideMargin + 30 * S;
    const minTextY = headlineY + (headlineHeight / 2);
    const maxMinW = mainWidth - 60 * S;

    let minFontSize = isVertical ? 24 * S : 32 * S;
    ctx.font = `bold ${minFontSize}px ${banglaFontSerif}`;
    while (ctx.measureText(template.headline).width > maxMinW && minFontSize > 14 * S) {
      minFontSize -= 1 * S;
      ctx.font = `bold ${minFontSize}px ${banglaFontSerif}`;
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(template.headline, minTextX, minTextY);

    // Separator divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(sideMargin + 30 * S, tickerY);
    ctx.lineTo(sideMargin + mainWidth - 30 * S, tickerY);
    ctx.stroke();

    // Ticker Text
    ctx.save();
    ctx.beginPath();
    ctx.rect(sideMargin + 30 * S, tickerY, mainWidth - 60 * S, tickerHeight);
    ctx.clip();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = `400 ${16 * S}px ${banglaFont}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(template.tickerText, tickerX, tickerY + (tickerHeight / 2) + 1 * S);
    ctx.restore();

    // Subtitle label
    if (template.showLocation && template.location) {
      ctx.fillStyle = template.primaryColor;
      ctx.font = `bold ${12 * S}px ${banglaFont}`;
      ctx.textAlign = 'left';
      ctx.fillText(template.location.toUpperCase(), sideMargin, headlineY - 12 * S);
    }

    ctx.restore();
  }

  ctx.restore();
}
