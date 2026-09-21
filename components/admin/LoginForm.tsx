'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.message ?? 'Connexion impossible.');
        return;
      }

      // `refresh()` force le rendu serveur à relire le cookie de session.
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Le serveur ne répond pas.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error && (
        <p role="alert" className="rounded-xl border border-ember/40 bg-ember/[0.07] px-4 py-3 text-sm text-ember">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="field-label">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
        />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
        />
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
