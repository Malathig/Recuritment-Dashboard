import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type View = 'login' | 'signup' | 'forgot' | 'forgot_sent';

export default function LoginPage() {
  const { signIn, signUp, loading } = useAuth();
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = (v: View) => { setView(v); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (view === 'signup') {
        if (!name.trim()) { setError('Name is required'); setSubmitting(false); return; }
        await signUp(email, password, name);
        toast.success('Account created! You can now log in.');
        reset('login');
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      setView('forgot_sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--login-gradient)' }}>
        <div className="text-primary-foreground text-lg font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--login-gradient)' }}>
      <div className="bg-card rounded-2xl p-9 w-[400px] shadow-elevated animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-foreground">SIMATS Vacancy Tracker</h2>
          <p className="text-xs text-muted-foreground mt-1">Recruitment Management Portal</p>
        </div>

        {/* Forgot Password — Sent */}
        {view === 'forgot_sent' && (
          <div className="text-center space-y-4">
            <div className="text-4xl">📧</div>
            <p className="text-sm font-semibold text-foreground">Reset link sent!</p>
            <p className="text-xs text-muted-foreground">
              Check your inbox at <b>{email}</b> and click the link to reset your password.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2.5 text-[11px] text-blue-800 text-left space-y-1">
              <p>• Didn't receive it? Check your <b>spam / junk folder</b>.</p>
              <p>• The link expires in <b>1 hour</b> — request a new one if needed.</p>
              <p>• Still stuck? Contact your <b>HR administrator</b>.</p>
            </div>
            <button
              onClick={() => reset('forgot')}
              className="w-full border border-primary text-primary rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/5 transition"
            >
              Resend Reset Link
            </button>
            <button
              onClick={() => reset('login')}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-bold hover:opacity-90 transition"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Forgot Password — Form */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-muted-foreground text-center">
              Enter your registered email and we'll send you a password reset link.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5 text-[11px] text-amber-800 space-y-1">
              <p>• Check your <b>spam / junk folder</b> if the email doesn't arrive within 2 minutes.</p>
              <p>• Use the email your <b>HR admin registered</b> for your account.</p>
              <p>• If you don't know your email, contact your <b>HR administrator</b> directly.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2.5 text-sm bg-card text-foreground outline-none focus:border-primary"
                placeholder="you@simats.edu"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-destructive text-xs text-center">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              <button type="button" onClick={() => reset('login')} className="text-primary font-semibold hover:underline">
                Back to Login
              </button>
            </p>
          </form>
        )}

        {/* Login / Sign Up */}
        {(view === 'login' || view === 'signup') && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2.5 text-sm bg-card text-foreground outline-none focus:border-primary"
                    placeholder="e.g. Dr. Rajesh Kumar"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2.5 text-sm bg-card text-foreground outline-none focus:border-primary"
                  placeholder="you@simats.edu"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Password</label>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => reset('forgot')}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2.5 text-sm bg-card text-foreground outline-none focus:border-primary"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="text-destructive text-xs text-center">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? 'Please wait...' : view === 'signup' ? 'Create Account' : 'Login →'}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              {view === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => reset(view === 'signup' ? 'login' : 'signup')}
                className="text-primary font-semibold hover:underline"
              >
                {view === 'signup' ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
