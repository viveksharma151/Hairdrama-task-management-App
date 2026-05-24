'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { syncUser } from '@/lib/api';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuthCallback() {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error('Auth error or no session', error);
        router.push('/?error=auth_failed');
        return;
      }

      // Sync user profile to our backend
      const user = session.user;
      try {
        await syncUser({
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
        });
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (err) {
        console.error('Failed to sync user', err);
        router.push('/?error=sync_failed');
      }
    }

    handleAuthCallback();
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ 
          width: '40px', height: '40px', 
          border: '4px solid var(--border-light)', 
          borderTopColor: 'var(--primary)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Authenticating...</p>
      </div>
      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}
