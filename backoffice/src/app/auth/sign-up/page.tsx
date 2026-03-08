import Signup from "@/components/Auth/Signup";
import AuthLayout from "@/components/Layouts/AuthLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign up | Wiki Admin",
};

export default function SignUpPage() {
    return (
        <AuthLayout
            title="Create new account"
            subtitle="Rejoignez-nous et gérez votre e-commerce facilement."
        >
            <div className="mt-8">
                <Signup />
            </div>
        </AuthLayout>
    );
}
