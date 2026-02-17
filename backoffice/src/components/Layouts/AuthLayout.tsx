"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    imageAlt?: string;
}

export default function AuthLayout({
    children,
    title,
    subtitle,
    imageAlt = "Authentication Illustration",
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-[#020D1A]">
            {/* Left Side: Visual/Branding (Hidden on mobile) */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0A0F1E] p-12 xl:flex">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse-slow ml-20" />
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <Link href="/" className="inline-block animate-fade-in">
                        <Image
                            src="/images/logo/logo-wiki.svg"
                            alt="Wiki Logo"
                            width={220}
                            height={70}
                            className="opacity-100"
                        />
                    </Link>

                    <div className="animate-slide-up">
                        <h1 className="mb-6 text-5xl font-extrabold leading-tight text-white xl:text-6xl">
                            {title}
                        </h1>
                        <p className="max-w-md text-xl font-medium text-gray-400">
                            {subtitle}
                        </p>
                    </div>

                </div>
            </div>

            {/* Right Side: Form Content */}
            <div className="flex w-full flex-col justify-center px-6 py-12 xl:w-1/2 xl:px-24">
                <div className="mx-auto w-full max-w-[480px] animate-slide-up">
                    {/* Mobile Logo */}
                    <div className="mb-10 block xl:hidden">
                        <Link href="/">
                            <Image
                                src="/images/logo/logo-wiki.svg"
                                alt="Wiki Logo"
                                width={160}
                                height={50}
                            />
                        </Link>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-dark dark:text-white sm:text-4xl">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-base text-gray-500 dark:text-dark-6">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
