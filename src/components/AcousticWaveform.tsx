import React, { useMemo } from 'react';

interface AcousticWaveformProps {
  barCount?: number;
  isActive?: boolean;
  frequencyData?: number[];
  height?: number;
  variant?: 'compact' | 'standard' | 'large';
  className?: string;
  isPlayback?: boolean;
}

export const AcousticWaveform: React.FC<AcousticWaveformProps> = ({
  barCount = 32,
  isActive = false,
  frequencyData,
  height = 44,
  variant = 'standard',
  className = '',
  isPlayback = false,
}) => {
  // Generate spectral bar heights
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      // Color interpolation across the horizontal spectrum: Cobalt -> Cyan -> Emerald
      const progress = i / (barCount - 1);
      let color = '#2563EB'; // Cobalt
      let glowColor = 'rgba(37, 99, 235, 0.4)';

      if (progress < 0.5) {
        // Blend Cobalt (#2563EB) to Cyan (#38BDF8)
        color = '#38BDF8';
        glowColor = 'rgba(56, 189, 248, 0.5)';
      } else {
        // Blend Cyan (#38BDF8) to Emerald (#34D399)
        color = '#34D399';
        glowColor = 'rgba(52, 211, 153, 0.5)';
      }

      if (isPlayback) {
        // During playback / TTS, cyan-primary highlight
        color = '#7bd0ff';
        glowColor = 'rgba(123, 208, 255, 0.45)';
      }

      let barHeight = 4; // Rest state: 4px
      if (isActive) {
        if (frequencyData && frequencyData.length > 0) {
          const dataIdx = Math.floor((i / barCount) * frequencyData.length);
          const rawVal = frequencyData[dataIdx] || 0;
          barHeight = Math.max(4, Math.round((rawVal / 255) * height));
        } else {
          // Synthetic ambient acoustic waveform oscillation
          const wave1 = Math.sin(i * 0.4 + Date.now() * 0.005);
          const wave2 = Math.cos(i * 0.7 - Date.now() * 0.003);
          const normalized = Math.abs(wave1 * 0.6 + wave2 * 0.4);
          barHeight = Math.max(5, Math.round(normalized * (height - 8) + 6));
        }
      }

      return {
        id: i,
        height: barHeight,
        color,
        glowColor,
      };
    });
  }, [barCount, isActive, frequencyData, height, isPlayback]);

  const barWidth = variant === 'compact' ? 'w-[2px]' : variant === 'large' ? 'w-[4px]' : 'w-[3px]';
  const gap = variant === 'compact' ? 'gap-[2px]' : 'gap-[3px]';

  return (
    <div
      className={`flex items-center justify-center ${gap} select-none ${className}`}
      style={{ height: `${height}px` }}
      aria-label="Acoustic Spectral Waveform"
    >
      {bars.map((bar) => {
        return (
          <div
            key={bar.id}
            className={`${barWidth} rounded-[0.125rem] transition-all duration-75`}
            style={{
              height: `${bar.height}px`,
              backgroundColor: isActive ? bar.color : '#334155',
              boxShadow: isActive ? `0 0 8px ${bar.glowColor}` : 'none',
              opacity: isActive ? 1 : 0.45,
            }}
          />
        );
      })}
    </div>
  );
};
