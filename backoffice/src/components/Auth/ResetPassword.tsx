"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { resetPassword } from "@/services/auth.service";

export default function ResetPassword() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas");
            return;
        }
        if (!token) {
            alert("Jeton de réinitialisation manquant");
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, password);
            setSuccess(true);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="text-green-600" size={32} />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-dark dark:text-white">Succès !</h2>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                    Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
                </p>
                <Link
                    href="/auth/sign-in"
                    className="inline-block rounded-lg bg-primary px-8 py-3 font-medium text-white transition hover:bg-opacity-90"
                >
                    Se connecter
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="mb-2.5 block font-medium text-dark dark:text-white">
                    Nouveau Mot de Passe
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Entrez votre nouveau mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-12 text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-primary"
                    >
                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <label className="mb-2.5 block font-medium text-dark dark:text-white">
                    Confirmer le Mot de Passe
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirmez votre mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-12 text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                    />
                    <span className="absolute right-4 top-4 opacity-50">
                        <Lock size={22} />
                    </span>
                </div>
            </div>

            <div className="mb-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:bg-opacity-50"
                >
                    {loading ? "Chargement..." : "Réinitialiser le mot de passe"}
                    {loading && (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
                    )}
                </button>
            </div>
        </form>
    );
}
