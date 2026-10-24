import type { CSSProperties } from 'react';

/** Delay slot for the .reveal animation. Capped so long lists don't wait forever. */
export const stagger = (index: number): CSSProperties =>
  ({ '--i': Math.min(index, 12) }) as CSSProperties;