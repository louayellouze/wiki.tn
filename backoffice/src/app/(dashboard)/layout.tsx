"use client";

import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import type { PropsWithChildren } from "react";

import { Toaster } from "sonner";

export default function DashboardLayout({ children }: PropsWithChildren) {
    return (
    <div className="flex min-h-screen font-premium">
        <Toaster position="top-right" theme="dark" richColors />
        <Sidebar />


        <div className="flex-1 flex flex-col min-w-0 bg-[#010409]">
            <Header />

            <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 md:px-6 animate-fade-in">
                {children}
            </main>
        </div>
    </div>
    );
}
