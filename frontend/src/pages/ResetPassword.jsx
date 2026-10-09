import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { confirmPasswordReset } from '@/api/auth';

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await confirmPasswordReset(uid, token, password);
      toast.success('Password reset successfully. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.new_password?.[0] || err.response?.data?.error || 'Could not reset your password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">Choose a new password</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="new-password">New password</label>
        <input id="new-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5" autoComplete="new-password" />
        <label className="block text-sm font-medium text-gray-700" htmlFor="confirm-password">Confirm new password</label>
        <input id="confirm-password" type="password" minLength={8} required value={confirm} onChange={(event) => setConfirm(event.target.value)} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5" autoComplete="new-password" />
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white disabled:opacity-50">{busy ? 'Updating...' : 'Reset password'}</button>
      </form>
      <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-primary-600">Back to sign in</Link>
    </div>
  );
}
