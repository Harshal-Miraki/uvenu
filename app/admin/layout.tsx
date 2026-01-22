"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { role, isLoggedIn } = useStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Skip check for login page
        if (pathname === '/admin/login') {
            setIsChecking(false);
            return;
        }

        // Check if logged in as admin
        if (!isLoggedIn || role !== 'admin') {
            router.replace('/admin/login');
        } else {
            setIsChecking(false);
        }
    }, [isLoggedIn, role, pathname, router]);

    // Show nothing while checking auth (prevents flash)
    if (isChecking && pathname !== '/admin/login') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Checking authorization...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
