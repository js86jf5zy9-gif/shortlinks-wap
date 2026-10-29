import { useRef } from 'react';
import { render } from '@testing-library/react';
import useParallax from './useParallax';

function Layers() {
  const ref = useRef(null);
  useParallax(ref);
  return (
    <div ref={ref}>
      <div data-testid="slow" data-parallax-rate="0.1" />
      <div data-testid="tiled" data-parallax-rate="0.5" data-parallax-tile="100" />
      <div data-testid="capped" data-parallax-rate="1" data-parallax-max-vh="50" />
    </div>
  );
}

const scrollTo = (y) => {
  window.scrollY = y;
  window.dispatchEvent(new Event('scroll'));
};

describe('useParallax', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      // Run synchronously; return 0 because the frame has already finished.
      cb(0);
      return 0;
    });
    window.innerHeight = 800;
  });

  it('moves each layer by its rate as the page scrolls', () => {
    const { getByTestId } = render(<Layers />);
    scrollTo(300);
    expect(getByTestId('slow').style.transform).toBe('translate3d(0, -30px, 0)');
    // 150px wraps at the 100px tile size.
    expect(getByTestId('tiled').style.transform).toBe('translate3d(0, -50px, 0)');
    scrollTo(1000);
    // Capped at 50vh = 400px.
    expect(getByTestId('capped').style.transform).toBe('translate3d(0, -400px, 0)');
  });

  it('keeps layers still when the user prefers reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true, addEventListener() {}, removeEventListener() {} });
    const { getByTestId } = render(<Layers />);
    scrollTo(500);
    expect(getByTestId('slow').style.transform).toBe('translate3d(0, 0px, 0)');
  });
});
