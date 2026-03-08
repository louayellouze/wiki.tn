'use client'

import React, { useEffect, useState } from 'react'
import { AuthService } from '@/common/services/authService'
import { ReviewService } from '@/common/services/reviewService'
import { formatPrice } from '@/common/utils/format'
import { User } from '@/app/dtos/auth'
import { getMyOrders } from '@/common/services/orderService'
import Button from '@/common/components/elements/Button'
import { Card } from '@/common/components/elements/Card'
import {
    User as UserIcon, Mail, Phone, MapPin, Edit2, Save, X,
    Loader2, Camera, Lock, CheckCircle2, ArrowLeft, ShieldCheck, ShoppingBag
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ProfilePage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<User>>({});

    // Order history state
    const [showOrders, setShowOrders] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const userData = await AuthService.getCurrentUser();
            setUser(userData);
            setFormData(userData);
            // Also fetch orders for the badge or pre-loading
            fetchOrders();
        } catch (err: any) {
            setError(err.message || "Erreur lors de la récupération du profil");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const data = await getMyOrders();
            setOrders(data);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedUser = await AuthService.updateProfile(user.id, formData);
            setUser(updatedUser);
            setEditing(false);
            setSuccess("Profil mis à jour avec succès !");

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la mise à jour du profil");
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Check file size (e.g., 2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            setError("L'image est trop volumineuse (max 2MB)");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result as string;
            setSaving(true);
            try {
                const updatedUser = await AuthService.updateProfile(user.id, { imageUrl: base64 } as any);
                setUser(updatedUser);
                setFormData(updatedUser);
                setSuccess("Photo de profil mise à jour !");
                setTimeout(() => setSuccess(null), 3000);
            } catch (err: any) {
                setError("Erreur lors de la mise à jour de la photo");
            } finally {
                setSaving(false);
            }
        };
    };

    const getOrderStatusLabel = (status: string) => {
        const statusMap: Record<string, { label: string, color: string }> = {
            'PENDING': { label: 'En attente', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            'CONFIRMED': { label: 'Confirmée', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            'SHIPPED': { label: 'Expédiée', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            'DELIVERED': { label: 'Livrée', color: 'bg-green-50 text-green-700 border-green-100' },
            'CANCELLED': { label: 'Annulée', color: 'bg-red-50 text-red-700 border-red-100' },
            'DELIVERED_TO_STORE': { label: 'Livré au magasin', color: 'bg-purple-50 text-purple-700 border-purple-100' },
            'EXCHANGE': { label: 'Echange', color: 'bg-orange-50 text-orange-700 border-orange-100' },
            'IN_DELIVERY_ARAMEX': { label: 'Livraison Aramex', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
            'SMT': { label: 'SMT', color: 'bg-slate-50 text-slate-700 border-slate-100' },
            'ARTICLE_BEING_PURCHASED': { label: 'Article en cours d\'achat', color: 'bg-pink-50 text-pink-700 border-pink-100' },
            'AWAITING_RESTOCK': { label: 'Attente réappro', color: 'bg-amber-50 text-amber-700 border-amber-100' },
            'PC_BEING_ASSEMBLED': { label: 'PC en montage', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            'ORDER_BEING_PICKED_UP': { label: 'En ramassage', color: 'bg-teal-50 text-teal-700 border-teal-100' },
            'TRANSFERRED_TO_STORE_FACILITY_PAYMENT': { label: 'Transf. Mag (Facilité)', color: 'bg-violet-50 text-violet-700 border-violet-100' },
            'TRANSFERRED_TO_STORE_CHECK_PAYMENT': { label: 'Transf. Mag (Chèque)', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' },
            'UNREACHABLE_NUMBER': { label: 'Numéro injoignable', color: 'bg-rose-50 text-rose-700 border-rose-100' },
            'AWAITING_AVAILABILITY_CHECK': { label: 'Vérif. disponibilité', color: 'bg-sky-50 text-sky-700 border-sky-100' },
            'ORDER_ARRIVED_AT_STORE': { label: 'Arrivée au magasin', color: 'bg-lime-50 text-lime-700 border-lime-100' },
            'IN_DELIVERY_OWN_MEANS': { label: 'Livraison interne', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            'AWAITING_CLIENT_RESPONSE': { label: 'Attente rép client', color: 'bg-zinc-50 text-zinc-700 border-zinc-100' },
        };
        return statusMap[status] || { label: status, color: 'bg-gray-50 text-gray-700 border-gray-100' };
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("Les mots de passe ne correspondent pas");
            return;
        }

        setPasswordSaving(true);
        setPasswordError(null);

        try {
            await AuthService.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setShowPasswordModal(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setSuccess("Mot de passe modifié avec succès !");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            const errorData = err.response?.data;
            const errorMessage = typeof errorData === 'string'
                ? errorData
                : errorData?.message || errorData?.error || "Ancien mot de passe incorrect";
            setPasswordError(errorMessage);
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 flex justify-center items-center">
                <Loader2 className="w-10 h-10 text-wiki-btn animate-spin" />
                <span className="ml-3 text-xl font-medium text-gray-600">Chargement de votre profil...</span>
            </div>
        );
    }

    if (!user && !loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="bg-white p-10 rounded-2xl shadow-2xl border border-gray-100 inline-block max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <X className="w-10 h-10 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-2">Session expirée</p>
                    <p className="text-gray-500 mb-8">Veuillez vous reconnecter pour accéder à votre espace personnel.</p>
                    <Button
                        variant="primary"
                        className="w-full py-4 text-lg font-bold shadow-lg shadow-wiki-btn/30"
                        onClick={() => window.location.href = '/auth/login'}
                    >
                        Se connecter
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] py-8 md:py-16">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Success/Error Toasts */}
                {success && (
                    <div className="fixed top-24 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-right duration-300">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold">{success}</span>
                    </div>
                )}
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="p-3 bg-white rounded-full shadow-md hover:shadow-lg text-gray-600 hover:text-wiki-btn transition-all group border border-gray-100"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <Image
                                src="/assets/img/logo-wiki.svg"
                                alt="Wiki Logo"
                                width={160}
                                height={50}
                                className="h-12 w-auto"
                            />
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-medium text-gray-500 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Espace Personnel Sécurisé
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Avatar & Summary */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        <Card className="p-8 flex flex-col items-center text-center shadow-xl border-none bg-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-wiki-btn/20 to-emerald-400/20" />

                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 relative z-10 overflow-hidden group ring-4 ring-white shadow-lg border border-gray-100">
                                {user?.imageUrl ? (
                                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-wiki-btn/5 flex items-center justify-center">
                                        <UserIcon className="w-16 h-16 text-wiki-btn" />
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                                    <Camera className="w-8 h-8 text-white mb-1" />
                                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Modifier</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                                {saving && (
                                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 backdrop-blur-sm">
                                        <Loader2 className="w-8 h-8 text-wiki-btn animate-spin" />
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.firstName} {user?.lastName}</h2>
                                <p className="text-wiki-btn font-semibold text-sm mb-4">@{user?.username}</p>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100 shadow-sm">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {user?.role || 'CLIENT'}
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 shadow-lg border-none bg-white overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-wiki-btn" /> Sécurité
                                </h3>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="p-2 text-gray-400 hover:text-wiki-btn hover:bg-emerald-50 rounded-full transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                Maintenez votre compte en sécurité en changeant régulièrement votre mot de passe.
                            </p>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full text-xs font-bold text-white shadow-md shadow-wiki-btn/20 uppercase tracking-wider btn-liquid btn-liquid-login"
                            >
                                <span className="liquid"></span>
                                <span className="button_text">Changer le mot de passe</span>
                            </button>
                        </Card>

                        <Card className="p-6 shadow-lg border-none bg-white overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-wiki-btn" /> Historique
                                </h3>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                Consultez vos commandes passées et suivez vos livraisons en cours ({orders.length} commande{orders.length > 1 ? 's' : ''}).
                            </p>
                            <button
                                onClick={() => setShowOrders(true)}
                                className="w-full py-2.5 text-xs font-bold text-wiki-btn bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all uppercase tracking-wider border border-emerald-100"
                            >
                                Consulter l'historique
                            </button>
                        </Card>

                        {/* Logout Card */}
                        <Card className="p-6 shadow-lg border-none bg-red-50/50 hover:bg-red-50 transition-colors overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-red-600 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Session
                                </h3>
                            </div>
                            <p className="text-xs text-red-500/80 mb-4 leading-relaxed font-medium">

                            </p>
                            <button
                                onClick={handleLogout}
                                className="w-full text-xs font-bold text-white shadow-md shadow-red-500/20 uppercase tracking-wider btn-liquid btn-liquid-logout"
                            >
                                <span className="liquid"></span>
                                <span className="button_text">Déconnexion</span>
                            </button>
                        </Card>
                    </div>

                    {/* Right Column: Details Form or Order History */}
                    <div className="w-full lg:w-2/3">
                        {!showOrders ? (
                            <Card className="p-8 md:p-10 shadow-xl border-none bg-white">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 pb-6 border-b border-gray-100 gap-4">
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Détails <span className="text-wiki-btn">du compte</span></h1>
                                    {!editing ? (
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-emerald-50 text-wiki-btn border border-emerald-100 rounded-xl font-bold transition-all shadow-sm"
                                        >
                                            <Edit2 className="w-4 h-4" /> Modifier mes infos
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => { setEditing(false); setFormData(user!); }}
                                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all"
                                        >
                                            <X className="w-4 h-4" /> Annuler
                                        </button>
                                    )}
                                </div>

                                {error && (
                                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 ml-1">
                                                Prénom
                                            </label>
                                            <input
                                                type="text"
                                                disabled={!editing}
                                                value={formData.firstName || ''}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-wiki-btn/10 focus:border-wiki-btn focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-800 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 ml-1">
                                                Nom
                                            </label>
                                            <input
                                                type="text"
                                                disabled={!editing}
                                                value={formData.lastName || ''}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-wiki-btn/10 focus:border-wiki-btn focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-800 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2 ml-1">
                                            <Mail className="w-4 h-4 text-wiki-btn" /> Email professionnel
                                        </label>
                                        <input
                                            type="email"
                                            disabled={true}
                                            value={formData.email || ''}
                                            className="w-full px-5 py-3.5 bg-gray-100 border border-gray-200 text-gray-400 rounded-2xl cursor-not-allowed font-medium italic"
                                        />
                                        <div className="flex items-start gap-2 ml-1">
                                            <div className="w-1.5 h-1.5 bg-wiki-btn rounded-full mt-1.5 shrink-0" />
                                            <p className="text-[11px] text-gray-500">L'adresse email est synchronisée avec votre compte principal et ne peut être modifiée.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2 ml-1">
                                            <Phone className="w-4 h-4 text-wiki-btn" /> Ligne directe
                                        </label>
                                        <input
                                            type="tel"
                                            disabled={!editing}
                                            placeholder="Ex: +216 12 345 678"
                                            value={formData.phone || ''}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-wiki-btn/10 focus:border-wiki-btn focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-800 font-medium"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2 ml-1">
                                            <MapPin className="w-4 h-4 text-wiki-btn" /> Adresse de livraison
                                        </label>
                                        <textarea
                                            disabled={!editing}
                                            rows={3}
                                            placeholder="Indiquez votre adresse complète pour la livraison"
                                            value={formData.address || ''}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-wiki-btn/10 focus:border-wiki-btn focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-800 font-medium resize-none"
                                        />
                                    </div>

                                    {editing && (
                                        <div className="pt-6">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="w-full bg-wiki-btn hover:bg-emerald-800 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-wiki-btn/30 transform active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-400 group"
                                            >
                                                {saving ? (
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                ) : (
                                                    <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                )}
                                                Mettre à jour mon profil
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </Card>
                        ) : (
                            <Card className="p-8 md:p-10 shadow-xl border-none bg-white">
                                <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Historique <span className="text-wiki-btn">des commandes</span></h1>
                                    <button
                                        onClick={() => setShowOrders(false)}
                                        className="text-gray-500 hover:text-wiki-btn font-bold flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Retour
                                    </button>
                                </div>

                                {ordersLoading ? (
                                    <div className="py-20 flex flex-col items-center">
                                        <Loader2 className="w-10 h-10 text-wiki-btn animate-spin" />
                                        <p className="mt-4 text-gray-500 font-bold">Chargement de vos commandes...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <p className="text-xl font-bold text-gray-400">Vous n'avez pas encore passé de commande.</p>
                                        <Link href="/" className="text-wiki-btn hover:underline mt-4 inline-block font-bold">Découvrir nos produits</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map((order: any) => (
                                            <div key={order.id} className="border border-gray-100 rounded-2xl p-6 hover:bg-slate-50 transition-all group">
                                                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                                    <div>
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Commande #{order.id}</p>
                                                        <p className="text-lg font-bold text-gray-800">{new Date(order.orderDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getOrderStatusLabel(order.status).color}`}>
                                                            {getOrderStatusLabel(order.status).label}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xl font-black text-wiki-btn">{formatPrice(order.totalAmount)}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Espèces à la livraison' :
                                                                    order.paymentMethod === 'CARD' ? 'Carte Bancaire' :
                                                                        order.paymentMethod || 'Non spécifié'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-6 border-t border-gray-100 pt-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Articles commandés</p>
                                                    <div className="space-y-3">
                                                        {order.items.map((item: any) => (
                                                            <div key={item.id} className="flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 hover:border-wiki-btn/30 group/item">
                                                                <div className="flex items-center gap-5">
                                                                    <div className="shrink-0 w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center p-2 border border-gray-100 group-hover/item:scale-105 transition-transform duration-300">
                                                                        <img src={item.productImageUrl || '/assets/img/logo.png'} className="max-h-full object-contain" alt={item.productTitle} />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-sm font-black text-gray-900 line-clamp-2 leading-snug max-w-[200px] md:max-w-md">{item.productTitle}</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-400 rounded-md uppercase tracking-wider">REF: {item.id}</span>
                                                                            <p className="text-xs text-slate-500 font-bold">PU: <span className="text-gray-700">{formatPrice(item.price)}</span></p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right pl-4 border-l border-gray-100 min-w-[100px]">
                                                                    <div className="flex flex-col h-full justify-between py-1">
                                                                        <p className="text-sm font-black text-slate-400 group-hover/item:text-wiki-btn transition-colors italic">Qté: {item.quantity}</p>
                                                                        <p className="text-lg font-black text-wiki-btn tracking-tight">{formatPrice(item.price * item.quantity)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Password Change Modal - Enhanced */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-md p-0 shadow-2xl border-none bg-white rounded-3xl overflow-hidden scale-in-center">
                        <div className="p-8 pb-4">
                            <div className="flex justify-between items-center mb-6">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                    <Lock className="text-wiki-btn w-6 h-6" />
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <h2 className="text-2xl font-black text-gray-900 mb-2">Sécurité du compte</h2>
                            <p className="text-sm text-gray-500 mb-8">Modifiez votre mot de passe pour assurer la protection de vos données.</p>

                            {passwordError && (
                                <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                                    {passwordError}
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ancien mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-wiki-btn/10 focus:border-wiki-btn focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-wiki-btn/10 focus:border-wiki-btn focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-wiki-btn/10 focus:border-wiki-btn focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full py-5 text-lg font-black shadow-xl shadow-wiki-btn/30 hover:shadow-wiki-btn/40 mt-4 rounded-2xl"
                                    disabled={passwordSaving}
                                >
                                    {passwordSaving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Mettre à jour mot de passe"}
                                </Button>
                            </form>
                        </div>
                        <div className="bg-emerald-50/50 p-6 mt-4 text-center">
                            <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-[0.2em]">Wiki Secure Portal Edition</p>
                        </div>
                    </Card>
                </div>
            )
            }
        </div >
    );
};

export default ProfilePage;
