import type { Service } from '../types';
import { PhotoSlot } from './PhotoSlot';
import { rub } from '../utils/format';

interface ServiceCardProps {
  service: Service;
  onOpen: () => void;
  onAdd?: () => void;
}

export function ServiceCard({ service, onOpen, onAdd }: ServiceCardProps) {
  return (
    <article className="card card--service" onClick={onOpen} role="button" tabIndex={0}>
      <PhotoSlot item={service} size="card" />
      <div className="card__body">
        <div className="card__head">
          <h3 className="card__name">{service.name}</h3>
        </div>
        {service.description && <p className="card__desc">{service.description}</p>}
        <div className="card__bottom">
          <div className="card__foot">
            <span className="card__price">{rub(service.cost)}</span>
            {onAdd ? (
              <button
                className="btn btn--primary btn--sm"
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
              >
                Добавить
              </button>
            ) : (
              <span className="service-badge">Услуга</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
