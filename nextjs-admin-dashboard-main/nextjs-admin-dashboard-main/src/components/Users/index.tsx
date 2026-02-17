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
import { getAllUsers, createUser, updateUser, deleteUser, getClients } from "@/services/user.service";
import { UserResponse, RegisterRequest, UserUpdateRequest, Role } from "@/dtos/user.dto";
import { isAdmin, isWebmaster, isInfoline } from "@/services/auth.service";

const Users = () => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    useEffect(() => {
        setIsClient(true);
        if (!isInfoline()) {
            fetchData();
        } else {
            // INFOLINE sees only CLIENT users
            fetchClientsData();
        }
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientsData = async () => {
        setLoading(true);
        try {
            const data = await getClients();
            setUsers(data);
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
            fetchData();
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
            fetchData();
        } catch (error: any) {
            alert(`Erreur lors de la suppression: ${error.message}`);
        }
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

    const filteredUsers = users.filter(u => {
        // Apply Role Filtering first
        if (isInfoline() && u.role !== "CLIENT") return false;

        // Apply Search Filtering
        const search = searchTerm.toLowerCase();
        return (
            u.username.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            u.firstName.toLowerCase().includes(search) ||
            u.lastName.toLowerCase().includes(search)
        );
    });

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 text-gray-900 dark:text-white">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Gestion des Utilisateurs</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Gérez les accès et les rôles de votre équipe</p>
                </div>
                {isClient && !isInfoline() && !isWebmaster() && (
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-95"
                    >
                        <Plus size={20} />
                        Nouvel Utilisateur
                    </button>
                )}
            </div>

            <div className="mb-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, identifiant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50">
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Utilisateur</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rôle</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Contact</th>
                            <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono">ID</th>
                            <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                                    <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4"></div>
                                    <p className="font-semibold text-lg">Synchronisation des données...</p>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                    <UserIcon className="mx-auto mb-4 text-gray-200 dark:text-gray-700" size={64} />
                                    <p className="text-xl font-medium">Aucun utilisateur trouvé</p>
                                    <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-lg border border-indigo-100 dark:border-indigo-800 shadow-sm transition-transform group-hover:scale-105">
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{user.firstName} {user.lastName}</div>
                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    @{user.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold border shadow-sm ${getRoleBadgeStyle(user.role)}`}>
                                            <Shield size={12} />
                                            {user.role}
                                        </span>
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
                                            {isClient && isAdmin() && (
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

            {/* Create/Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto border border-white/20">
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
                                    className="rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all"
                                >
                                    Annuler
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800 border border-indigo-500/20">
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
                                    className="rounded-xl bg-gray-200 dark:bg-gray-700 px-8 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all active:scale-95"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-800 border border-red-500/20">
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
                            <button onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</button>
                            <button onClick={handleDelete} className="rounded-xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
