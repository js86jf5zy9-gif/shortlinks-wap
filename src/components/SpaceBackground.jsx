import { useRef } from 'react';
import useParallax from '../hooks/useParallax';
import { STAR_LAYERS, starTile } from '../lib/starfield';
import Moon from './Moon';
import earth from '../assets/earth.webp';
import './SpaceBackground.css';

const STARS = STAR_LAYERS.map((layer) => ({ ...layer, image: starTile(layer) }));

// Layers, back to front: nebula glow, three star fields, moon, Earth.
// Farther layers move less as you scroll, which creates the depth.
export default function SpaceBackground() {
  const ref = useRef(null);
  useParallax(ref);

  return (
    <div className="space" ref={ref} aria-hidden="true" data-testid="space-background">
      <div className="space__layer space__nebula" data-parallax-rate="0.03" />
      {STARS.map(({ name, rate, size, image }) => (
        <div
          key={name}
          className={`space__layer space__stars space__stars--${name}`}
          data-parallax-rate={rate}
          data-parallax-tile={size}
          style={{ backgroundImage: image, backgroundSize: `${size}px ${size}px`, bottom: -size }}
        />
      ))}
      <div className="space__moon" data-parallax-rate="0.38">
        <Moon />
      </div>
      <div
        className="space__earth"
        data-parallax-rate="0.55"
        data-parallax-max-vh="55"
        style={{ backgroundImage: `url(${earth})` }}
      />
    </div>
  );
}
