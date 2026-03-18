'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, saveAuth } from '@/lib/client/api';

export default function LoginPage() {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'member',
        country: 'india',
    });

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isRegister ? '/auth/register' : '/auth/login';
            const body = isRegister
                ? form
                : { email: form.email, password: form.password };

            const data = await api(endpoint, {
                method: 'POST',
                body: JSON.stringify(body),
            });

            saveAuth(data.token, data.data.user);
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h1>🍕 Food Ordering</h1>
                <p className="subtitle">Full-Stack RBAC System</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" placeholder="John Doe" value={form.name} onChange={set('name')} required />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="admin.india@test.com" value={form.email} onChange={set('email')} required />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="password123" value={form.password} onChange={set('password')} required />
                    </div>

                    {isRegister && (
                        <>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={form.role} onChange={set('role')}>
                                    <option value="member">Member</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <select value={form.country} onChange={set('country')}>
                                    <option value="india">India</option>
                                    <option value="america">America</option>
                                </select>
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                        {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem' }}>
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); setError(''); }}>
                        {isRegister ? 'Login' : 'Register'}
                    </a>
                </p>

                <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(108,92,231,0.08)', borderRadius: 8, border: '1px solid rgba(108,92,231,0.15)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--accent)' }}>Quick Login</strong><br />
                    <code>admin.india@test.com</code> / <code>password123</code><br />
                    <code>manager.america@test.com</code> / <code>password123</code>
                </div>
            </div>
        </div>
    );
}
