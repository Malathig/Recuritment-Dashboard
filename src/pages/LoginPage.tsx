import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const { signIn, signUp, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isSignUp) {
        if (!name.trim()) { setError('Name is required'); setSubmitting(false); return; }
        await signUp(email, password, name);
        toast.success('Account created! You can now log in.');
        setIsSignUp(false);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
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
            <label className="text-xs font-semibold text-muted-foreground uppercase">Password</label>
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
            {submitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Login →'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-primary font-semibold hover:underline"
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
