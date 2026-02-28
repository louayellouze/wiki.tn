'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthService } from '@/common/services/authService'
import '../auth-style.css'

const ResetPassword = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const t = searchParams.get('token');
        if (t) setToken(t);
        else setError('Jeton de réinitialisation manquant.');
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setLoading(true);

        try {
            const response = await AuthService.resetPassword({
                token: token,
                password: password
            });
            setSuccess(response.message || 'Votre mot de passe a été réinitialisé avec succès ! Redirection...');
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.error || "Une erreur est survenue.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="wave-container">
                <div className="wave wave-1"></div>
                <div className="wave wave-2"></div>
                <div className="wave wave-3"></div>
                <div className="wave wave-4"></div>
            </div>

            <div className="gradient-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="card-glow"></div>

                    <div className="login-header">
                        <div className="gradient-icon">
                            <div className="icon-wave"></div>
                            <img src="/assets/img/logo-wiki.svg" alt="Wiki Logo" />
                        </div>
                        <h2>Sécurité</h2>
                        <p>Réinitialisez votre mot de passe</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {success && (
                            <div className="msg-alert msg-success">
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="msg-alert msg-error">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <div className="input-container">
                                <div className="input-bg"></div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    placeholder=" "
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label htmlFor="password">Nouveau mot de passe</label>
                                <div className="input-wave"></div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-container">
                                <div className="input-bg"></div>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    required
                                    placeholder=" "
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
                                <div className="input-wave"></div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`gradient-button ${loading ? 'loading' : ''}`}
                            disabled={loading || !token}
                        >
                            <div className="button-bg"></div>
                            <div className="button-content">
                                {loading ? (
                                    <div className="btn-loader">
                                        <div className="loader-wave"></div>
                                        <div className="loader-wave"></div>
                                        <div className="loader-wave"></div>
                                    </div>
                                ) : (
                                    <span className="btn-text">Réinitialiser</span>
                                )}
                            </div>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
