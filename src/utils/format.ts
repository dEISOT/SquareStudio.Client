import type { Product } from '../types';

export function rub(n: number): string {
  return n.toLocaleString('ru-RU') + ' Br';
}

export function variantPrice(product: Product, size?: string): number {
  if (!size) return product.price;
  const v = product.variants.find((v) => v.name === size);
  return v?.price ?? product.price;
}
