'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import { getMe } from '@/lib/api';

import './Navbar.css';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const profile = await getMe();
          setUser(profile);
        } catch (e) {
          console.error("Failed to fetch user profile", e);
        }
      }
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        loadUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user && pathname === '/') return null; // Don't show nav on landing page

  return (
    <header className="navbar glass-panel">
      <div className="container nav-container">
        <Link href={user ? "/dashboard" : "/"} className="logo">
          <span className="logo-icon">HD</span>
          <span className="logo-text">Hairdrama Tasks</span>
        </Link>

        {user && (
          <nav className="nav-links">
            <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
            <Link href="/tasks" className={`nav-link ${pathname === '/tasks' ? 'active' : ''}`}>All Tasks</Link>
          </nav>
        )}

        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <Link href="/tasks/new" className="btn-primary btn-sm">
                + New Task
              </Link>
              <div className="avatar">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} />
                ) : (
                  <span>{user.email.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button onClick={handleLogout} className="btn-secondary btn-sm">Logout</button>
            </div>
          ) : (
            <Link href="/" className="btn-primary">Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
}
