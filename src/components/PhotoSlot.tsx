import { useState } from 'react';

export interface MediaItem {
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  name: string;
  categoryId?: number | null;
}

const TONES: [string, string][] = [
  ['#e9e3d6', '#cdc3ad'],
  ['#dfe2ea', '#b9c0d0'],
  ['#e7dccb', '#c9b896'],
  ['#d8d2c4', '#aea58d'],
  ['#e1d8c7', '#b9ac8e'],
  ['#dbe0e0', '#aab2b2'],
  ['#e8dccb', '#c2a982'],
  ['#d4d8e1', '#9ea7bb'],
];

function toneForItem(item: MediaItem): [string, string] {
  const idx = item.categoryId != null ? (item.categoryId - 1) : 0;
  return TONES[Math.abs(idx) % TONES.length];
}

function initials(name: string): string {
  return name
    .replace(/[«»]/g, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function PdpVideo({ videoUrl, imageUrl }: { videoUrl: string; imageUrl?: string | null }) {
  const [playing, setPlaying] = useState(false);
  const bgStyle = imageUrl
    ? { backgroundImage: `url("${imageUrl}")` }
    : { background: '#000' };

  return (
    <div className="photo photo--pdp" style={bgStyle}>
      <video
        className="photo__video"
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        onPlaying={() => setPlaying(true)}
        style={{ opacity: playing ? 1 : 0, transition: 'opacity 0.25s' }}
      />
    </div>
  );
}

interface PhotoSlotProps {
  item: MediaItem;
  size?: 'card' | 'pdp' | 'line';
}

export function PhotoSlot({ item, size = 'card' }: PhotoSlotProps) {
  const { imageUrl, thumbnailUrl, videoUrl } = item;

  if (videoUrl && size === 'pdp') {
    return <PdpVideo videoUrl={videoUrl} imageUrl={imageUrl} />;
  }

  // Lists and cards use the lightweight cropped thumbnail when available;
  // the full-size original is only loaded on the product page (pdp).
  const displayUrl = size === 'pdp' ? imageUrl : (thumbnailUrl ?? imageUrl);

  if (displayUrl) {
    const bgPosition = 'center';

    return (
      <div
        className={`photo photo--${size}`}
        style={{ backgroundImage: `url("${displayUrl}")`, backgroundPosition: bgPosition }}
      >
        {videoUrl && size === 'card' && (
          <div className="photo__play" aria-hidden="true">▶</div>
        )}
      </div>
    );
  }

  const [a, b] = toneForItem(item);

  return (
    <div
      className={`photo photo--${size} photo--placeholder`}
      style={{ background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)` }}
    >
      <div className="photo__stripes" aria-hidden="true" />
      <div className="photo__mono">{initials(item.name)}</div>
      {videoUrl && size === 'card' && (
        <div className="photo__play" aria-hidden="true">▶</div>
      )}
    </div>
  );
}
