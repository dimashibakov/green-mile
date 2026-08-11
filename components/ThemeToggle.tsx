'use client';
import { useEffect, useState } from 'react';
import { setTheme as persistTheme } from '@/app/actions/theme';

type Theme = 'dark' | 'light';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme((document.documentElement.getAttribute('data-theme') as Theme) || 'dark');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    void persistTheme(next);
  }

  return (
    <button
      type="button"
      className="mini"
      onClick={toggle}
      aria-label={`switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title="toggle theme"
    >
      {theme === 'dark' ? '☀ light' : '☾ dark'}
    </button>
  );
}
