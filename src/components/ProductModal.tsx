import { useState } from 'react';
import type { Product } from '../types';
import { Modal } from './Modal';
import { PhotoSlot } from './PhotoSlot';
import { Icon } from './Icon';
import { rub, variantPrice } from '../utils/format';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  qtyInCart: (size?: string) => number;
  onAdd: (size?: string) => void;
}

export function ProductModal({ product, onClose, qtyInCart, onAdd }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

  if (!product) return null;

  const hasSizes = product.variants.length > 0;
  const canAdd   = !hasSizes || selectedSize !== undefined;
  const displayPrice = variantPrice(product, selectedSize);
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
          {product.description && <p className="pdp__subtitle">{product.description}</p>}
          {product.longDescription && (
            <div
              className="pdp__long-desc"
              dangerouslySetInnerHTML={{ __html: product.longDescription }}
            />
          )}

          {hasSizes && (
            <div className="pdp__sizes-section">
              <div className="pdp__sizes-label">Вариант</div>
              <div className="pdp__sizes">
                {product.variants.map((v) => (
                  <button
                    key={v.name}
                    className={`size-chip size-chip--lg ${selectedSize === v.name ? 'is-active' : ''}`}
                    onClick={() => setSelectedSize((prev) => (prev === v.name ? undefined : v.name))}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
              <div className="pdp__sizes-hint" style={{ visibility: selectedSize ? 'hidden' : 'visible' }}>
                Выберите размер, чтобы добавить в корзину
              </div>
            </div>
          )}

          <div className="pdp__price">{rub(displayPrice)}</div>

          <div className="pdp__cta">
            <button
              className="btn btn--primary btn--lg"
              disabled={!canAdd}
              onClick={handleAdd}
              style={{ minWidth: 200 }}
            >
              <Icon name="plus" size={20} />
              <span style={{ whiteSpace: 'nowrap' }}>
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
