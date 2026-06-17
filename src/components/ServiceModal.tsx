import type { Service } from '../types';
import { Modal } from './Modal';
import { PhotoSlot } from './PhotoSlot';
import { Icon } from './Icon';
import { rub } from '../utils/format';

interface ServiceModalProps {
  service: Service | null;
  onClose: () => void;
  onAdd?: () => void;
}

export function ServiceModal({ service, onClose, onAdd }: ServiceModalProps) {
  if (!service) return null;

  return (
    <Modal open onClose={onClose} size="lg" label={service.name}>
      <div className="pdp__close-anchor">
        <button className="pdp__close" onClick={onClose} aria-label="Закрыть">
          <Icon name="close" size={22} />
        </button>
      </div>
      <div className="pdp">
        <PhotoSlot item={service} size="pdp" />
        <div className="pdp__body">
          <div className="pdp__scroll">
            <div className="pdp__cat">{service.categoryName}</div>
            <h2 className="pdp__name">{service.name}</h2>
            {service.description && <p className="pdp__subtitle">{service.description}</p>}
            {service.longDescription && (
              <div
                className="pdp__long-desc"
                dangerouslySetInnerHTML={{ __html: service.longDescription }}
              />
            )}
          </div>
          <div className="pdp__foot">
            <div className="pdp__price">{rub(service.cost)}</div>
            <div className="pdp__cta">
              {onAdd && (
                <button className="btn btn--primary btn--lg" onClick={() => { onAdd(); onClose(); }}>
                  Добавить в заказ
                </button>
              )}
              <button className="btn btn--ghost btn--lg" onClick={onClose}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
