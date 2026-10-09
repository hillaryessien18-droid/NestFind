import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestPasswordReset } from '@/api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch {
      toast.error('Could not submit your request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
      {sent ? (
        <p className="mt-4 text-gray-600">If an account exists for that email, we have sent a password reset link. Check your inbox.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <p className="text-sm text-gray-600">Enter your account email and we will send a reset link.</p>
          <label className="block text-sm font-medium text-gray-700" htmlFor="reset-email">Email address</label>
          <input id="reset-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5" placeholder="you@example.com" />
          <button type="submit" disabled={busy} className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white disabled:opacity-50">{busy ? 'Sending...' : 'Send reset link'}</button>
        </form>
      )}
      <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-primary-600">Back to sign in</Link>
    </div>
  );
}
