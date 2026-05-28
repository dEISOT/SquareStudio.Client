import { useState } from 'react';
import type { Product } from '../types';

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

function toneForProduct(product: Product): [string, string] {
  return TONES[(product.categoryId - 1) % TONES.length];
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
  product: Product;
  size?: 'card' | 'pdp' | 'line';
}

export function PhotoSlot({ product, size = 'card' }: PhotoSlotProps) {
  const { imageUrl, videoUrl } = product;

  if (videoUrl && size === 'pdp') {
    return <PdpVideo videoUrl={videoUrl} imageUrl={imageUrl} />;
  }

  if (imageUrl) {
    return (
      <div
        className={`photo photo--${size}`}
        style={{ backgroundImage: `url("${imageUrl}")` }}
      >
        {videoUrl && size === 'card' && (
          <div className="photo__play" aria-hidden="true">▶</div>
        )}
      </div>
    );
  }

  const [a, b] = toneForProduct(product);

  return (
    <div
      className={`photo photo--${size} photo--placeholder`}
      style={{ background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)` }}
    >
      <div className="photo__stripes" aria-hidden="true" />
      <div className="photo__mono">{initials(product.name)}</div>
      {videoUrl && size === 'card' && (
        <div className="photo__play" aria-hidden="true">▶</div>
      )}
    </div>
  );
}
