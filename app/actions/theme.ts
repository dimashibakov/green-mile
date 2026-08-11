'use server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function setTheme(theme: 'dark' | 'light') {
  if (theme !== 'dark' && theme !== 'light') return;
  cookies().set('gm-theme', theme, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('profiles').update({ theme }).eq('id', user.id);
  }
}
