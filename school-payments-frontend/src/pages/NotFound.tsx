import AppShell from '../components/AppShell';

export default function NotFound() {
  return (
    <AppShell>
      <div className="max-w-lg mx-auto card text-center">
        <div className="text-3xl font-bold mb-2">404</div>
        <div className="text-sm text-gray-600 dark:text-neutral-300">
          The page you’re looking for doesn’t exist.
        </div>
        <a href="/dashboard" className="btn mt-4 inline-block">Go to Dashboard</a>
      </div>
    </AppShell>
  );
}