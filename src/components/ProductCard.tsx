import { useState } from 'react';
import type { Product } from '../types';
import { Icon } from './Icon';
import { PhotoSlot } from './PhotoSlot';
import { rub, variantPrice } from '../utils/format';

interface ProductCardProps {
  product: Product;
  qtyInCart: (size?: string) => number;
  onOpen: () => void;
  onAdd: (size?: string) => void;
  onInc: (size?: string) => void;
  onDec: (size?: string) => void;
}

export function ProductCard({ product, qtyInCart, onOpen, onAdd, onInc, onDec }: ProductCardProps) {
  const hasVariants = product.variants.length > 0;
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const currentQty = qtyInCart(selectedSize);
  const canAdd = !hasVariants || selectedSize !== undefined;
  const displayPrice = variantPrice(product, selectedSize);

  const handleSizePick = (e: React.MouseEvent, name: string) => {
    stop(e);
    setSelectedSize((prev) => (prev === name ? undefined : name));
  };

  return (
    <article className="card" onClick={onOpen} role="button" tabIndex={0}>
      <PhotoSlot product={product} size="card" />
      <div className="card__body">
        <div className="card__head">
          <h3 className="card__name">{product.name}</h3>
        </div>
        {product.description && <p className="card__desc">{product.description}</p>}

        {hasVariants && (
          <div className="card__sizes" onClick={stop}>
            {product.variants.map((v) => (
              <button
                key={v.name}
                className={`size-chip ${selectedSize === v.name ? 'is-active' : ''}`}
                onClick={(e) => handleSizePick(e, v.name)}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        <div className="card__foot">
          <span className="card__price">{rub(displayPrice)}</span>
          {currentQty > 0 && canAdd ? (
            <div className="qty" onClick={stop}>
              <button className="qty__btn" onClick={() => onDec(selectedSize)} aria-label="Убрать одну">
                <Icon name="minus" size={18} />
              </button>
              <span className="qty__n">{currentQty}</span>
              <button className="qty__btn" onClick={() => onInc(selectedSize)} aria-label="Добавить одну">
                <Icon name="plus" size={18} />
              </button>
            </div>
          ) : (
            <button
              className={`add ${!canAdd ? 'add--disabled' : ''}`}
              disabled={!canAdd}
              onClick={(e) => { stop(e); if (canAdd) onAdd(selectedSize); }}
              title={hasVariants && !selectedSize ? 'Выберите вариант' : undefined}
            >
              <Icon name="plus" size={18} />
              <span>{hasVariants && !selectedSize ? 'Выберите' : 'В корзину'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
