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

interface PhotoSlotProps {
  product: Product;
  size?: 'card' | 'pdp' | 'line';
}

export function PhotoSlot({ product, size = 'card' }: PhotoSlotProps) {
  if (product.imageUrl) {
    return (
      <div
        className={`photo photo--${size}`}
        style={{ backgroundImage: `url("${product.imageUrl}")` }}
      />
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
    </div>
  );
}
