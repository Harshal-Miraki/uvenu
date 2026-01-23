"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { storage } from "@/lib/storage";
import { User, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please enter username and password");
            return;
        }

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock validation - admin/admin or any credentials for demo
        storage.setAuth('admin');
        setIsLoading(false);
        router.push('/admin');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to customer login */}
                <Link
                    href="/login"
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    UVENUE Login
                </Link>

                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/logo.svg" alt="UVENU" className="h-10 w-auto mx-auto" />
                    <p className="text-gray-400 mt-2">Admin Portal</p>
                </div>

                <Card className="bg-gray-800/50 border-gray-700 shadow-2xl backdrop-blur">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl text-white">Admin Login</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <Input
                                        type="text"
                                        placeholder="admin"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-400 text-sm text-center">{error}</div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Access Admin Panel'}
                                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </form>

                        <p className="text-xs text-center text-gray-500 mt-6">
                            Demo: Enter any username/password to continue
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
