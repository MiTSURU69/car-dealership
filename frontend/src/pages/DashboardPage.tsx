import { useAuth } from '../auth/AuthContext';
import { Brand } from '../components/Brand';

export function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="flex items-center justify-between">
        <Brand />
        <button className="btn btn-ghost btn-sm" onClick={logout}>Log out</button>
      </div>
      <h1 className="mt-10 font-display text-5xl font-extrabold italic">Hello, {user?.name}.</h1>
    </div>
  );
}