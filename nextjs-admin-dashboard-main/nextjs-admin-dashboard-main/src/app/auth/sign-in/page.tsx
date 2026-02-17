import Signin from "@/components/Auth/Signin";
import AuthLayout from "@/components/Layouts/AuthLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Wiki Admin",
};

export default function SignIn() {
  return (
    <AuthLayout
      title="Bienvenue chez Wiki"
      subtitle="Votre partenaire de confiance pour une gestion e-commerce performante et simplifiée."
    >
      <div className="mt-8">
        <Signin />
      </div>
    </AuthLayout>
  );
}
