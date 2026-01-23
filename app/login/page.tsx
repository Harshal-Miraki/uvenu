"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { storage } from "@/lib/storage";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter email and password");
            return;
        }

        setIsLoading(true);

        // Validate user against Firebase
        const result = await storage.validateUser(email, password);

        setIsLoading(false);

        if (!result.success) {
            setError(result.error || "Login failed");
            return;
        }

        // Store auth and user data
        if (result.user) {
            storage.setAuth('customer');
            storage.setCurrentUser(result.user);
            router.push('/events');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <img src="/logo.svg" alt="UVENU" className="h-10 w-auto mx-auto" />
                    </Link>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>

                <Card className="bg-white border-gray-200 shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl text-gray-900">UVENU Login</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm text-center">{error}</div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <Link
                                href="/admin/login"
                                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gold-600 transition-colors"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Admin Login
                            </Link>
                        </div>

                        <p className="text-xs text-center text-gray-400 mt-4">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-gold-600 hover:underline">
                                Register here
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
