'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { AuthService } from '@/common/services/authService'
import { ReviewService } from '@/common/services/reviewService'
import { formatPrice } from '@/common/utils/format'
import { User } from '@/app/dtos/auth'
import { getMyOrders } from '@/common/services/orderService'
import Button from '@/common/components/elements/Button'
import { Card } from '@/common/components/elements/Card'
import {
    User as UserIcon, Mail, Phone, MapPin, Edit2, Save, X,
    Loader2, Camera, Lock, CheckCircle2, ArrowLeft, ShieldCheck, ShoppingBag,
    Wrench, FileText, CheckCircle, XCircle, CreditCard, HandCoins,
    MessageSquare, Star, LogOut, ChevronRight, Activity, RefreshCw
} from 'lucide-react'
import { repairService } from '@/common/services/repairService'
import { contactService } from '@/common/services/contactService'
import { RepairQuote, RepairRequest } from '@/app/dtos/repair'
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

    // Repair history state
    const [showRepairs, setShowRepairs] = useState(false);
    const [repairs, setRepairs] = useState<RepairRequest[]>([]);
    const [repairsLoading, setRepairsLoading] = useState(false);
    const [selectedRepairQuote, setSelectedRepairQuote] = useState<RepairQuote | null>(null);
    const [isRespondingToQuote, setIsRespondingToQuote] = useState(false);

    // Claims history state
    const [showClaims, setShowClaims] = useState(false);
    const [claims, setClaims] = useState<any[]>([]);
    const [claimsLoading, setClaimsLoading] = useState(false);

    // Reviews history state
    const [showReviews, setShowReviews] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // Security view state
    const [showSecurity, setShowSecurity] = useState(false);

    const fetchOrders = useCallback(async () => {
        // Charger depuis le cache session d'abord
        const cached = sessionStorage.getItem('profile_orders');
        if (cached) setOrders(JSON.parse(cached));

        setOrdersLoading(true);
        try {
            const data = await getMyOrders();
            setOrders(data);
            sessionStorage.setItem('profile_orders', JSON.stringify(data));
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setOrdersLoading(false);
        }
    }, []);

    const fetchRepairs = useCallback(async () => {
        const cached = sessionStorage.getItem('profile_repairs');
        if (cached) setRepairs(JSON.parse(cached));

        setRepairsLoading(true);
        try {
            const data = await repairService.getMyRepairRequests();
            setRepairs(data);
            sessionStorage.setItem('profile_repairs', JSON.stringify(data));
        } catch (err) {
            console.error("Failed to fetch repairs", err);
        } finally {
            setRepairsLoading(false);
        }
    }, []);

    const fetchReviews = useCallback(async () => {
        setReviewsLoading(true);
        try {
            const data = await ReviewService.getMyReviews();
            setReviews(data);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setReviewsLoading(false);
        }
    }, []);

    const fetchClaims = useCallback(async () => {
        const cached = sessionStorage.getItem('profile_claims');
        if (cached) setClaims(JSON.parse(cached));

        setClaimsLoading(true);
        try {
            const data = await contactService.getMyMessages();
            setClaims(data);
            sessionStorage.setItem('profile_claims', JSON.stringify(data));
        } catch (err) {
            console.error("Failed to fetch claims", err);
        } finally {
            setClaimsLoading(false);
        }
    }, []);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const userData = await AuthService.getCurrentUser();
            setUser(userData);
            setFormData(userData);
            // Also fetch orders for the badge or pre-loading
            fetchOrders();
            fetchRepairs();
            fetchReviews();
            fetchClaims();
        } catch (err: any) {
            setError(err.message || "Erreur lors de la récupération du profil");
        } finally {
            setLoading(false);
        }
    }, [fetchOrders, fetchRepairs]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const getRepairStatusLabel = (status: string) => {
        const statusMap: Record<string, { label: string, color: string }> = {
            'PENDING': { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-100' },
            'IN_PROGRESS': { label: 'En cours', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            'COMPLETED': { label: 'Terminée', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            'CANCELLED': { label: 'Annulée', color: 'bg-red-50 text-red-700 border-red-100' },
        };
        return statusMap[status] || { label: status, color: 'bg-gray-50 text-gray-700 border-gray-100' };
    };

    const handleViewQuote = async (requestId: number) => {
        try {
            const quote = await repairService.getQuoteByRequestId(requestId);
            if (quote) {
                setSelectedRepairQuote(quote);
            } else {
                alert("Aucun devis n'est encore disponible pour cette demande.");
            }
        } catch (err: any) {
            console.error("Failed to fetch quote", err);
            if (err.response?.status === 404) {
                alert("Votre devis est en cours de préparation par notre équipe technique. Veuillez réessayer plus tard.");
            } else if (err.response?.status === 403) {
                alert("Vous n'êtes pas autorisé à consulter ce devis.");
            } else {
                alert("Une erreur est survenue lors de la récupération du devis.");
            }
        }
    };

    const handleRespondToQuote = async (quoteId: number, response: 'ACCEPTED' | 'REJECTED') => {
        setIsRespondingToQuote(true);
        try {
            await repairService.respondToQuote(quoteId, response);
            setSuccess(`Devis ${response === 'ACCEPTED' ? 'accepté' : 'refusé'} avec succès !`);
            // Refresh quote and repairs
            const updatedQuote = await repairService.getQuoteByRequestId(selectedRepairQuote!.repairRequestId || 0);
            setSelectedRepairQuote(updatedQuote);
            fetchRepairs();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Failed to respond to quote", err);
            setError("Erreur lors de la réponse au devis.");
        } finally {
            setIsRespondingToQuote(false);
        }
    };

    const handleInitiatePayment = async (quoteId: number, method: 'CARD' | 'UPON_PICKUP') => {
        try {
            const res = await repairService.payQuote(quoteId, method);
            if (method === 'CARD' && res.result.startsWith('http')) {
                window.location.href = res.result;
            } else {
                setSuccess("Option de paiement enregistrée !");
                // Refresh
                const updatedQuote = await repairService.getQuoteByRequestId(selectedRepairQuote!.repairRequestId || 0);
                setSelectedRepairQuote(updatedQuote);
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            console.error("Failed to initiate payment", err);
            alert("Erreur lors de l'initiation du paiement.");
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
        <div className="min-h-screen bg-[#f8fafc] animate-mesh py-8 md:py-16 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 -z-10">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-wiki-btn/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Success/Error Toasts */}
                {success && (
                    <div className="fixed top-24 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-right duration-300">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold">{success}</span>
                    </div>
                )}
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md text-gray-600 hover:text-wiki-btn transition-all group border border-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight hidden sm:block">Mon <span className="text-wiki-btn">Espace</span></h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Session Sécurisée
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-2xl font-black text-xs transition-all shadow-sm shadow-red-100 border border-red-100 uppercase tracking-widest group"
                        >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <button
                        onClick={() => { setShowOrders(true); setShowRepairs(false); setShowClaims(false); setShowReviews(false); setShowSecurity(false); }}
                        className="group relative overflow-hidden p-6 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border-none transition-all hover:scale-[1.02] hover:shadow-2xl text-left"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-wiki-btn/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-wiki-btn shadow-inner">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Commandes</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tight">{orders.length}</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => { setShowOrders(false); setShowRepairs(false); setShowClaims(true); setShowReviews(false); setShowSecurity(false); }}
                        className="group relative overflow-hidden p-6 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border-none transition-all hover:scale-[1.02] hover:shadow-2xl text-left"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Réclamations</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tight">{claims.length}</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => { setShowOrders(false); setShowRepairs(false); setShowClaims(false); setShowReviews(true); setShowSecurity(false); }}
                        className="group relative overflow-hidden p-6 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border-none transition-all hover:scale-[1.02] hover:shadow-2xl text-left"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
                                <Star className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mes avis</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tight">{reviews.length}</p>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Avatar & Summary */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        <Card className="p-8 flex flex-col items-center text-center shadow-xl border-none bg-white relative overflow-hidden rounded-[2rem]">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-wiki-btn/10 to-emerald-400/10" />

                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 relative z-10 overflow-hidden group ring-4 ring-white shadow-lg border border-gray-100">
                                {user?.imageUrl ? (
                                    <Image src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" width={128} height={128} />
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
                                <h2 className="text-2xl font-black text-gray-900 mb-1 leading-tight">{user?.firstName} {user?.lastName}</h2>
                                <p className="text-wiki-btn font-bold text-sm mb-4">@{user?.username}</p>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {user?.role || 'CLIENT'}
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 shadow-xl border-none bg-white overflow-hidden group rounded-[2rem]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-50 text-wiki-btn rounded-xl">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-gray-800 tracking-tight">Sécurité</h3>
                                </div>
                                <Edit2 className="w-4 h-4 text-gray-300" />
                            </div>
                            <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
                                Protégez votre compte en mettant à jour votre mot de passe régulièrement.
                            </p>
                            <button
                                onClick={() => { setShowOrders(false); setShowRepairs(false); setShowClaims(false); setShowReviews(false); setShowSecurity(true); }}
                                className="w-full bg-[#004236] hover:bg-emerald-900 text-white font-black py-4 rounded-3xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group"
                            >
                                <span className="uppercase text-xs tracking-widest">Modifier</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Card>

                        <Card className="p-6 shadow-xl border-none bg-white overflow-hidden group rounded-[2rem]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-gray-800 tracking-tight">Menu</h3>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <button
                                    onClick={() => { setShowOrders(false); setShowRepairs(false); setShowClaims(false); setShowReviews(false); setShowSecurity(false); }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group/item ${!showOrders && !showRepairs && !showClaims && !showReviews && !showSecurity ? 'bg-emerald-50 text-wiki-btn' : 'hover:bg-gray-50 text-gray-600'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <UserIcon className={`w-4 h-4 ${!showOrders && !showRepairs && !showClaims && !showReviews && !showSecurity ? 'text-wiki-btn' : 'text-gray-400 group-hover/item:text-wiki-btn'}`} />
                                        <span className="text-xs font-bold">Détails du compte</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 opacity-50" />
                                </button>
                                <button
                                    onClick={() => { setShowOrders(false); setShowRepairs(false); setShowClaims(false); setShowReviews(false); setShowSecurity(true); }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group/item ${showSecurity ? 'bg-emerald-50 text-wiki-btn' : 'hover:bg-gray-50 text-gray-600'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Lock className={`w-4 h-4 ${showSecurity ? 'text-wiki-btn' : 'text-gray-400 group-hover/item:text-wiki-btn'}`} />
                                        <span className="text-xs font-bold">Sécurité</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 opacity-50" />
                                </button>
                                <button
                                    onClick={() => { setShowOrders(true); setShowRepairs(false); setShowClaims(false); setShowReviews(false); setShowSecurity(false); }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group/item ${showOrders ? 'bg-emerald-50 text-wiki-btn' : 'hover:bg-gray-50 text-gray-600'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingBag className={`w-4 h-4 ${showOrders ? 'text-wiki-btn' : 'text-gray-400 group-hover/item:text-wiki-btn'}`} />
                                        <span className="text-xs font-bold">Commandes</span>
                                    </div>
                                    <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-400 rounded-lg">{orders.length}</span>
                                </button>
                                <button
                                    onClick={() => { setShowOrders(false); setShowRepairs(true); setShowClaims(false); setShowReviews(false); setShowSecurity(false); }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group/item ${showRepairs ? 'bg-emerald-50 text-wiki-btn' : 'hover:bg-gray-50 text-gray-600'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Wrench className={`w-4 h-4 ${showRepairs ? 'text-wiki-btn' : 'text-gray-400 group-hover/item:text-wiki-btn'}`} />
                                        <span className="text-xs font-bold">Réparations</span>
                                    </div>
                                    <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-400 rounded-lg">{repairs.length}</span>
                                </button>
                                <button
                                    onClick={() => { setShowOrders(false); setShowRepairs(false); setShowClaims(true); setShowReviews(false); setShowSecurity(false); }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group/item ${showClaims ? 'bg-emerald-50 text-wiki-btn' : 'hover:bg-gray-50 text-gray-600'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className={`w-4 h-4 ${showClaims ? 'text-wiki-btn' : 'text-gray-400 group-hover/item:text-wiki-btn'}`} />
                                        <span className="text-xs font-bold">Réclamations</span>
                                    </div>
                                    <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-400 rounded-lg">{claims.length}</span>
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Details Form or View History */}
                    <div className="w-full lg:w-2/3">
                        {!showOrders && !showRepairs && !showClaims && !showReviews && !showSecurity ? (
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
                                            <p className="text-[11px] text-gray-500">L&apos;adresse email est synchronisée avec votre compte principal et ne peut être modifiée.</p>
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
                        ) : showOrders ? (
                            <Card className="p-5 md:p-10 shadow-xl border-none bg-white rounded-[2rem]">
                                <div className="flex flex-wrap justify-between items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                                    <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                        Historique <span className="text-wiki-btn">des commandes</span>
                                        <button 
                                            onClick={fetchOrders} 
                                            disabled={ordersLoading}
                                            className="p-2 hover:bg-slate-100 rounded-full transition-all"
                                            title="Actualiser"
                                        >
                                            <RefreshCw className={`w-4 h-4 text-gray-400 ${ordersLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </h1>
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
                                        <p className="text-xl font-bold text-gray-400">Vous n&apos;avez pas encore passé de commande.</p>
                                        <Link href="/" className="text-wiki-btn hover:underline mt-4 inline-block font-bold">Découvrir nos produits</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map((order: any, index: number) => (
                                            <div key={order.id || index} className="border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 hover:bg-slate-50 transition-all group">
                                                <div className="flex flex-wrap justify-between gap-3 mb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Commande #{order.id}</p>
                                                        <p className="text-sm md:text-lg font-bold text-gray-800">{new Date(order.orderDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getOrderStatusLabel(order.status).color}`}>
                                                            {getOrderStatusLabel(order.status).label}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg md:text-xl font-black text-wiki-btn">{formatPrice(order.totalAmount)}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter hidden sm:block">
                                                                {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Espèces livraison' :
                                                                    order.paymentMethod === 'CARD' ? 'Carte Bancaire' :
                                                                        order.paymentMethod || 'Non spécifié'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 border-t border-gray-100 pt-4">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Articles commandés</p>
                                                    <div className="space-y-2">
                                                        {order.items.map((item: any, idx: number) => (
                                                            <div key={item.id || idx} className="flex items-center justify-between bg-white p-3 md:p-4 rounded-xl border border-gray-100 transition-all hover:shadow-lg hover:shadow-gray-200/50 hover:border-wiki-btn/30 group/item gap-2">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="shrink-0 w-14 h-14 md:w-20 md:h-20 bg-white rounded-xl shadow-sm flex items-center justify-center p-1 md:p-2 border border-gray-100">
                                                                        <Image src={item.imageUrl || item.productImageUrl || '/assets/img/logo.png'} className="max-h-full object-contain" alt={item.productTitle || 'Produit'} width={80} height={80} />
                                                                    </div>
                                                                    <div className="space-y-1 min-w-0">
                                                                        <p className="text-xs md:text-sm font-black text-gray-900 line-clamp-2 leading-snug">{item.productTitle}</p>
                                                                        <p className="text-[10px] text-slate-500 font-bold hidden sm:block">PU: <span className="text-gray-700">{formatPrice(item.price)}</span></p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right shrink-0 pl-2 border-l border-gray-100">
                                                                    <p className="text-xs font-black text-slate-400 italic">×{item.quantity}</p>
                                                                    <p className="text-sm md:text-lg font-black text-wiki-btn">{formatPrice(item.price * item.quantity)}</p>
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
                        ) : showRepairs ? (
                            <Card className="p-5 md:p-10 shadow-xl border-none bg-white rounded-[2rem]">
                                <div className="flex flex-wrap justify-between items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                                    <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                        Mes <span className="text-wiki-btn">Réparations</span>
                                        <button 
                                            onClick={fetchRepairs} 
                                            disabled={repairsLoading}
                                            className="p-2 hover:bg-slate-100 rounded-full transition-all"
                                            title="Actualiser"
                                        >
                                            <RefreshCw className={`w-4 h-4 text-gray-400 ${repairsLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </h1>
                                    <button
                                        onClick={() => setShowRepairs(false)}
                                        className="text-gray-500 hover:text-wiki-btn font-bold flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Retour
                                    </button>
                                </div>

                                {repairsLoading ? (
                                    <div className="py-20 flex flex-col items-center">
                                        <Loader2 className="w-10 h-10 text-wiki-btn animate-spin" />
                                        <p className="mt-4 text-gray-500 font-bold">Chargement de vos réparations...</p>
                                    </div>
                                ) : repairs.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <Wrench className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <p className="text-xl font-bold text-gray-400">Aucune demande de réparation.</p>
                                        <Link href="/repair" className="text-wiki-btn hover:underline mt-4 inline-block font-bold">Faire une demande</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {repairs.map((repair: RepairRequest, index: number) => (
                                            <div key={repair.id || index} className="border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 hover:bg-slate-50 transition-all group">
                                                <div className="flex flex-col gap-3 mb-4">
                                                    <div className="flex flex-wrap justify-between items-start gap-2">
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Demande #{repair.id}</p>
                                                            <h4 className="text-sm md:text-lg font-bold text-gray-800">{repair.subject}</h4>
                                                            <p className="text-xs md:text-sm text-gray-500">{repair.deviceType} {repair.brand} {repair.model}</p>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRepairStatusLabel(repair.status || 'PENDING').color}`}>
                                                                {getRepairStatusLabel(repair.status || 'PENDING').label}
                                                            </div>
                                                            <button
                                                                onClick={() => handleViewQuote(repair.id!)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-wiki-btn/10 hover:bg-wiki-btn text-wiki-btn hover:text-white rounded-xl text-xs md:text-sm font-bold transition-all border border-wiki-btn/20"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" /> Devis
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-100 italic">
                                                    &quot;{repair.message}&quot;
                                                </div>
                                                <div className="mt-4 text-[10px] text-gray-400 uppercase font-black tracking-widest">
                                                    Soumis le {new Date(repair.createdAt!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        ) : showClaims ? (
                            <Card className="p-5 md:p-10 shadow-xl border-none bg-white rounded-[2rem]">
                                <div className="flex flex-wrap justify-between items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                                    <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                        Mes <span className="text-wiki-btn">Réclamations</span>
                                        <button 
                                            onClick={fetchClaims} 
                                            disabled={claimsLoading}
                                            className="p-2 hover:bg-slate-100 rounded-full transition-all"
                                            title="Actualiser"
                                        >
                                            <RefreshCw className={`w-4 h-4 text-gray-400 ${claimsLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </h1>
                                    <button
                                        onClick={() => setShowClaims(false)}
                                        className="text-gray-500 hover:text-wiki-btn font-bold flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Retour
                                    </button>
                                </div>

                                {claimsLoading ? (
                                    <div className="py-20 flex flex-col items-center">
                                        <Loader2 className="w-10 h-10 text-wiki-btn animate-spin" />
                                        <p className="mt-4 text-gray-500 font-bold">Chargement de vos réclamations...</p>
                                    </div>
                                ) : claims.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <p className="text-xl font-bold text-gray-400">Aucune réclamation en cours.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {claims.map((claim: any, index: number) => (
                                            <div key={claim.id || index} className="border border-gray-100 rounded-3xl p-6 hover:bg-slate-50 transition-all group">
                                                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ticket #{claim.id}</p>
                                                        <h4 className="text-lg font-bold text-gray-800">{claim.subject}</h4>
                                                    </div>
                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border self-start ${claim.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : claim.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                        {claim.status === 'RESOLVED' ? 'Résolue' : claim.status === 'IN_PROGRESS' ? 'En cours' : 'En attente'}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-100 italic mb-4">
                                                    &quot;{claim.message}&quot;
                                                </div>
                                                {claim.response && (
                                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <CheckCircle2 className="w-3 h-3" /> Réponse de l&apos;équipe
                                                        </p>
                                                        <p className="text-xs text-emerald-800 font-medium">{claim.response}</p>
                                                    </div>
                                                )}
                                                <div className="mt-4 text-[10px] text-gray-400 uppercase font-black tracking-widest">
                                                    Envoyé le {new Date(claim.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        ) : showReviews ? (
                            <Card className="p-8 md:p-10 shadow-xl border-none bg-white rounded-[2rem]">
                                <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                                        Mes <span className="text-wiki-btn">Avis</span>
                                        <button 
                                            onClick={fetchReviews} 
                                            disabled={reviewsLoading}
                                            className="p-2 hover:bg-slate-100 rounded-full transition-all"
                                            title="Actualiser"
                                        >
                                            <RefreshCw className={`w-4 h-4 text-gray-400 ${reviewsLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </h1>
                                    <button
                                        onClick={() => setShowReviews(false)}
                                        className="text-gray-500 hover:text-wiki-btn font-bold flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Retour
                                    </button>
                                </div>

                                {reviewsLoading ? (
                                    <div className="py-20 flex flex-col items-center">
                                        <Loader2 className="w-10 h-10 text-wiki-btn animate-spin" />
                                        <p className="mt-4 text-gray-500 font-bold">Chargement de vos avis...</p>
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <Star className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <p className="text-xl font-bold text-gray-400">Vous n&apos;avez pas encore laissé d&apos;avis.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {reviews.map((review: any, index: number) => (
                                            <div key={review.id || index} className="border border-gray-100 rounded-3xl p-6 hover:bg-slate-50 transition-all group">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-gray-100 italic text-sm text-gray-600 mb-2">
                                                    &quot;{review.comment}&quot;
                                                </div>
                                                <p className="text-xs font-bold text-wiki-btn">Produit #{review.productId}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        ) : (
                            <Card className="p-8 md:p-10 shadow-xl border-none bg-white rounded-[2rem]">
                                <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sécurité <span className="text-wiki-btn">du compte</span></h1>
                                    <button
                                        onClick={() => setShowSecurity(false)}
                                        className="text-gray-500 hover:text-wiki-btn font-bold flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Retour
                                    </button>
                                </div>

                                <div className="max-w-md mx-auto py-10">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-wiki-btn mx-auto mb-8 shadow-inner">
                                        <Lock className="w-10 h-10" />
                                    </div>
                                    
                                    <p className="text-center text-gray-500 mb-10 font-medium leading-relaxed">
                                        Pour garantir la sécurité de votre compte, nous vous recommandons de changer votre mot de passe régulièrement.
                                    </p>

                                    {passwordError && (
                                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm text-sm">
                                            {passwordError}
                                        </div>
                                    )}

                                    <form onSubmit={handlePasswordChange} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ancien mot de passe</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-wiki-btn/10 focus:border-wiki-btn focus:bg-white transition-all text-gray-800 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-wiki-btn/10 focus:border-wiki-btn focus:bg-white transition-all text-gray-800 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmer le nouveau mot de passe</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-wiki-btn/10 focus:border-wiki-btn focus:bg-white transition-all text-gray-800 font-medium"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={passwordSaving}
                                            className="w-full bg-wiki-btn hover:bg-emerald-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-wiki-btn/30 transition-all flex items-center justify-center gap-3 disabled:bg-gray-400 mt-8 group"
                                        >
                                            {passwordSaving ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            )}
                                            Confirmer le changement
                                        </button>
                                    </form>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Quote Modal */}
            {selectedRepairQuote && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl scale-in-center">
                        <div className="p-5 md:p-8 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight">Détails <span className="text-wiki-btn">du Devis</span></h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Référence: #{selectedRepairQuote.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedRepairQuote(null)}
                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-5 md:p-8 max-h-[75vh] overflow-y-auto">
                            <div className="space-y-6">
                                {/* Quote Lines */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Détails des prestations
                                    </h4>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                                        {selectedRepairQuote.lines.map((line, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-white transition-all">
                                                <span className="font-bold text-gray-700">{line.title}</span>
                                                <span className="font-black text-wiki-btn">{formatPrice(line.price)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center p-5 bg-wiki-btn text-white">
                                            <span className="text-lg font-black uppercase tracking-widest">Total</span>
                                            <span className="text-2xl font-black">{formatPrice(selectedRepairQuote.totalPrice)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Note */}
                                {selectedRepairQuote.adminNote && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Note du technicien</h4>
                                        <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl text-blue-800 text-sm italic leading-relaxed">
                                            &quot;{selectedRepairQuote.adminNote}&quot;
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                {selectedRepairQuote.status === 'SENT' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                                        <button
                                            onClick={() => handleRespondToQuote(selectedRepairQuote.id, 'ACCEPTED')}
                                            disabled={isRespondingToQuote}
                                            className="bg-wiki-btn hover:bg-emerald-800 text-white font-black py-3 md:py-4 rounded-2xl shadow-xl shadow-wiki-btn/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-sm md:text-base"
                                        >
                                            <CheckCircle className="w-5 h-5" /> Accepter le devis
                                        </button>
                                        <button
                                            onClick={() => handleRespondToQuote(selectedRepairQuote.id, 'REJECTED')}
                                            disabled={isRespondingToQuote}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 font-black py-3 md:py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-sm md:text-base"
                                        >
                                            <XCircle className="w-5 h-5" /> Refuser
                                        </button>
                                    </div>
                                )}

                                {/* Payment Options if accepted and unpaid */}
                                {selectedRepairQuote.status === 'ACCEPTED' && selectedRepairQuote.paymentStatus === 'UNPAID' && (
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-wiki-btn" /> Choisir un mode de paiement
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => handleInitiatePayment(selectedRepairQuote.id, 'CARD')}
                                                className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-100 hover:border-wiki-btn rounded-2xl transition-all group"
                                            >
                                                <CreditCard className="w-8 h-8 text-gray-400 group-hover:text-wiki-btn transition-colors" />
                                                <span className="font-bold text-gray-700">Payer par carte</span>
                                            </button>
                                            <button
                                                onClick={() => handleInitiatePayment(selectedRepairQuote.id, 'UPON_PICKUP')}
                                                className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-100 hover:border-wiki-btn rounded-2xl transition-all group"
                                            >
                                                <HandCoins className="w-8 h-8 text-gray-400 group-hover:text-wiki-btn transition-colors" />
                                                <span className="font-bold text-gray-700">Payer à la récupération</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedRepairQuote.status === 'ACCEPTED' && selectedRepairQuote.paymentStatus === 'PAID' && (
                                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-center gap-4 text-emerald-800">
                                        <CheckCircle className="w-10 h-10" />
                                        <div>
                                            <p className="font-black uppercase tracking-widest text-xs mb-1">Paiement Confirmé</p>
                                            <p className="text-sm font-bold">Votre réparation sera traitée en priorité. Nous vous contacterons dès qu&apos;elle sera prête.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ProfilePage;
