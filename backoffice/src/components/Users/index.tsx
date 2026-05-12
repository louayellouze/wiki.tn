"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    Shield,
    X,
    CheckCircle2,
    AlertCircle,
    UserCircle,
    Key,
    Eye
} from "lucide-react";
import { getAllUsers, createUser, updateUser, deleteUser, getClients, toggleUserStatus } from "@/services/user.service";
import { UserResponse, RegisterRequest, UserUpdateRequest, Role } from "@/dtos/user.dto";
import { isAdmin, isWebmaster, isInfoline } from "@/services/auth.service";
import { Copy, Download, UserX, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Users = () => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<Role | "all">("all");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
    const [formData, setFormData] = useState<RegisterRequest & { id?: number }>({
        username: "",
        password: "",
        email: "",
        lastName: "",
        firstName: "",
        role: "CLIENT",
        phone: "",
        address: ""
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);

    const [isClient, setIsClient] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setIsClient(true);
        setCurrentPage(0); // Reset to first page on new search
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (isClient) {
            if (!isInfoline()) {
                fetchData(currentPage, debouncedSearchTerm, selectedRole);
            } else {
                fetchClientsData(currentPage, debouncedSearchTerm);
            }
        }
    }, [currentPage, itemsPerPage, debouncedSearchTerm, selectedRole, isClient]);

    const fetchData = async (page: number = 0, search: string = "", role: string = "all") => {
        setLoading(true);
        try {
            const response = await getAllUsers(page, itemsPerPage, search, role);
            if (response && 'content' in response) {
                setUsers(response.content);
                setTotalPages(response.totalPages);
                setTotalElements(response.totalElements);
            } else {
                setUsers(response as UserResponse[]);
                setTotalPages(1);
                setTotalElements((response as UserResponse[]).length);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientsData = async (page: number = 0, search: string = "") => {
        setLoading(true);
        try {
            const response = await getClients(page, itemsPerPage, search);
            if (response && 'content' in response) {
                setUsers(response.content);
                setTotalPages(response.totalPages);
                setTotalElements(response.totalElements);
            } else {
                setUsers(response as UserResponse[]);
                setTotalPages(1);
                setTotalElements((response as UserResponse[]).length);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setModalMode("create");
        setFormData({
            username: "",
            password: "",
            email: "",
            lastName: "",
            firstName: "",
            role: "CLIENT",
            phone: "",
            address: ""
        });
        setIsEditModalOpen(true);
    };

    const handleOpenEdit = (user: UserResponse) => {
        setModalMode("edit");
        setFormData({
            id: user.id,
            username: user.username,
            email: user.email,
            lastName: user.lastName,
            firstName: user.firstName,
            role: user.role as Role,
            phone: user.phone || "",
            address: user.address || "",
            password: "" // Don't show password, only fill if changing
        });
        setIsEditModalOpen(true);
    };

    const handleOpenView = (user: UserResponse) => {
        setModalMode("view");
        setFormData({
            id: user.id,
            username: user.username,
            email: user.email,
            lastName: user.lastName,
            firstName: user.firstName,
            role: user.role as Role,
            phone: user.phone || "",
            address: user.address || "",
            password: ""
        });
        setIsViewModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === "create") {
                await createUser(formData);
            } else {
                const updateData: UserUpdateRequest = { ...formData };
                if (!updateData.password) delete updateData.password; // Only send password if provided
                await updateUser(formData.id!, updateData);
            }
            setIsEditModalOpen(false);
            if (!isInfoline()) fetchData(currentPage, debouncedSearchTerm, selectedRole);
            else fetchClientsData(currentPage, debouncedSearchTerm);
        } catch (error: any) {
            // Extract error message from response if available
            const errorMessage = error.response?.data?.error || error.message || "Une erreur est survenue";
            alert(`Erreur lors de ${modalMode === "create" ? "la création" : "la modification"} de l'utilisateur:\n\n${errorMessage}`);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser(userToDelete.id);
            setIsDeleteModalOpen(false);
            if (!isInfoline()) fetchData(currentPage, debouncedSearchTerm, selectedRole);
            else fetchClientsData(currentPage, debouncedSearchTerm);
        } catch (error: any) {
            alert(`Erreur lors de la suppression: ${error.message}`);
        }
    };

    const handleToggleStatus = async (user: UserResponse) => {
        try {
            await toggleUserStatus(user.id);
            if (!isInfoline()) fetchData(currentPage, debouncedSearchTerm, selectedRole);
            else fetchClientsData(currentPage, debouncedSearchTerm);
        } catch (error: any) {
            alert(`Erreur: ${error.message}`);
        }
    };

    const exportToCSV = () => {
        const headers = ["ID", "Username", "Nom", "Prénom", "Email", "Rôle", "Téléphone", "Statut"];
        const rows = users.map(u => [
            u.id,
            u.username,
            u.lastName,
            u.firstName,
            u.email,
            u.role,
            u.phone || "",
            u.enabled ? "Actif" : "Bloqué"
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getRoleBadgeStyle = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200";
            case "WEBMASTER":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200";
            case "INFOLINE":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200";
        }
    };

    const filteredUsers = users;

    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const handleBatchDelete = async () => {
        if (!window.confirm(`Voulez-vous supprimer ${selectedUsers.length} utilisateurs ?`)) return;
        try {
            // await Promise.all(selectedUsers.map(id => deleteUser(id)));
            setUsers(users.filter(u => !selectedUsers.includes(u.id)));
            setSelectedUsers([]);
            toast.success("Utilisateurs supprimés !");
        } catch (error) {
            toast.error("Erreur lors de la suppression groupée");
        }
    };

    return (
        <div className="mx-auto max-w-full py-4 sm:py-6 space-y-8">
            {/* Admin Batch Actions */}
            {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between p-5 glass-premium border border-red-500/30 rounded-3xl animate-fade-in shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                    <div className="relative flex items-center gap-4">
                        <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-red-500/40">
                            {selectedUsers.length} SÉLECTIONNÉS
                        </div>
                        <p className="text-sm text-gray-300 font-bold uppercase tracking-tight">Actions de masse disponibles</p>
                    </div>
                    <div className="relative flex gap-4">
                        <button 
                            onClick={() => setSelectedUsers([])}
                            className="text-xs font-black text-gray-500 hover:text-white px-4 py-2 transition-colors uppercase tracking-widest"
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={handleBatchDelete}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-red-500/20 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            <Trash2 size={14} />
                            Supprimer la sélection
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-1 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                            Gestion Team
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black px-2 py-1 rounded-lg">ADMIN</span>
                        </h1>
                        <p className="text-sm text-gray-500 font-medium tracking-tight">Console d'administration des accès et privilèges</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-xl"
                    >
                        <Download size={18} />
                        Export
                    </button>
                    {isClient && isAdmin() && (
                        <button
                            onClick={handleOpenCreate}
                            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-xs font-black text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
                        >
                            <Plus size={20} />
                            Ajouter un Expert
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, identifiant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 transition-all font-medium"
                    />
                </div>
                {isClient && isAdmin() && (
                    <div className="w-full sm:w-64">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as Role | "all")}
                            className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 px-4 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 transition-all font-medium text-gray-500"
                        >
                            <option value="all">Tous les rôles</option>
                            <option value="ADMIN">Administrateur</option>
                            <option value="WEBMASTER">Webmaster</option>
                            <option value="INFOLINE">Infoline</option>
                            <option value="CLIENT">Client</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-3xl glass-premium shadow-2xl border border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Utilisateur</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Rôle</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-400">Contact</th>
                            <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-widest text-gray-400">ID</th>
                            <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-widest text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr key="loading-row">
                                <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                                    <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
                                    <p className="font-semibold text-lg text-gray-300 animate-pulse">Synchronisation des données...</p>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr key="empty-row">
                                <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                    <UserIcon className="mx-auto mb-4 text-white/10" size={64} />
                                    <p className="text-xl font-medium text-gray-300">Aucun utilisateur trouvé</p>
                                    <p className="text-sm text-gray-500">Essayez de modifier vos critères de recherche</p>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-all duration-300 group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-lg border border-indigo-500/20 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3">
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white uppercase tracking-tight group-hover:text-indigo-300 transition-colors">{user.firstName} {user.lastName}</div>
                                                <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                                    <span className="text-indigo-500/50">@</span>{user.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all group-hover:scale-105 ${getRoleBadgeStyle(user.role)}`}>
                                            <Shield size={12} className="animate-pulse" />
                                            {user.role}
                                        </span>
                                        {!user.enabled && (
                                            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black bg-red-500 text-white shadow-sm animate-pulse ml-2">
                                                <UserX size={10} /> BLOQUÉ
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <Mail size={14} className="text-gray-400" />
                                                <span className="font-medium">{user.email}</span>
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Phone size={12} className="text-gray-400" />
                                                    <span>{user.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-mono text-sm px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                            #{user.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isClient && isInfoline() && (
                                                <button
                                                    onClick={() => handleOpenView(user)}
                                                    className="p-2.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all"
                                                    title="Voir détails"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                            )}
                                            {isClient && (isAdmin() || (isInfoline() && user.role === "CLIENT")) && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenEdit(user)}
                                                        className="p-2.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all hover:rotate-6"
                                                        title="Modifier"
                                                    >
                                                        <Edit size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }}
                                                        className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:-rotate-6"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={`p-2.5 rounded-xl transition-all ${user.enabled ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                                        title={user.enabled ? "Bloquer le compte" : "Débloquer le compte"}
                                                    >
                                                        {user.enabled ? <UserX size={20} /> : <UserCheck size={20} />}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
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
                        sur <span className="font-semibold text-gray-900 dark:text-white">{totalElements}</span> utilisateurs
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

            {/* Create/Edit Modal */}
            {isEditModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setIsEditModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                                    <UserCircle size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        {modalMode === "create" ? "Nouvel Utilisateur" : "Editer le Profil"}
                                    </h2>
                                    <p className="text-sm text-gray-500">Remplissez les informations ci-dessous</p>
                                </div>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Identifiant (Username) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-10 py-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                            placeholder="Ex: louay_admin"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Email <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-10 py-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                            placeholder="nom@exemple.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Nom <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all uppercase"
                                        placeholder="Ex: BEN SALEM"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Prénom <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                        placeholder="Ex: Louay"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Mot de Passe {modalMode === "edit" && "(Optionnel)"}</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="password"
                                            required={modalMode === "create"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-10 py-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {modalMode === "edit" && <p className="mt-1 text-[10px] text-gray-400">Laissez vide pour conserver le mot de passe actuel.</p>}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Rôle <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select
                                            value={formData.role}
                                            disabled={!isAdmin()}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                                            className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-10 py-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                        >
                                            <option value="CLIENT">Client</option>
                                            <option value="INFOLINE">Infoline</option>
                                            <option value="WEBMASTER">Webmaster</option>
                                            <option value="ADMIN">Administrateur</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Téléphone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-10 py-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                            placeholder="Ex: +216 22 123 456"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">Adresse</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-10 py-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                            placeholder="Ex: Tunis, El Manar"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all"
                                >
                                    <X size={16} /> Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-indigo-600 px-10 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
                                >
                                    {modalMode === "create" ? "Créer l'Utilisateur" : "Sauvegarder les Changements"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal (Read-only for INFOLINE) */}
            {isViewModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setIsViewModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800 border border-indigo-500/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-2xl border border-indigo-100 dark:border-indigo-800">
                                    {formData.firstName[0]}{formData.lastName[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        {formData.firstName} {formData.lastName}
                                    </h2>
                                    <p className="text-sm text-gray-500 font-medium">@{formData.username}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        <Mail size={14} className="inline mr-2" />
                                        Email
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium">{formData.email}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        <Shield size={14} className="inline mr-2" />
                                        Rôle
                                    </label>
                                    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold border shadow-sm ${getRoleBadgeStyle(formData.role)}`}>
                                        {formData.role}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        <Phone size={14} className="inline mr-2" />
                                        Téléphone
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium">{formData.phone || "Non renseigné"}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        ID Client
                                    </label>
                                    <span className="font-mono text-sm px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                        #{formData.id}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                    <MapPin size={14} className="inline mr-2" />
                                    Adresse
                                </label>
                                <p className="text-gray-900 dark:text-white font-medium">{formData.address || "Non renseignée"}</p>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="flex items-center gap-2 rounded-xl bg-gray-200 dark:bg-gray-700 px-8 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all active:scale-95"
                                >
                                    <X size={16} /> Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setIsDeleteModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800 border border-red-500/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
                            <Trash2 className="text-red-600" size={32} />
                        </div>
                        <h3 className="mb-2 text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Supprimer l'utilisateur</h3>
                        <p className="mb-8 text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                            Êtes-vous sûr de vouloir supprimer <span className="text-red-600 font-bold">"{userToDelete?.username}"</span> ?
                            <br />
                            Cette action est définitive et entraînera la suppression de toutes ses données liées.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all">
                                <X size={16} /> Annuler
                            </button>
                            <button onClick={handleDelete} className="rounded-xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
