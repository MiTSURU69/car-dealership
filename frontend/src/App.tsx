import { Brand } from './components/Brand';

export default function App() {
  return (
    <div className="p-10">
      <Brand />
      <h1 className="mt-8 font-display text-6xl font-extrabold italic">
        Find your <span className="text-signal">next</span> machine.
      </h1>
    </div>
  );
}