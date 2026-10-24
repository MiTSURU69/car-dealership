import type { ReactNode } from 'react';
import { stagger } from '../lib/stagger';
import { Brand } from './Brand';

interface Props {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

/** Split screen used by the login and register pages: editorial hero on the left, form on the right. */
export function AuthLayout({ title, subtitle, footer, children }: Props) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      <section className="relative hidden overflow-hidden border-r border-line p-14 lg:flex lg:flex-col lg:justify-between">
        <div className="rings" aria-hidden />
        <div className="reveal" style={stagger(0)}>
          <Brand />
        </div>
        <div className="relative">
          <p
            className="reveal font-mono text-xs uppercase tracking-[0.35em] text-brass"
            style={stagger(1)}
          >
            For people who read the spec sheet
          </p>
          <h1
            className="reveal mt-5 font-display text-7xl font-extrabold italic leading-[0.95]"
            style={stagger(2)}
          >
            Every great drive starts <span className="text-signal">in stock.</span>
          </h1>
          <p className="reveal mt-6 max-w-md text-lg text-mist" style={stagger(3)}>
            Browse the floor, filter by make or budget, and take a car home before someone else does.
          </p>
        </div>
        <div className="lane reveal" style={stagger(4)} />
      </section>

      <section className="flex items-center justify-center p-6 sm:p-12">
        <div
          className="reveal w-full max-w-md rounded-2xl border border-line bg-panel/70 p-8 backdrop-blur"
          style={stagger(2)}
        >
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <h2 className="font-display text-4xl font-bold">{title}</h2>
          <p className="mt-2 text-mist">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-sm text-mist">{footer}</p>
        </div>
      </section>
    </main>
  );
}