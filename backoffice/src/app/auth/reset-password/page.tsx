import ResetPassword from "@/components/Auth/ResetPassword";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Réinitialiser le mot de passe | Wiki Admin",
};

export default function ResetPasswordPage() {
    return (
        <>
            <Breadcrumb pageName="Réinitialisation" />

            <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
                <div className="flex flex-wrap items-center">
                    <div className="w-full xl:w-1/2">
                        <div className="w-full p-4 sm:p-12.5 xl:p-15">
                            <div className="mb-10 text-center">
                                <h1 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-heading-3 uppercase">
                                    Nouveau mot de passe
                                </h1>
                                <p className="font-medium text-gray-500 dark:text-gray-400">
                                    Veuillez choisir un nouveau mot de passe sécurisé
                                </p>
                            </div>
                            <Suspense fallback={<div>Chargement...</div>}>
                                <ResetPassword />
                            </Suspense>
                        </div>
                    </div>

                    <div className="hidden w-full p-7.5 xl:block xl:w-1/2">
                        <div className="custom-gradient-1 h-full overflow-hidden rounded-2xl px-12.5 pt-12.5 dark:!bg-dark-2 dark:bg-none min-h-[500px] flex flex-col justify-center items-center">
                            <Link className="mb-10 inline-block" href="/">
                                <Image
                                    src={"/images/logo/logo.svg"}
                                    alt="Logo"
                                    width={176}
                                    height={32}
                                    className="hidden dark:block"
                                />
                                <Image
                                    src={"/images/logo/logo-dark.svg"}
                                    alt="Logo"
                                    width={176}
                                    height={32}
                                    className="dark:hidden"
                                />
                            </Link>
                            <h2 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-heading-3">
                                Sécurisez votre accès
                            </h2>
                            <Image
                                src={"/images/grids/grid-02.svg"}
                                alt="Grid"
                                width={405}
                                height={325}
                                className="opacity-30"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
