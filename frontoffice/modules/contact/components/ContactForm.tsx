'use client'

import React, { useState, useEffect } from 'react'
import { contactService, ContactFormData } from '@/common/services/contactService'
import { AuthService } from '@/common/services/authService'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

const ContactForm = () => {
    const [formData, setFormData] = useState<ContactFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        AuthService.getCurrentUser()
            .then(user => {
                if (user) {
                    setIsLoggedIn(true);
                    setFormData(prev => ({
                        ...prev,
                        firstName: user.firstName || prev.firstName,
                        lastName:  user.lastName  || prev.lastName,
                        email:     user.email     || prev.email,
                        phone:     user.phone     || prev.phone,
                    }));
                }
            })
            .catch(() => {});
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            await contactService.sendContactMessage(formData);
            setStatus('success');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
        } catch (error: any) {
            console.error('Failed to send message:', error);
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi du message.');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center animate-in zoom-in duration-300">
                <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-emerald-900 mb-2">Message Envoyé !</h3>
                <p className="text-emerald-700 mb-6">Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="text-emerald-600 font-bold hover:underline"
                >
                    Envoyer un autre message
                </button>
            </div>
        )
    }

    const readOnlyClass = 'w-full bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 outline-none text-slate-900 font-medium cursor-default';
    const editableClass = 'w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl p-5 focus:bg-white focus:border-wiki/30 focus:ring-4 focus:ring-wiki/5 transition-all outline-none text-slate-900 placeholder:text-slate-300 font-medium';

    return (
        <form onSubmit={handleSubmit} className="space-y-8">

            {/* Badge session connectée */}
            {isLoggedIn && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-2xl text-sm text-emerald-700 font-semibold">
                    <CheckCircle2 size={16} className="shrink-0" />
                    Vos coordonnées sont pré-remplies depuis votre compte
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 group">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-wiki transition-colors">
                        Prénom <span className="text-wiki">*</span>
                    </label>
                    <input
                        required
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        readOnly={isLoggedIn}
                        placeholder="Ex: Ahmed"
                        className={isLoggedIn ? readOnlyClass : editableClass}
                    />
                </div>
                <div className="space-y-3 group">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-wiki transition-colors">
                        Nom
                    </label>
                    <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        readOnly={isLoggedIn}
                        placeholder="Ex: Ben Ali"
                        className={isLoggedIn ? readOnlyClass : editableClass}
                    />
                </div>
            </div>

            <div className="space-y-3 group">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-wiki transition-colors">
                    Email <span className="text-wiki">*</span>
                </label>
                <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={isLoggedIn}
                    placeholder="votre@email.com"
                    className={isLoggedIn ? readOnlyClass : editableClass}
                />
            </div>

            <div className="space-y-3 group">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-wiki transition-colors">
                    Téléphone
                </label>
                <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg">🇹🇳</span>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="20 123 456"
                        className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl p-5 pl-14 focus:bg-white focus:border-wiki/30 focus:ring-4 focus:ring-wiki/5 transition-all outline-none text-slate-900 placeholder:text-slate-300 font-medium"
                    />
                </div>
            </div>

            <div className="space-y-3 group">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-wiki transition-colors">
                    Sujet de votre demande <span className="text-wiki">*</span>
                </label>
                <select
                    required
                    name="subject"
                    value={formData.subject}
                    onChange={(e: any) => handleChange(e)}
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl p-5 focus:bg-white focus:border-wiki/30 focus:ring-4 focus:ring-wiki/5 transition-all outline-none text-slate-900 font-medium"
                >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="RECLAMATION">Réclamation</option>
                    <option value="SUPPORT">Support Technique</option>
                    <option value="INFO">Demande d'information</option>
                    <option value="RETOUR">Retour de produit</option>
                    <option value="AUTRE">Autre</option>
                </select>
            </div>

            <div className="space-y-3 group">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-wiki transition-colors">
                    Votre Message <span className="text-wiki">*</span>
                </label>
                <textarea
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Comment pouvons-nous vous aider ?"
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl p-5 focus:bg-white focus:border-wiki/30 focus:ring-4 focus:ring-wiki/5 transition-all outline-none text-slate-900 placeholder:text-slate-300 font-medium resize-none"
                />
                <div className="flex justify-end pr-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {formData.message.length} chars
                </div>
            </div>

            {/* Premium reCAPTCHA Mockup */}
            <div className="bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 flex items-center justify-between max-w-sm group hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-4">
                    <input type="checkbox" required className="w-6 h-6 rounded-lg border-2 border-slate-200 text-wiki focus:ring-wiki transition-all" />
                    <span className="text-sm font-bold text-slate-600">Sécurité vérifiée</span>
                </div>
                <div className="flex flex-col items-center opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                    <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">Google</span>
                </div>
            </div>

            {status === 'error' && (
                <div className="flex items-center gap-3 text-rose-600 text-sm font-bold bg-rose-50 border border-rose-100 p-5 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle size={20} />
                    <span>{errorMessage}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={status === 'loading'}
                className="group relative w-full overflow-hidden rounded-2xl p-1 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-wiki/20"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-wiki via-emerald-400 to-wiki animate-gradient-x" />
                <div className="relative bg-slate-900 group-hover:bg-transparent transition-colors py-5 rounded-[14px] flex items-center justify-center gap-3">
                    {status === 'loading' ? (
                        <Loader2 className="animate-spin text-wiki" size={24} />
                    ) : (
                        <>
                            <span className="text-white font-black text-lg uppercase tracking-widest">Envoyer ma demande</span>
                            <CheckCircle2 className="text-wiki group-hover:text-white transition-colors" size={20} />
                        </>
                    )}
                </div>
            </button>
        </form>
    )
}

export default ContactForm
