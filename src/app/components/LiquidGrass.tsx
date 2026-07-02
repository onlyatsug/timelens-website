interface LiquidGrassProps {
  variant?: 'auth' | 'top-right' | 'top-left' | 'bottom-left' | 'dual';
  opacity?: number;
  scale?: number;
  color?: string;
  color2?: string;
}

export function LiquidGrass({
  variant = 'top-right',
  opacity = 1,
  scale = 1,
  color = '#F4A6E8',
  color2 = '#F4A870',
}: LiquidGrassProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 0,
    opacity,
    transform: `scale(${scale})`,
  };

  if (variant === 'auth') {
    return (
      <>
        <svg width="340" height="260" viewBox="0 0 340 260"
          style={{ ...style, top: -30, right: -40, transformOrigin: 'top right' }} fill="none">
          <path d="M340 0 C300 20, 260 10, 220 50 C180 90, 200 140, 160 170 C120 200, 60 190, 20 220 C0 235, -10 250, 0 260"
            stroke={color} strokeWidth="28" strokeLinecap="round" />
          <path d="M340 40 C295 55, 255 45, 210 85 C165 125, 185 175, 140 200 C100 225, 50 210, 10 240"
            stroke={color} strokeWidth="12" strokeLinecap="round" opacity="0.4" />
          <path d="M300 0 C270 30, 240 25, 200 65 C160 105, 178 155, 135 188 C92 220, 38 215, 0 245"
            stroke={color2} strokeWidth="8" strokeLinecap="round" opacity="0.35" />
        </svg>
        <svg width="260" height="220" viewBox="0 0 260 220"
          style={{ ...style, bottom: -20, left: -30, transformOrigin: 'bottom left' }} fill="none">
          <path d="M0 220 C30 190, 20 150, 60 120 C100 90, 150 105, 180 70 C210 35, 220 10, 260 0"
            stroke={color} strokeWidth="22" strokeLinecap="round" opacity="0.6" />
          <path d="M0 190 C35 165, 25 125, 70 95 C115 65, 165 80, 195 45 C225 10, 235 -5, 260 -15"
            stroke={color2} strokeWidth="10" strokeLinecap="round" opacity="0.3" />
        </svg>
      </>
    );
  }

  if (variant === 'top-right') {
    return (
      <svg width="280" height="200" viewBox="0 0 280 200"
        style={{ ...style, top: 0, right: 0, transformOrigin: 'top right' }} fill="none">
        <path d="M280 0 C240 15, 205 8, 170 42 C135 76, 155 118, 115 145 C75 172, 25 162, -10 190"
          stroke={color} strokeWidth="26" strokeLinecap="round" />
        <path d="M280 30 C238 42, 200 36, 162 70 C124 104, 142 148, 100 172 C58 196, 8 186, -20 210"
          stroke={color} strokeWidth="11" strokeLinecap="round" opacity="0.4" />
        <path d="M248 0 C215 22, 180 18, 145 52 C110 86, 130 130, 88 158 C46 186, -4 175, -32 200"
          stroke={color2} strokeWidth="7" strokeLinecap="round" opacity="0.4" />
      </svg>
    );
  }

  if (variant === 'top-left') {
    return (
      <svg width="260" height="190" viewBox="0 0 260 190"
        style={{ ...style, top: 0, left: 0, transformOrigin: 'top left' }} fill="none">
        <path d="M0 0 C35 20, 65 14, 98 50 C131 86, 112 128, 150 155 C188 182, 235 172, 270 198"
          stroke={color} strokeWidth="24" strokeLinecap="round" />
        <path d="M0 32 C38 48, 68 42, 104 78 C140 114, 120 158, 160 182 C200 206, 248 195, 280 218"
          stroke={color} strokeWidth="10" strokeLinecap="round" opacity="0.38" />
        <path d="M28 0 C62 22, 90 18, 124 54 C158 90, 138 134, 176 160 C214 186, 260 176, 292 200"
          stroke={color2} strokeWidth="6" strokeLinecap="round" opacity="0.35" />
      </svg>
    );
  }

  if (variant === 'bottom-left') {
    return (
      <svg width="240" height="180" viewBox="0 0 240 180"
        style={{ ...style, bottom: 0, left: 0, transformOrigin: 'bottom left' }} fill="none">
        <path d="M0 180 C28 150, 18 112, 56 84 C94 56, 140 70, 168 38 C196 6, 206 -8, 240 -20"
          stroke={color} strokeWidth="22" strokeLinecap="round" opacity="0.7" />
        <path d="M0 155 C32 128, 22 90, 62 62 C102 34, 148 48, 178 16 C208 -16, 218 -28, 252 -38"
          stroke={color2} strokeWidth="9" strokeLinecap="round" opacity="0.3" />
      </svg>
    );
  }

  if (variant === 'dual') {
    return (
      <>
        <svg width="300" height="220" viewBox="0 0 300 220"
          style={{ ...style, top: 0, right: 0, transformOrigin: 'top right' }} fill="none">
          <path d="M300 0 C258 18, 220 10, 182 48 C144 86, 165 132, 122 160 C79 188, 26 178, -12 205"
            stroke={color} strokeWidth="28" strokeLinecap="round" />
          <path d="M300 36 C255 50, 215 44, 175 82 C135 120, 155 168, 110 193 C65 218, 12 207, -25 232"
            stroke={color} strokeWidth="12" strokeLinecap="round" opacity="0.4" />
          <path d="M265 0 C228 25, 192 20, 154 58 C116 96, 136 144, 91 170 C46 196, -8 185, -42 210"
            stroke={color2} strokeWidth="7" strokeLinecap="round" opacity="0.38" />
        </svg>
        <svg width="220" height="180" viewBox="0 0 220 180"
          style={{ ...style, bottom: 0, left: 0, transformOrigin: 'bottom left' }} fill="none">
          <path d="M0 180 C25 152, 16 116, 52 88 C88 60, 132 74, 158 42 C184 10, 194 -6, 224 -18"
            stroke={color} strokeWidth="20" strokeLinecap="round" opacity="0.65" />
          <path d="M0 155 C28 130, 20 94, 58 66 C96 38, 140 52, 168 20 C196 -12, 206 -26, 236 -36"
            stroke={color2} strokeWidth="8" strokeLinecap="round" opacity="0.28" />
        </svg>
      </>
    );
  }

  return null;
}
