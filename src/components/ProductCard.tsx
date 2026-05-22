import { useState } from 'react';
import type { Product } from '../types';
import { Icon } from './Icon';
import { PhotoSlot } from './PhotoSlot';
import { rub } from '../utils/format';

interface ProductCardProps {
  product: Product;
  /** Returns qty in cart for the given size (or undefined for no-size products) */
  qtyInCart: (size?: string) => number;
  onOpen: () => void;
  onAdd: (size?: string) => void;
  onInc: (size?: string) => void;
  onDec: (size?: string) => void;
}

export function ProductCard({ product, qtyInCart, onOpen, onAdd, onInc, onDec }: ProductCardProps) {
  const hasSizes = product.availableSizes.length > 0;
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    hasSizes ? undefined : undefined
  );

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const currentQty = qtyInCart(selectedSize);
  const canAdd = !hasSizes || selectedSize !== undefined;

  const handleSizePick = (e: React.MouseEvent, size: string) => {
    stop(e);
    setSelectedSize((prev) => (prev === size ? undefined : size));
  };

  return (
    <article className="card" onClick={onOpen} role="button" tabIndex={0}>
      <PhotoSlot product={product} size="card" />
      <div className="card__body">
        <div className="card__head">
          <h3 className="card__name">{product.name}</h3>
        </div>
        <p className="card__desc">{product.description}</p>

        {hasSizes && (
          <div className="card__sizes" onClick={stop}>
            {product.availableSizes.map((s) => (
              <button
                key={s}
                className={`size-chip ${selectedSize === s ? 'is-active' : ''}`}
                onClick={(e) => handleSizePick(e, s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="card__foot">
          <span className="card__price">{rub(product.price)}</span>
          {currentQty > 0 && canAdd ? (
            <div className="qty" onClick={stop}>
              <button
                className="qty__btn"
                onClick={() => onDec(selectedSize)}
                aria-label="Убрать одну"
              >
                <Icon name="minus" size={18} />
              </button>
              <span className="qty__n">{currentQty}</span>
              <button
                className="qty__btn"
                onClick={() => onInc(selectedSize)}
                aria-label="Добавить одну"
              >
                <Icon name="plus" size={18} />
              </button>
            </div>
          ) : (
            <button
              className={`add ${!canAdd ? 'add--disabled' : ''}`}
              disabled={!canAdd}
              onClick={(e) => {
                stop(e);
                if (canAdd) onAdd(selectedSize);
              }}
              title={hasSizes && !selectedSize ? 'Выберите размер' : undefined}
            >
              <Icon name="plus" size={18} />
              <span>{hasSizes && !selectedSize ? 'Выберите' : 'В корзину'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
