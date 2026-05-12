"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CameraIcon } from "./_components/icons";
import { SocialAccounts } from "./_components/social-accounts";
import { getCurrentUser, changePassword } from "@/services/user.service";
import { getUserFromToken } from "@/services/auth.service";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [data, setData] = useState({
    username: "Chargement...",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    profilePhoto: "/images/user/user-03.png",
    coverPhoto: "/images/cover/cover-01.png",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const fullUser = await getCurrentUser();
        setData(prev => ({
          ...prev,
          username: fullUser.username,
          firstName: fullUser.firstName || "",
          lastName: fullUser.lastName || "",
          email: fullUser.email,
          phone: fullUser.phone || "Non renseigné",
          address: fullUser.address || "Non renseigné",
          role: fullUser.role,
        }));
      } catch (error) {
        console.error("Error fetching user profile:", error);
        const tokenUser = getUserFromToken();
        if (tokenUser) {
          setData(prev => ({
            ...prev,
            username: tokenUser.username,
            role: tokenUser.role,
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    if (passwords.newPassword.length < 6) {
      alert("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      alert("Mot de passe modifié avec succès !");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      alert(error.message || "Erreur lors du changement de mot de passe");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleChange = (e: any) => {
    if (e.target.name === "profilePhoto" || e.target.name === "coverPhoto") {
      const file = e.target?.files[0];
      if (file) {
        setData({
          ...data,
          [e.target.name]: URL.createObjectURL(file),
        });
      }
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={data?.coverPhoto}
            alt="profile cover"
            className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            width={970}
            height={260}
          />
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label htmlFor="coverPhoto" className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-[15px] py-[5px] text-body-sm font-medium text-white hover:bg-opacity-90">
              <input type="file" name="coverPhoto" id="coverPhoto" className="sr-only" onChange={handleChange} accept="image/*" />
              <CameraIcon />
              <span>Edit</span>
            </label>
          </div>
        </div>

        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3">
            <div className="relative drop-shadow-2">
              <Image src={data?.profilePhoto} width={160} height={160} className="overflow-hidden rounded-full" alt="profile" />
              <label htmlFor="profilePhoto" className="absolute bottom-0 right-0 flex size-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2">
                <CameraIcon />
                <input type="file" name="profilePhoto" id="profilePhoto" className="sr-only" onChange={handleChange} accept="image/*" />
              </label>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {data.firstName} {data.lastName} ({data.username})
            </h3>
            <p className="font-medium">{data.role}</p>

            <div className="mx-auto max-w-[720px] mt-8 text-left">
              <h4 className="font-medium text-dark dark:text-white mb-4 border-b border-stroke pb-2 dark:border-dark-3">
                Informations Personnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-2 dark:bg-dark-2 p-6 rounded-xl">
                <div>
                  <label className="text-body-sm text-gray-500 block mb-1">Nom d'utilisateur</label>
                  <p className="font-semibold text-dark dark:text-white">{data.username}</p>
                </div>
                <div>
                  <label className="text-body-sm text-gray-500 block mb-1">Rôle</label>
                  <p className="font-semibold text-dark dark:text-white">{data.role}</p>
                </div>
                <div>
                  <label className="text-body-sm text-gray-500 block mb-1">Prénom</label>
                  <p className="font-semibold text-dark dark:text-white">{data.firstName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-body-sm text-gray-500 block mb-1">Nom</label>
                  <p className="font-semibold text-dark dark:text-white">{data.lastName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-body-sm text-gray-500 block mb-1">Email</label>
                  <p className="font-semibold text-dark dark:text-white">{data.email}</p>
                </div>
                <div>
                  <label className="text-body-sm text-gray-500 block mb-1">Téléphone</label>
                  <p className="font-semibold text-dark dark:text-white">{data.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-body-sm text-gray-500 block mb-1">Adresse</label>
                  <p className="font-semibold text-dark dark:text-white">{data.address}</p>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-[720px] mb-10 mt-10 border-t border-stroke pt-10 dark:border-dark-3">
              <h4 className="font-medium text-dark dark:text-white mb-6 text-left">
                Sécurité & Mot de passe
              </h4>
              <form onSubmit={handlePasswordChange} className="text-left space-y-4">
                <div>
                  <label className="mb-2.5 block font-medium text-dark dark:text-white text-sm">Ancien mot de passe</label>
                  <input type="password" name="oldPassword" value={passwords.oldPassword} onChange={handlePasswordInput} placeholder="Entrez votre mot de passe actuel" className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2.5 block font-medium text-dark dark:text-white text-sm">Nouveau mot de passe</label>
                    <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordInput} placeholder="Min 6 caractères" className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white" required />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-dark dark:text-white text-sm">Confirmer le nouveau mot de passe</label>
                    <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordInput} placeholder="Répétez le mot de passe" className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white" required />
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={passwordLoading} className="flex justify-center rounded bg-primary py-3 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50">
                    {passwordLoading ? "Mise à jour..." : "Modifier le mot de passe"}
                  </button>
                </div>
              </form>
            </div>

            <SocialAccounts />
          </div>
        </div>
      </div>
    </div>
  );
}
