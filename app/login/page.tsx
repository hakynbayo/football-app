"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log("🔐 Attempting login for:", email);
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            console.log("📊 Login result:", result);

            if (result?.error) {
                console.error("❌ Login error:", result.error);
                setError("Invalid username/email or password");
            } else if (result?.ok) {
                console.log("✅ Login successful, redirecting...");
                router.push("/");
            } else {
                console.warn("⚠️ Unexpected result:", result);
                setError("Login failed. Please try again.");
            }
        } catch (error) {
            console.error("❌ Login exception:", error);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
            <div className="w-full max-w-md">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                            <LogIn className="w-8 h-8 text-black dark:text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                            Football App
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-black dark:text-white flex-shrink-0" />
                            <p className="text-sm text-black dark:text-white">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email or Username</Label>
                            <Input
                                id="email"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1"
                                placeholder="Enter email or username"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1"
                                placeholder="••••••••"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black h-11"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don&apos;t have an account?{" "}
                            <a
                                href="/register"
                                className="text-black dark:text-white hover:underline font-medium"
                            >
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
