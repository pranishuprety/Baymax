// File: frontend/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = role === 'patient' ? '/client/login' : '/therapist/login';
    try {
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Show the server-provided message, or fallback
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      if (!data.token) {
        setError('No token received from server');
        setLoading(false);
        return;
      }

      // Success!
      localStorage.setItem('token', data.token);
      router.push(role === 'patient' ? '/patient' : '/doctor');
    } catch (err: any) {
      console.error(err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-lg w-full max-w-sm text-white space-y-6"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {/* Role toggle */}
        <div className="flex bg-gray-700 rounded overflow-hidden">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`flex-1 py-2 ${role === 'patient' ? 'bg-purple-600' : ''}`}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`flex-1 py-2 ${role === 'doctor' ? 'bg-purple-600' : ''}`}
          >
            Doctor
          </button>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
        >
          {loading ? 'Logging in…' : `Login as ${role === 'patient' ? 'Patient' : 'Doctor'}`}
        </button>

        <p className="text-center text-sm">
          New user?{' '}
          <Link href="/signup" className="underline text-purple-400">
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}
