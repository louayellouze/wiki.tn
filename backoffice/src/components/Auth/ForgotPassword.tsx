"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { forgotPassword } from "@/services/auth.service";

export default function ForgotPassword() {
    const [identifier, setIdentifier] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(identifier);
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
                    <Mail className="text-green-600" size={32} />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-dark dark:text-white">Email Envoyé !</h2>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                    Si un compte est associé à <strong>{identifier}</strong>, vous recevrez un email pour réinitialiser votre mot de passe.
                </p>
                <Link
                    href="/auth/sign-in"
                    className="inline-block rounded-lg bg-primary px-8 py-3 font-medium text-white transition hover:bg-opacity-90"
                >
                    Retour à la connexion
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="mb-2.5 block font-medium text-dark dark:text-white">
                    Nom d'utilisateur ou Email
                </label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Entrez votre identifiant"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:focus:border-primary"
                    />
                    <span className="absolute right-4 top-4 opacity-50">
                        <Mail size={22} />
                    </span>
                </div>
            </div>

            <div className="mb-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:bg-opacity-50"
                >
                    {loading ? "Envoi..." : "Réinitialiser mon mot de passe"}
                    {loading && (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
                    )}
                </button>
            </div>

            <div className="mt-6 text-center">
                <Link href="/auth/sign-in" className="text-primary hover:underline">
                    Retour à la connexion
                </Link>
            </div>
        </form>
    );
}
