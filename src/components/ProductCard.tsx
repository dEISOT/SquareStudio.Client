import { memo, useState } from 'react';
import type { Product } from '../types';
import { Icon } from './Icon';
import { PhotoSlot } from './PhotoSlot';
import { rub, variantPrice } from '../utils/format';

interface ProductCardProps {
  product: Product;
  qtyInCart: (size?: string) => number;
  onOpen: (id: number) => void;
  onAdd: (id: number, size?: string) => void;
  onInc: (id: number, size?: string) => void;
  onDec: (id: number, size?: string) => void;
}

function ProductCardImpl({ product, qtyInCart, onOpen, onAdd, onInc, onDec }: ProductCardProps) {
  const hasVariants = product.variants.length > 0;
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const isStorable = product.categoryType === 'Storable';
  const hasAnyStock = !isStorable || !hasVariants ||
    product.variants.some(v => (v.stockQuantity ?? 0) > 0);
  const selectedVariant = selectedSize ? product.variants.find(v => v.name === selectedSize) : null;
  const showPreorder = isStorable && hasVariants && (
    !hasAnyStock || (selectedSize !== undefined && (selectedVariant?.stockQuantity ?? 0) === 0)
  );

  const currentQty = qtyInCart(selectedSize);
  const canAdd = !showPreorder && (!hasVariants || selectedSize !== undefined);
  const displayPrice = variantPrice(product, selectedSize);
  const showFrom = !selectedSize && product.variants.some(v => v.price != null && v.price !== product.price);

  const handleSizePick = (e: React.MouseEvent, name: string) => {
    stop(e);
    setSelectedSize((prev) => (prev === name ? undefined : name));
  };

  return (
    <article className="card" onClick={() => onOpen(product.id)} role="button" tabIndex={0}>
      <PhotoSlot item={product} size="card" />
      <div className="card__body">
        <div className="card__head">
          <h3 className="card__name">{product.name}</h3>
        </div>
        {product.description && <p className="card__desc">{product.description}</p>}

        <div className="card__bottom">
          {hasVariants && (
            <div className="card__sizes" onClick={stop}>
              {product.variants.map((v) => (
                <button
                  key={v.name}
                  className={[
                    'size-chip',
                    selectedSize === v.name ? 'is-active' : '',
                    isStorable && (v.stockQuantity ?? 0) === 0 ? 'is-out-of-stock' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={(e) => handleSizePick(e, v.name)}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}

          <div className="card__foot">
            <span className="card__price">{showFrom && <span className="card__price-from">От </span>}{rub(displayPrice)}</span>
            {showPreorder ? (
              <button className="add add--preorder" onClick={stop}>
                <Icon name="time" size={18} />
                <span>Предзаказ</span>
              </button>
            ) : currentQty > 0 && canAdd ? (
              <div className="qty" onClick={stop}>
                <button className="qty__btn" onClick={() => onDec(product.id, selectedSize)} aria-label="Убрать одну">
                  <Icon name="minus" size={18} />
                </button>
                <span className="qty__n">{currentQty}</span>
                <button className="qty__btn" onClick={() => onInc(product.id, selectedSize)} aria-label="Добавить одну">
                  <Icon name="plus" size={18} />
                </button>
              </div>
            ) : (
              <button
                className="add"
                onClick={(e) => { stop(e); if (canAdd) onAdd(product.id, selectedSize); else onOpen(product.id); }}
              >
                <Icon name="plus" size={18} />
                <span>{hasVariants && !selectedSize ? 'Выберите' : 'В корзину'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// `qtyInCart` is necessarily a fresh closure every parent render (it reads live
// cart state), so a plain shallow-prop comparison would make this memo a no-op
// whenever *any* item's cart quantity changes. Instead, compare its actual
// output across every size this product can be added in — that's what this
// card's rendering actually depends on — so an unrelated product's cart change
// doesn't force this one to re-render too.
function areEqual(prev: ProductCardProps, next: ProductCardProps): boolean {
  if (prev.product !== next.product) return false;
  if (prev.onOpen !== next.onOpen || prev.onAdd !== next.onAdd || prev.onInc !== next.onInc || prev.onDec !== next.onDec) return false;
  if (prev.qtyInCart === next.qtyInCart) return true;
  const sizes: (string | undefined)[] = next.product.variants.length > 0
    ? next.product.variants.map((v) => v.name)
    : [undefined];
  return sizes.every((s) => prev.qtyInCart(s) === next.qtyInCart(s));
}

export const ProductCard = memo(ProductCardImpl, areEqual);
