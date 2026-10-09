import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { User, Lock } from 'lucide-react';
import { sendEmailVerificationCode, verifyEmailAddress, sendPhoneVerificationCode, verifyPhoneNumber } from '@/api/auth';

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Must be at least 8 characters'),
});

export default function Profile() {
  const { user, updateProfile, changePassword, fetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);

  const { register: regProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isSubmitting: profileSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    },
  });

  const { register: regPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors, isSubmitting: passwordSubmitting }, reset: resetPassword } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword(data.old_password, data.new_password);
      toast.success('Password changed!');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.old_password?.[0] || 'Current password is incorrect');
    }
  };

  const onSendPhoneCode = async () => {
    setPhoneBusy(true);
    try {
      await sendPhoneVerificationCode();
      toast.success('Verification code sent by SMS.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send a verification code.');
    } finally {
      setPhoneBusy(false);
    }
  };

  const onVerifyPhone = async (event) => {
    event.preventDefault();
    setPhoneBusy(true);
    try {
      await verifyPhoneNumber(verificationCode);
      await fetchProfile();
      setVerificationCode('');
      toast.success('Phone number verified.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not verify your phone number.');
    } finally {
      setPhoneBusy(false);
    }
  };

  const onSendEmailCode = async () => {
    setEmailBusy(true);
    try {
      await sendEmailVerificationCode();
      toast.success('Verification code sent by email.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send a verification code.');
    } finally {
      setEmailBusy(false);
    }
  };

  const onVerifyEmail = async (event) => {
    event.preventDefault();
    setEmailBusy(true);
    try {
      await verifyEmailAddress(emailCode);
      await fetchProfile();
      setEmailCode('');
      toast.success('Email address verified.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not verify your email address.');
    } finally {
      setEmailBusy(false);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
          {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.first_name} {user?.last_name}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700 capitalize">{user?.role}</span>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 mb-6">
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'password', label: 'Password', icon: Lock },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input {...regProfile('first_name')} className={inputClass} />
              {profileErrors.first_name && <p className="mt-1 text-xs text-red-500">{profileErrors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input {...regProfile('last_name')} className={inputClass} />
              {profileErrors.last_name && <p className="mt-1 text-xs text-red-500">{profileErrors.last_name.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input {...regProfile('phone')} className={inputClass} placeholder="Optional" />
            {user?.phone && (
              <p className={`mt-1 text-xs ${user.phone_verified ? 'text-green-700' : 'text-amber-700'}`}>
                {user.phone_verified ? 'Phone number verified' : 'Phone number not verified'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea {...regProfile('bio')} rows={3} className={inputClass} placeholder="Tell us about yourself" />
          </div>
          <button
            type="submit"
            disabled={profileSubmitting}
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {profileSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === 'profile' && user?.phone && !user.phone_verified && (
        <form onSubmit={onVerifyPhone} className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-900">Verify your phone number</h2>
          <p className="text-sm text-gray-600">Enter the six-digit code sent to {user.phone}. Codes expire after 10 minutes.</p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              aria-label="Six-digit phone verification code"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ''))}
              className={`${inputClass} mt-0 max-w-48`}
              placeholder="123456"
            />
            <button type="submit" disabled={phoneBusy} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Verify phone</button>
            <button type="button" onClick={onSendPhoneCode} disabled={phoneBusy} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">Send code</button>
          </div>
        </form>
      )}

      {activeTab === 'profile' && user?.email && !user.email_verified && (
        <form onSubmit={onVerifyEmail} className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-900">Verify your email address</h2>
          <p className="text-sm text-gray-600">Enter the six-digit code sent to {user.email}. Codes expire after 10 minutes.</p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              aria-label="Six-digit email verification code"
              value={emailCode}
              onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, ''))}
              className={`${inputClass} mt-0 max-w-48`}
              placeholder="123456"
            />
            <button type="submit" disabled={emailBusy} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Verify email</button>
            <button type="button" onClick={onSendEmailCode} disabled={emailBusy} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">Send code</button>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input type="password" {...regPassword('old_password')} className={inputClass} />
            {passwordErrors.old_password && <p className="mt-1 text-xs text-red-500">{passwordErrors.old_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input type="password" {...regPassword('new_password')} className={inputClass} placeholder="Min. 8 characters" />
            {passwordErrors.new_password && <p className="mt-1 text-xs text-red-500">{passwordErrors.new_password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={passwordSubmitting}
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {passwordSubmitting ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
}
