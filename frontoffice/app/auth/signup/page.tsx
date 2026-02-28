'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { AuthService } from '@/common/services/authService'
import { useRouter } from 'next/navigation'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import '../auth-style.css'

const SignUp = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            setLoading(false);
            return;
        }

        try {
            await AuthService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                address: formData.address,
                role: 'CLIENT'
            });
            router.push('/auth/login?registered=true');
        } catch (err: any) {
            const msg = err.response?.data?.message || "Échec de l'inscription. Veuillez réessayer.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) return;

        setLoading(true);
        setError('');

        try {
            const data = await AuthService.loginWithGoogle(credentialResponse.credential);
            localStorage.setItem('accessToken', data.accessToken);
            router.push('/');
        } catch (err: any) {
            setError("L'authentification Google a échoué.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-body">
            {/* Animated Background Elements */}
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

            <div className="login-container" style={{ maxWidth: '600px' }}>
                <div className="login-card">
                    <div className="card-glow"></div>

                    <div className="login-header">
                        <div className="gradient-icon">
                            <div className="icon-wave"></div>
                            <img src="/assets/img/logo-wiki.svg" alt="Wiki Logo" />
                        </div>
                        <h2>Créer un compte</h2>
                        <p>Rejoignez la communauté Wiki</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="msg-alert msg-error">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                            <div className="form-group">
                                <div className="input-container">
                                    <div className="input-bg"></div>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        required
                                        autoComplete="given-name"
                                        placeholder=" "
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="firstName">Prénom</label>
                                    <div className="input-wave"></div>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-container">
                                    <div className="input-bg"></div>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        required
                                        autoComplete="family-name"
                                        placeholder=" "
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="lastName">Nom</label>
                                    <div className="input-wave"></div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-container">
                                <div className="input-bg"></div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    required
                                    autoComplete="username"
                                    placeholder=" "
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                                <label htmlFor="username">Nom d'utilisateur</label>
                                <div className="input-wave"></div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-container">
                                <div className="input-bg"></div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    placeholder=" "
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <label htmlFor="email">Adresse e-mail</label>
                                <div className="input-wave"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                            <div className="form-group">
                                <div className="input-container">
                                    <div className="input-bg"></div>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        required
                                        autoComplete="new-password"
                                        placeholder=" "
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="password">Mot de passe</label>
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
                                        autoComplete="new-password"
                                        placeholder=" "
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
                                    <div className="input-wave"></div>
                                </div>
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
                                    <span className="btn-text">Créer mon compte</span>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="social-login-separator">
                        <span>OU</span>
                    </div>

                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError("L'authentification Google a échoué.")}
                            theme="outline"
                            size="large"
                            text="signup_with"
                            shape="pill"
                        />
                    </div>

                    <div className="signup-link">
                        <p>
                            Déjà inscrit ?
                            <Link href="/auth/login">Se connecter ici</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp
