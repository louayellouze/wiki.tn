'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { AuthService } from '@/common/services/authService'
import '../auth-style.css'

const ForgotPassword = () => {
    const [identifier, setIdentifier] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await AuthService.forgotPassword({
                identifier: identifier
            });
            setSuccess(response.message || 'Email de réinitialisation envoyé !');
            setIdentifier('');
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
                        <h2>Récupération</h2>
                        <p>Entrez votre e-mail ou identifiant pour continuer</p>
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
                                    type="text"
                                    id="identifier"
                                    name="identifier"
                                    required
                                    placeholder=" "
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                                <label htmlFor="identifier">Identifiant ou E-mail</label>
                                <div className="input-wave"></div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`gradient-button ${loading ? 'loading' : ''}`}
                            disabled={loading}
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
                                    <span className="btn-text">Envoyer le lien</span>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="signup-link">
                        <p>
                            <Link href="/auth/login">Retour à la connexion</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
