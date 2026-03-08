"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { register } from "@/services/auth.service";

export default function SignupWithPassword() {
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        address: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(data);
            window.location.href = "/auth/sign-in";
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                <div className="w-full sm:w-1/2">
                    <InputGroup
                        type="text"
                        label="First Name"
                        placeholder="John"
                        name="firstName"
                        handleChange={handleChange}
                        value={data.firstName}
                        className="[&_input]:py-[15px]"
                    />
                </div>
                <div className="w-full sm:w-1/2">
                    <InputGroup
                        type="text"
                        label="Last Name"
                        placeholder="Doe"
                        name="lastName"
                        handleChange={handleChange}
                        value={data.lastName}
                        className="[&_input]:py-[15px]"
                    />
                </div>
            </div>

            <InputGroup
                type="text"
                label="Username"
                className="mb-4 [&_input]:py-[15px]"
                placeholder="Enter your username"
                name="username"
                handleChange={handleChange}
                value={data.username}
            />

            <InputGroup
                type="email"
                label="Email"
                className="mb-4 [&_input]:py-[15px]"
                placeholder="Enter your email"
                name="email"
                handleChange={handleChange}
                value={data.email}
                icon={<EmailIcon />}
            />

            <InputGroup
                type="text"
                label="Téléphone"
                className="mb-4 [&_input]:py-[15px]"
                placeholder="Your phone number"
                name="phone"
                handleChange={handleChange}
                value={data.phone}
            />

            <InputGroup
                type="text"
                label="Adresse"
                className="mb-4 [&_input]:py-[15px]"
                placeholder="Your address"
                name="address"
                handleChange={handleChange}
                value={data.address}
            />

            <InputGroup
                type="password"
                label="Password"
                className="mb-5 [&_input]:py-[15px]"
                placeholder="Enter your password"
                name="password"
                handleChange={handleChange}
                value={data.password}
                icon={<PasswordIcon />}
            />

            <div className="mb-4.5 mt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] hover:bg-opacity-90 hover:shadow-xl active:translate-y-[0px] disabled:bg-opacity-50"
                >
                    {loading ? "Signing Up..." : "Sign Up"}
                    {loading && (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
                    )}
                </button>
            </div>
        </form>
    );
}
