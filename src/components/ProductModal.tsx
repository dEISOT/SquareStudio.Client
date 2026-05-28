import { useState } from 'react';
import type { Product } from '../types';
import { Modal } from './Modal';
import { PhotoSlot } from './PhotoSlot';
import { Icon } from './Icon';
import { rub } from '../utils/format';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  qtyInCart: (size?: string) => number;
  onAdd: (size?: string) => void;
}

export function ProductModal({ product, onClose, qtyInCart, onAdd }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

  if (!product) return null;

  const hasSizes = product.availableSizes.length > 0;
  const canAdd   = !hasSizes || selectedSize !== undefined;
  const currentQty = qtyInCart(selectedSize);

  const handleClose = () => {
    setSelectedSize(undefined);
    onClose();
  };

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd(selectedSize);
    handleClose();
  };

  return (
    <Modal open onClose={handleClose} size="lg" label={product.name}>
      <div className="pdp">
        <PhotoSlot product={product} size="pdp" />
        <div className="pdp__body">
          <div className="pdp__cat">{product.categoryName}</div>
          <h2 className="pdp__name">{product.name}</h2>
          {product.description && <p className="pdp__desc">{product.description}</p>}

          {hasSizes && (
            <div className="pdp__sizes-section">
              <div className="pdp__sizes-label">Размер</div>
              <div className="pdp__sizes">
                {product.availableSizes.map((s) => (
                  <button
                    key={s}
                    className={`size-chip size-chip--lg ${selectedSize === s ? 'is-active' : ''}`}
                    onClick={() => setSelectedSize((prev) => (prev === s ? undefined : s))}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <div className="pdp__sizes-hint">Выберите размер, чтобы добавить в корзину</div>
              )}
            </div>
          )}

          <div className="pdp__price">{rub(product.price)}</div>

          <div className="pdp__cta">
            <button
              className="btn btn--primary btn--lg"
              disabled={!canAdd}
              onClick={handleAdd}
            >
              <Icon name="plus" size={20} />
              <span>
                {hasSizes && !selectedSize
                  ? 'Выберите размер'
                  : currentQty > 0
                  ? `Добавить ещё (${currentQty} в корзине)`
                  : 'Добавить в корзину'}
              </span>
            </button>
            <button className="btn btn--ghost btn--lg" onClick={handleClose}>
              Закрыть
            </button>
          </div>
        </div>

        <button className="pdp__close" onClick={handleClose} aria-label="Закрыть">
          <Icon name="close" size={22} />
        </button>
      </div>
    </Modal>
  );
}
