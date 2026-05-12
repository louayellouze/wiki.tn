"use client";

import React, { useState, useEffect } from "react";
import { 
    Search, 
    CreditCard, 
    Calendar, 
    User, 
    DollarSign, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Download,
    Eye,
    TrendingUp,
    ShieldCheck,
    Check,
    X
} from "lucide-react";
import { getAllPayments, getTotalPayments, validatePayment, Payment } from "@/services/payment.service";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Payments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsData, statsData] = await Promise.all([
                getAllPayments(),
                getTotalPayments()
            ]);
            setPayments(paymentsData);
            setTotal(statsData.total);
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleValidate = async (orderId: number) => {
        if (!confirm("Voulez-vous vraiment valider ce paiement manuellement ?")) return;
        
        try {
            await validatePayment(orderId);
            // Refresh data
            fetchData();
        } catch (error) {
            console.error("Error validating payment:", error);
            alert("Erreur lors de la validation du paiement.");
        }
    };

    const filteredPayments = payments.filter(p => 
        p.orderId.toString().includes(searchTerm) || 
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'FAILED': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
            default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS': return <CheckCircle size={14} />;
            case 'FAILED': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-wiki-btn/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-wiki-btn/20 flex items-center justify-center text-wiki-btn">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total des Paiements</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{total.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} <span className="text-sm font-bold text-gray-400">TND</span></h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Paiements Réussis</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{payments.filter(p => p.status === 'SUCCESS').length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-600">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mode Stripe (Carte)</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{payments.filter(p => p.method === 'STRIPE').length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Gestion des Paiements</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Consultez et gérez l'historique de toutes les transactions</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher une commande, un client..."
                                className="pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-4 focus:ring-wiki-btn/10 focus:border-wiki-btn transition-all w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={fetchData}
                            className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-500 hover:text-wiki-btn transition-colors border border-gray-200 dark:border-gray-700"
                        >
                            <Calendar size={20} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-wiki-btn text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity">
                            <Download size={18} />
                            Exporter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">ID Payment</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Commande</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Client</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Montant</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Méthode</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">Statut</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td colSpan={8} className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-gray-400">#{payment.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                                    <CreditCard size={14} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">Commande #{payment.orderId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-wiki-btn/10 flex items-center justify-center text-wiki-btn">
                                                    <User size={14} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{payment.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 dark:text-white">{payment.amount.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND</span>
                                                {payment.method === 'STRIPE' && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Frais Inclus</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                payment.method === 'STRIPE' ? "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800" : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700"
                                            )}>
                                                {payment.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {format(new Date(payment.paymentDate), 'dd MMM yyyy', { locale: fr })}
                                                </span>
                                                <span className="text-xs text-gray-400 font-bold uppercase">
                                                    {format(new Date(payment.paymentDate), 'HH:mm')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                getStatusColor(payment.status)
                                            )}>
                                                {getStatusIcon(payment.status)}
                                                {payment.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setIsDetailModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-wiki-btn transition-colors rounded-lg hover:bg-wiki-btn/5" 
                                                    title="Voir détails"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {payment.status === 'PENDING' && (
                                                    <button 
                                                        onClick={() => handleValidate(payment.orderId)}
                                                        className="p-2 text-emerald-500 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50" 
                                                        title="Valider manuellement"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300">
                                                <DollarSign size={32} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">Aucun paiement trouvé</p>
                                                <p className="text-sm text-gray-500">Essayez de modifier vos critères de recherche.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Modern Table Footer */}
                {!loading && filteredPayments.length > 0 && (
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Affichage de <span className="font-bold text-gray-900 dark:text-white">{filteredPayments.length}</span> sur <span className="font-bold text-gray-900 dark:text-white">{payments.length}</span> transactions
                        </p>
                        <div className="flex gap-2">
                            <button disabled className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-400 bg-white dark:bg-gray-800 disabled:opacity-50">Précédent</button>
                            <button disabled className="px-4 py-2 rounded-xl border border-wiki-btn text-wiki-btn bg-wiki-btn/5 text-sm font-bold">1</button>
                            <button disabled className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 bg-white dark:bg-gray-800 disabled:opacity-50">Suivant</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Detail Modal */}
            {isDetailModalOpen && selectedPayment && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setIsDetailModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800 animate-in zoom-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-wiki-btn/10 flex items-center justify-center text-wiki-btn">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase">Détail du Paiement</h2>
                                    <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">Transaction #{selectedPayment.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Commande</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">#{selectedPayment.orderId}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Montant Total</p>
                                    <p className="text-sm font-black text-wiki-btn">{selectedPayment.amount.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <User size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Client</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">{selectedPayment.username}</span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <Calendar size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Date & Heure</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {format(new Date(selectedPayment.paymentDate), 'dd MMMM yyyy HH:mm', { locale: fr })}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <DollarSign size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Méthode</span>
                                    </div>
                                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{selectedPayment.method}</span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <CreditCard size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">ID Transaction</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300 break-all ml-4 text-right">{selectedPayment.transactionId || 'N/A'}</span>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <Clock size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Statut</span>
                                    </div>
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                        getStatusColor(selectedPayment.status)
                                    )}>
                                        {getStatusIcon(selectedPayment.status)}
                                        {selectedPayment.status}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button 
                                onClick={() => setIsDetailModalOpen(false)}
                                className="flex-1 px-6 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                            >
                                Fermer
                            </button>
                            <a 
                                href={`/orders?id=${selectedPayment.orderId}`}
                                className="flex-1 px-6 py-3 rounded-2xl bg-wiki-btn text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-wiki-btn/20"
                            >
                                <Eye size={18} />
                                Voir la commande
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
