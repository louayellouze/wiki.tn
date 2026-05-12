"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    Eye,
    Package,
    Calendar,
    User,
    MapPin,
    CreditCard,
    ChevronRight,
    X,
    AlertCircle,
    CheckCircle2,
    Clock,
    Truck,
    Ban,
    Plus,
    ShoppingCart,
    Trash,
    Edit as EditIcon
} from "lucide-react";
import { getOrders, updateOrderStatus, createOrder, updateOrder, deleteOrder } from "@/services/order.service";
import { getProducts } from "@/services/product.service";
import { getClients } from "@/services/user.service";
import { Order, OrderStatus, OrderRequest } from "@/dtos/order.dto";
import { Product } from "@/dtos/product.dto";
import { UserResponse } from "@/dtos/user.dto";
import { isAdmin, isWebmaster, isInfoline } from "@/services/auth.service";
import Link from "next/link";

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Data for creation/edit modal
    const [products, setProducts] = useState<Product[]>([]);
    const [clients, setClients] = useState<UserResponse[]>([]);
    const [orderFormData, setOrderFormData] = useState<OrderRequest>({
        items: [],
        address: "",
        postalCode: "",
        phone: "",
        username: "",
        paymentMethod: "CASH_ON_DELIVERY"
    });

    const [isClient, setIsClient] = useState(false);

    const searchParams = useSearchParams();
    const orderIdParam = searchParams.get("id");

    useEffect(() => {
        setIsClient(true);
        fetchOrders(currentPage);
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        if (orderIdParam && orders.length > 0) {
            const order = orders.find(o => o.id.toString() === orderIdParam);
            if (order) {
                setSelectedOrder(order);
                setIsDetailModalOpen(true);
            }
        }
    }, [orderIdParam, orders]);

    const fetchOrders = async (page: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getOrders(page, itemsPerPage);
            if (response && 'content' in response) {
                setOrders(response.content);
                setTotalPages(response.totalPages);
                setTotalElements(response.totalElements);
            } else {
                setOrders(response as Order[]);
            }
        } catch (err: any) {
            console.error("Error fetching orders:", err);
            setError(err.message || "Impossible de charger les commandes");
        } finally {
            setLoading(false);
        }
    };

    const fetchModalData = async () => {
        try {
            const [p, c] = await Promise.all([getProducts(), getClients()]);
            
            // Handle potentially paginated responses from dependencies
            if (p && 'content' in p) setProducts(p.content);
            else setProducts(p as Product[]);
            
            if (c && 'content' in c) setClients(c.content);
            else setClients(c as UserResponse[]);
        } catch (error) {
            console.error("Error fetching modal data:", error);
        }
    };

    const handleOpenCreate = () => {
        setModalMode("create");
        setOrderFormData({ items: [], address: "", postalCode: "", phone: "", username: "", paymentMethod: "CASH_ON_DELIVERY" });
        fetchModalData();
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (order: Order) => {
        setModalMode("edit");
        setSelectedOrderId(order.id);
        setOrderFormData({
            items: order.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            })),
            address: order.address,
            postalCode: order.postalCode,
            phone: order.phone,
            username: order.username,
            paymentMethod: order.paymentMethod
        });
        fetchModalData();
        setIsCreateModalOpen(true);
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (orderFormData.items.length === 0) {
            alert("Veuillez ajouter au moins un produit.");
            return;
        }
        try {
            if (modalMode === "create") {
                await createOrder(orderFormData);
            } else {
                if (selectedOrderId) {
                    await updateOrder(selectedOrderId, orderFormData);
                }
            }
            setIsCreateModalOpen(false);
            fetchOrders(currentPage);
            setOrderFormData({ items: [], address: "", postalCode: "", phone: "", username: "", paymentMethod: "CASH_ON_DELIVERY" });
        } catch (error: any) {
            alert(`Erreur: ${error.message}`);
        }
    };

    const handleDeleteOrder = async () => {
        if (!orderToDelete) return;
        try {
            await deleteOrder(orderToDelete.id);
            setIsDeleteModalOpen(false);
            setOrderToDelete(null);
            fetchOrders(currentPage);
        } catch (error: any) {
            alert(`Erreur: ${error.message}`);
        }
    };

    const handleStatusUpdate = async (id: number, status: OrderStatus) => {
        try {
            await updateOrderStatus(id, status);
            fetchOrders(currentPage);
            if (selectedOrder?.id === id) {
                setSelectedOrder(prev => prev ? { ...prev, status } : null);
            }
        } catch (error: any) {
            alert(`Erreur: ${error.message}`);
        }
    };

    const getStatusStyle = (status: OrderStatus) => {
        switch (status) {
            case "PENDING":
                return { label: "En attente", icon: <Clock size={14} />, style: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" };
            case "AWAITING_PAYMENT":
                return { label: "En attente de paiement", icon: <CreditCard size={14} />, style: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" };
            case "CONFIRMED":
                return { label: "Confirmée", icon: <CheckCircle2 size={14} />, style: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" };
            case "SHIPPED":
                return { label: "Expédiée", icon: <Truck size={14} />, style: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
            case "DELIVERED":
                return { label: "Livrée", icon: <CheckCircle2 size={14} />, style: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
            case "CANCELLED":
                return { label: "Annulée", icon: <Ban size={14} />, style: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" };
            case "DELIVERED_TO_STORE":
                return { label: "Livré au magasin", icon: <Package size={14} />, style: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" };
            case "EXCHANGE":
                return { label: "Echange", icon: <ShoppingCart size={14} />, style: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" };
            case "IN_DELIVERY_ARAMEX":
                return { label: "Livraison Aramex", icon: <Truck size={14} />, style: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" };
            case "SMT":
                return { label: "SMT", icon: <Truck size={14} />, style: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300" };
            case "ARTICLE_BEING_PURCHASED":
                return { label: "Article en cours d'achat", icon: <ShoppingCart size={14} />, style: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" };
            case "AWAITING_RESTOCK":
                return { label: "Attente réappro", icon: <Clock size={14} />, style: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
            case "PC_BEING_ASSEMBLED":
                return { label: "PC en montage", icon: <Package size={14} />, style: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" };
            case "ORDER_BEING_PICKED_UP":
                return { label: "En ramassage", icon: <Package size={14} />, style: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" };
            case "TRANSFERRED_TO_STORE_FACILITY_PAYMENT":
                return { label: "Transf. Mag (Facilité)", icon: <CreditCard size={14} />, style: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" };
            case "TRANSFERRED_TO_STORE_CHECK_PAYMENT":
                return { label: "Transf. Mag (Chèque)", icon: <CreditCard size={14} />, style: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300" };
            case "UNREACHABLE_NUMBER":
                return { label: "Numéro injoignable", icon: <AlertCircle size={14} />, style: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" };
            case "AWAITING_AVAILABILITY_CHECK":
                return { label: "Vérif. disponibilité", icon: <Search size={14} />, style: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" };
            case "ORDER_ARRIVED_AT_STORE":
                return { label: "Arrivée au magasin", icon: <Package size={14} />, style: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300" };
            case "IN_DELIVERY_OWN_MEANS":
                return { label: "Livraison interne", icon: <Truck size={14} />, style: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" };
            case "AWAITING_CLIENT_RESPONSE":
                return { label: "Attente rép client", icon: <User size={14} />, style: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300" };
            default:
                return { label: status, icon: null, style: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" };
        }
    };

    const filteredOrders = orders.filter(o =>
        o.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toString().includes(searchTerm)
    );

    return (
        <div className="mx-auto max-w-full py-4 sm:py-6">
            <div className="mb-8 items-start justify-between flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Commandes Clients</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Suivi et gestion des ventes</p>
                </div>
                {isClient && isInfoline() && (
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
                    >
                        <Plus size={18} />
                        Nouvelle Commande
                    </button>
                )}
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par client ou N° commande..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
                    <AlertCircle size={20} />
                    <p className="font-medium">{error}</p>
                    <button onClick={() => fetchOrders(currentPage)} className="ml-auto text-sm underline hover:no-underline">Réessayer</button>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">N° Commande</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Client</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Date</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Total (DT)</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Statut</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-2"></div>
                                    <p>Chargement des commandes...</p>
                                </td>
                            </tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <Package className="mx-auto mb-3 text-gray-300" size={48} />
                                    <p>Aucune commande trouvée</p>
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => {
                                const status = getStatusStyle(order.status);
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm font-semibold text-indigo-600">#{order.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                    <User size={14} className="text-gray-400" />
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white uppercase">{order.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                                            {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {order.totalAmount.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} DT
                                            </div>
                                            {order.discountAmount ? (
                                                <div className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                                    Code: {order.couponCode}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.style}`}>
                                                {status.icon}
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setIsDetailModalOpen(true); }}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                                                    title="Voir détails"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {isClient && isInfoline() && (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenEdit(order)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                            title="Modifier"
                                                        >
                                                            <EditIcon size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setOrderToDelete(order); setIsDeleteModalOpen(true); }}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                            title="Supprimer"
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination UI */}
            {!loading && totalPages > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Affichage de <span className="font-semibold text-gray-900 dark:text-white">{currentPage * itemsPerPage + 1}</span> à{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.min((currentPage + 1) * itemsPerPage, totalElements)}
                        </span>{" "}
                        sur <span className="font-semibold text-gray-900 dark:text-white">{totalElements}</span> commandes
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Précédent
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                                        currentPage === i
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages - 1}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {isDetailModalOpen && selectedOrder && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setIsDetailModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between border-b pb-4 dark:border-gray-700">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Commande #{selectedOrder.id}</h2>
                                <p className="text-sm text-gray-500">Passée le {new Date(selectedOrder.orderDate).toLocaleString('fr-FR')}</p>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600"><User size={20} /></div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-400">Informations Client</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white uppercase">{selectedOrder.username}</p>
                                        <p className="text-sm text-gray-500">ID Utilisateur: {selectedOrder.userId}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600"><MapPin size={20} /></div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-400">Adresse de Livraison</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedOrder.address}</p>
                                        <p className="text-sm text-gray-500">Code Postal: {selectedOrder.postalCode}</p>
                                        {selectedOrder.phone && (
                                            <p className="text-sm font-bold text-indigo-600 mt-1 flex items-center gap-1">
                                                <small className="text-gray-400 uppercase text-[10px]">Tél:</small> {selectedOrder.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600"><CreditCard size={20} /></div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-400">Mode de Paiement</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {selectedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'Espèces à la livraison' :
                                                selectedOrder.paymentMethod === 'CARD' ? 'Carte Bancaire' :
                                                    selectedOrder.paymentMethod === 'STRIPE' ? 'Paiement en ligne (Stripe)' :
                                                        selectedOrder.paymentMethod || 'Non spécifié'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold uppercase text-gray-400">Statut de la Commande</p>
                                        <button 
                                            onClick={() => window.location.href = "/"}
                                            className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                        >
                                            <ChevronRight size={10} className="rotate-180" /> Retour Dashboard
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {([
                                             "PENDING", "AWAITING_PAYMENT", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED",
                                             "DELIVERED_TO_STORE", "EXCHANGE", "IN_DELIVERY_ARAMEX",
                                             "SMT", "ARTICLE_BEING_PURCHASED", "AWAITING_RESTOCK",
                                             "PC_BEING_ASSEMBLED", "ORDER_BEING_PICKED_UP",
                                             "TRANSFERRED_TO_STORE_FACILITY_PAYMENT", "TRANSFERRED_TO_STORE_CHECK_PAYMENT",
                                             "UNREACHABLE_NUMBER", "AWAITING_AVAILABILITY_CHECK",
                                             "ORDER_ARRIVED_AT_STORE", "IN_DELIVERY_OWN_MEANS",
                                             "AWAITING_CLIENT_RESPONSE"
                                         ] as OrderStatus[]).map(s => (
                                             <button
                                                 key={s}
                                                 onClick={() => !isAdmin() && handleStatusUpdate(selectedOrder.id, s)}
                                                 disabled={isAdmin()}
                                                 className={`px-3 py-2 text-[10px] font-bold rounded-lg border transition-all text-center leading-tight ${selectedOrder.status === s ? "bg-indigo-600 border-indigo-600 text-white shadow-md" : "bg-white border-gray-200 text-gray-700 hover:border-indigo-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"} ${isAdmin() ? "opacity-70 cursor-not-allowed" : ""}`}
                                             >
                                                 {getStatusStyle(s).label}
                                             </button>
                                         ))}
                                     </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Articles Commandés</h3>
                                <div className="rounded-xl border dark:border-gray-700 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Produit</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Prix</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Qté</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-700">
                                            {selectedOrder.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {item.productImageUrl ? (
                                                                <img src={item.productImageUrl} className="h-8 w-8 rounded object-cover" />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><Package size={14} className="text-gray-400" /></div>
                                                            )}
                                                            <Link 
                                                                href={`/products/${item.productId}`}
                                                                className="text-sm font-medium dark:text-white hover:text-indigo-600 hover:underline transition-colors"
                                                            >
                                                                {item.productTitle}
                                                            </Link>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm">{item.price.toLocaleString('fr-TN')} DT</td>
                                                    <td className="px-4 py-3 text-center text-sm">x{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-sm font-bold">{(item.price * item.quantity).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} DT</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-bold">
                                            {selectedOrder.discountAmount ? (
                                                <>
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-3 text-right text-gray-500 text-sm">Sous-total</td>
                                                        <td className="px-4 py-3 text-right text-gray-500 text-sm">{(selectedOrder.totalAmount + selectedOrder.discountAmount).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} DT</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-3 text-right text-emerald-600 text-sm">
                                                            Réduction (Coupon: <span className="font-black bg-emerald-100 px-1.5 py-0.5 rounded text-xs">{selectedOrder.couponCode}</span>)
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-emerald-600 text-sm">- {selectedOrder.discountAmount.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} DT</td>
                                                    </tr>
                                                </>
                                            ) : null}
                                            <tr>
                                                <td colSpan={3} className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">TOTAL</td>
                                                <td className="px-4 py-3 text-right text-indigo-600 text-lg">{selectedOrder.totalAmount.toLocaleString('fr-TN', { minimumFractionDigits: 3 })} DT</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end border-t pt-6 dark:border-gray-700">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="flex items-center gap-2 rounded-xl bg-gray-100 px-8 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-all active:scale-95 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                <X size={18} /> Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Order Modal */}
            {isCreateModalOpen && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setIsCreateModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-4xl rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800 max-h-[95vh] overflow-y-auto border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                                    <ShoppingCart size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        {modalMode === "create" ? "Nouvelle Commande" : `Modifier Commande #${selectedOrderId}`}
                                    </h2>
                                    <p className="text-sm text-gray-500 font-medium">
                                        {modalMode === "create" ? "Créez une vente pour un client existant ou nouveau" : "Mettre à jour les informations de la commande"}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitOrder} className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Side: Client & Delivery Info */}
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
                                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                            <User size={16} /> Informations Client
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-1.5 block text-xs font-bold text-gray-500">Nom d'utilisateur / Client <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    list="clients-list"
                                                    required
                                                    value={orderFormData.username}
                                                    onChange={(e) => setOrderFormData({ ...orderFormData, username: e.target.value })}
                                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                                    placeholder="Chercher ou saisir un nouveau nom..."
                                                />
                                                <datalist id="clients-list">
                                                    {clients.map(c => <option key={c.id} value={c.username}>{c.firstName} {c.lastName}</option>)}
                                                </datalist>
                                                <p className="mt-1.5 text-[10px] text-gray-400">Si le nom n'existe pas, un compte sera créé automatiquement.</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="mb-1.5 block text-xs font-bold text-gray-500">Adresse de Livraison <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                        <input
                                                            type="text"
                                                            required
                                                            value={orderFormData.address}
                                                            onChange={(e) => setOrderFormData({ ...orderFormData, address: e.target.value })}
                                                            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                                            placeholder="Ex: Rue 123, Tunis"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="mb-1.5 block text-xs font-bold text-gray-500">Code Postal <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={orderFormData.postalCode}
                                                        onChange={(e) => setOrderFormData({ ...orderFormData, postalCode: e.target.value })}
                                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                                        placeholder="Ex: 1000"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="mb-1.5 block text-xs font-bold text-gray-500">Numéro de Téléphone <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={orderFormData.phone}
                                                        onChange={(e) => setOrderFormData({ ...orderFormData, phone: e.target.value })}
                                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                                        placeholder="Ex: 22 333 444"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-xs font-bold text-gray-500">Mode de Paiement <span className="text-red-500">*</span></label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOrderFormData({ ...orderFormData, paymentMethod: "CASH_ON_DELIVERY" })}
                                                        className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${orderFormData.paymentMethod === "CASH_ON_DELIVERY" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-500"}`}
                                                    >
                                                        Espèces
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOrderFormData({ ...orderFormData, paymentMethod: "CARD" })}
                                                        className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${orderFormData.paymentMethod === "CARD" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-500"}`}
                                                    >
                                                        Carte
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Cart Summary */}
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 dark:border-indigo-900/20 dark:bg-indigo-900/10 flex flex-col h-full">
                                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-indigo-600 flex items-center justify-between">
                                            <span className="flex items-center gap-2"><ShoppingCart size={16} /> Panier</span>
                                            <span className="text-xs lowercase font-medium">{orderFormData.items.length} article(s)</span>
                                        </h3>

                                        <div className="flex-1 overflow-y-auto max-h-[300px] mb-4 space-y-3 pr-2 custom-scrollbar">
                                            {orderFormData.items.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-10 text-indigo-300">
                                                    <ShoppingCart size={40} className="mb-2 opacity-50" />
                                                    <p className="text-xs font-bold">Le panier est vide</p>
                                                </div>
                                            ) : (
                                                orderFormData.items.map((item, idx) => {
                                                    const product = products.find(p => p.id === item.productId);
                                                    const price = product?.discountPrice && product.discountPrice > 0 ? product.discountPrice : product?.regularPrice || 0;
                                                    return (
                                                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-indigo-100/50 dark:border-indigo-900/30">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                                                    {product?.images?.[0]?.imageUrl ? (
                                                                        <img src={product.images[0].imageUrl} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <div className="h-full w-full flex items-center justify-center text-gray-400"><Package size={16} /></div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{product?.title}</p>
                                                                    <p className="text-[10px] text-gray-500 font-bold">{price.toLocaleString('fr-TN')} DT</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max={product?.quantity || 1}
                                                                        value={item.quantity}
                                                                        onChange={(e) => {
                                                                            const newItems = [...orderFormData.items];
                                                                            newItems[idx].quantity = parseInt(e.target.value);
                                                                            setOrderFormData({ ...orderFormData, items: newItems });
                                                                        }}
                                                                        className="w-10 bg-transparent text-center text-xs font-black outline-none dark:text-white"
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setOrderFormData({ ...orderFormData, items: orderFormData.items.filter((_, i) => i !== idx) });
                                                                    }}
                                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <Trash size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>

                                        <div className="border-t border-indigo-100 pt-4 dark:border-indigo-900/30 mt-auto">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm font-bold text-indigo-400">Total Commande</span>
                                                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                                                    {orderFormData.items.reduce((acc, item) => {
                                                        const product = products.find(p => p.id === item.productId);
                                                        const price = product?.discountPrice && product.discountPrice > 0 ? product.discountPrice : product?.regularPrice || 0;
                                                        return acc + (price * item.quantity);
                                                    }, 0).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} <span className="text-xs font-bold">DT</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center Section: Product Selection Selector */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                    <Plus size={16} /> Sélection des Articles
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="mb-1.5 block text-xs font-bold text-gray-500">Ajouter un produit</label>
                                        <select
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                const pid = parseInt(e.target.value);
                                                if (orderFormData.items.some(i => i.productId === pid)) {
                                                    alert("Ce produit est déjà dans le panier.");
                                                    return;
                                                }
                                                setOrderFormData({
                                                    ...orderFormData,
                                                    items: [...orderFormData.items, { productId: pid, quantity: 1 }]
                                                });
                                                e.target.value = "";
                                            }}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all appearance-none"
                                        >
                                            <option value="">-- Sélectionner un produit (vérification stock) --</option>
                                            {products.map(p => {
                                                const isOutOfStock = (p.quantity || 0) <= 0 || p.stockStatus === "HORS_STOCK";
                                                return (
                                                    <option key={p.id} value={p.id} disabled={isOutOfStock}>
                                                        {p.title} {isOutOfStock ? "(HORS STOCK)" : `- Stock: ${p.quantity}`} ({(p.discountPrice || p.regularPrice)?.toLocaleString('fr-TN')} DT)
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <div className="flex h-[52px] w-full items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100 text-xs font-bold px-4 text-center">
                                            Stock déduit automatiquement à la validation
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                >
                                    <X size={16} /> Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-indigo-600 px-12 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                                    disabled={orderFormData.items.length === 0}
                                >
                                    {modalMode === "create" ? "Valider la Commande" : "Enregistrer les modifications"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && orderToDelete && (
                <div 
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => { setIsDeleteModalOpen(false); setOrderToDelete(null); }}
                >
                    <div 
                        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800 border border-red-500/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
                                <Trash className="text-red-600" size={32} />
                            </div>
                            <button onClick={() => { setIsDeleteModalOpen(false); setOrderToDelete(null); }} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <h3 className="mb-2 text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Supprimer la commande</h3>
                        <p className="mb-8 text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                            Êtes-vous sûr de vouloir supprimer la commande <span className="text-red-600 font-bold">#{orderToDelete.id}</span> ?
                            <br />
                            Cette action est définitive.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setIsDeleteModalOpen(false); setOrderToDelete(null); }} className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all">
                                <X size={16} /> Annuler
                            </button>
                            <button onClick={handleDeleteOrder} className="rounded-xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Orders;
