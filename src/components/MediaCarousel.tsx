import { useRef, useState } from 'react';
import type { GalleryMediaItem } from '../types';

interface MediaCarouselProps {
  items: GalleryMediaItem[];
  name: string;
}

function CarouselVideo({ videoUrl }: { videoUrl: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="photo photo--pdp carousel__slide-media" style={{ background: '#000' }}>
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

export function MediaCarousel({ items, name }: MediaCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div className="carousel">
      <div className="carousel__track" ref={trackRef} onScroll={handleScroll}>
        {items.map((item) => (
          <div className="carousel__slide" key={item.id}>
            {item.type === 'Video' ? (
              <CarouselVideo videoUrl={item.url} />
            ) : (
              <div className="photo photo--pdp carousel__slide-media">
                <img src={item.url} alt={name} className="photo__img" loading="eager" decoding="async" />
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="carousel__dots" role="tablist" aria-label="Фото и видео">
          {items.map((item, i) => (
            <span key={item.id} className={`carousel__dot${i === active ? ' is-active' : ''}`} role="tab" aria-selected={i === active} />
          ))}
        </div>
      )}
    </div>
  );
}
