'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthService } from '@/common/services/authService'
import Link from 'next/link'
import Image from 'next/image'
import '../auth-style.css'

const VerifyEmail = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Validation de votre compte en cours...');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Jeton de validation manquant.');
            return;
        }

        const verify = async () => {
            try {
                const response = await AuthService.verifyEmail(token);
                setStatus('success');
                setMessage(response.message || 'Votre compte a été validé avec succès !');
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/auth/login?verified=true');
                }, 3000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Lien de validation invalide ou expiré.');
            }
        };

        verify();
    }, [searchParams, router]);

    return (
        <div className="auth-body">
            <div className="wave-container">
                <div className="wave wave-1"></div>
                <div className="wave wave-2"></div>
                <div className="wave wave-3"></div>
                <div className="wave wave-4"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="card-glow"></div>

                    <div className="login-header">
                        <div className="gradient-icon">
                            <div className="icon-wave"></div>
                            <Image src="/assets/img/logo-wiki.svg" alt="Wiki Logo" width={160} height={50} />
                        </div>
                        <h2>Validation du compte</h2>
                        <p>{status === 'loading' ? 'Patientez un instant...' : 'Résultat de la validation'}</p>
                    </div>

                    <div className="py-8 text-center">
                        {status === 'loading' && (
                            <div className="btn-loader" style={{ margin: '0 auto' }}>
                                <div className="loader-wave" style={{ background: 'var(--wiki-green)' }}></div>
                                <div className="loader-wave" style={{ background: 'var(--wiki-green)' }}></div>
                                <div className="loader-wave" style={{ background: 'var(--wiki-green)' }}></div>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="msg-alert msg-success mb-6">
                                <i className="fas fa-check-circle mr-2"></i>
                                {message}
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="msg-alert msg-error mb-6">
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                {message}
                            </div>
                        )}

                        <div className="mt-8">
                            <Link href="/auth/login" className="gradient-button">
                                <div className="button-bg"></div>
                                <div className="button-content">
                                    <span className="btn-text">Aller à la connexion</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail
