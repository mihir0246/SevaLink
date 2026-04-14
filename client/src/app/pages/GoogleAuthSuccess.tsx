import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveAuth } from '../services/api';

/**
 * This page is the landing target after Google OAuth.
 * Backend redirects here with ?token=...&user=...&redirect=...
 * We save to localStorage and forward to the correct dashboard.
 */
export default function GoogleAuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const userRaw = params.get('user');
    const redirect = params.get('redirect') || '/volunteer/dashboard';

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        saveAuth(token, user);
        navigate(redirect, { replace: true });
      } catch {
        navigate('/login?error=google_failed', { replace: true });
      }
    } else {
      navigate('/login?error=google_failed', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Signing you in with Google...</p>
      </div>
    </div>
  );
}
