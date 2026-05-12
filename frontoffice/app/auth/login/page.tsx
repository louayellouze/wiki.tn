'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AuthService } from '@/common/services/authService'
import { useRouter, useSearchParams } from 'next/navigation'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import Image from 'next/image'
import '../auth-style.css'

const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccessMsg('Inscription réussie ! Un email de validation vous a été envoyé. Veuillez valider votre compte avant de vous connecter.');
        } else if (searchParams.get('verified') === 'true') {
            setSuccessMsg('Compte validé avec succès ! Vous pouvez maintenant vous connecter.');
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const decodeToken = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await AuthService.login({
                username: formData.username,
                password: formData.password
            });

            const accessToken = data.accessToken;
            const decodedToken = decodeToken(accessToken);

            if (!decodedToken) {
                setError('Token d\'authentification invalide.');
                setLoading(false);
                return;
            }

            let userRole = null;
            if (decodedToken.role) {
                userRole = decodedToken.role.replace('ROLE_', '');
            } else if (decodedToken.authorities && Array.isArray(decodedToken.authorities)) {
                const authority = decodedToken.authorities[0];
                userRole = typeof authority === 'string'
                    ? authority.replace('ROLE_', '')
                    : authority?.authority?.replace('ROLE_', '');
            } else if (decodedToken.roles && Array.isArray(decodedToken.roles)) {
                userRole = decodedToken.roles[0];
            }

            if (!userRole || userRole !== 'CLIENT') {
                setError('Accès refusé. Seuls les clients peuvent accéder à cette interface.');
                setLoading(false);
                return;
            }

            localStorage.setItem('accessToken', accessToken);
            // refreshToken is handled via httpOnly cookie by the backend
            router.push('/');
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.error || "Échec de la connexion. Veuillez vérifier vos identifiants.";
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
            const accessToken = data.accessToken;
            // Use existing logic to decode and verify role
            const decodedToken = decodeToken(accessToken);

            if (!decodedToken) {
                setError('Token Google invalide.');
                return;
            }

            let userRole = null;
            if (decodedToken.role) {
                userRole = decodedToken.role.replace('ROLE_', '');
            } else if (decodedToken.authorities && Array.isArray(decodedToken.authorities)) {
                const authority = decodedToken.authorities[0];
                userRole = typeof authority === 'string'
                    ? authority.replace('ROLE_', '')
                    : authority?.authority?.replace('ROLE_', '');
            }

            if (!userRole || userRole !== 'CLIENT') {
                setError('Accès refusé. Seuls les clients peuvent accéder à cette interface.');
                return;
            }

            localStorage.setItem('accessToken', accessToken);
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

            <div className="login-container">
                <div className="login-card">
                    <div className="card-glow"></div>

                    <div className="login-header">
                        <div className="gradient-icon">
                            <div className="icon-wave"></div>
                            <Image src="/assets/img/logo-wiki.svg" alt="Wiki Logo" width={160} height={50} />
                        </div>
                        <h2>Bienvenue</h2>
                        <p>Connectez-vous à votre compte Wiki</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {successMsg && (
                            <div className="msg-alert msg-success">
                                {successMsg}
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
                                    id="username"
                                    name="username"
                                    required
                                    autoComplete="username"
                                    placeholder=" "
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                                <label htmlFor="username">Nom d&apos;utilisateur</label>
                                <div className="input-wave"></div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-container">
                                <div className="input-bg"></div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder=" "
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <label htmlFor="password">Mot de passe</label>
                                <div className="input-wave"></div>
                            </div>
                        </div>

                        <div className="auth-footer">
                            <Link href="/auth/forgot-password">
                                Mot de passe oublié ?
                            </Link>
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
                                    <span className="btn-text">Se connecter</span>
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
                            text="continue_with"
                            shape="pill"
                        />
                    </div>

                    <div className="signup-link">
                        <p>
                            Pas encore de compte ?
                            <Link href="/auth/signup">Créer un compte</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
