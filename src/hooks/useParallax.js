import { useEffect } from 'react';

// Moves every [data-parallax-rate] child of `ref` up by scrollY * rate.
//   data-parallax-tile: wrap the offset at this many px (seamless tiled layers)
//   data-parallax-max-vh: stop moving after this many viewport heights
// Writes transforms directly (no React state) and at most once per frame.
export default function useParallax(ref, win = window) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const reduceMotion = win.matchMedia?.('(prefers-reduced-motion: reduce)');
    const layers = [...root.querySelectorAll('[data-parallax-rate]')].map((el) => ({
      el,
      rate: Number(el.dataset.parallaxRate),
      tile: Number(el.dataset.parallaxTile) || 0,
      maxVh: Number(el.dataset.parallaxMaxVh) || 0,
    }));
    let frame = 0;

    const apply = () => {
      frame = 0;
      const scrollY = reduceMotion?.matches ? 0 : Math.max(0, win.scrollY);
      for (const { el, rate, tile, maxVh } of layers) {
        let offset = scrollY * rate;
        if (maxVh) offset = Math.min(offset, (win.innerHeight * maxVh) / 100);
        if (tile) offset %= tile;
        el.style.transform = `translate3d(0, ${-offset.toFixed(1)}px, 0)`;
      }
    };
    const schedule = () => {
      if (!frame) frame = win.requestAnimationFrame(apply);
    };

    apply();
    win.addEventListener('scroll', schedule, { passive: true });
    win.addEventListener('resize', schedule);
    reduceMotion?.addEventListener?.('change', schedule);
    return () => {
      if (frame) win.cancelAnimationFrame(frame);
      win.removeEventListener('scroll', schedule);
      win.removeEventListener('resize', schedule);
      reduceMotion?.removeEventListener?.('change', schedule);
    };
  }, [ref, win]);
}
