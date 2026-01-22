"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckCircle, Download, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Note: react-confetti might need window size, will skip size prop or handle simple
export default function SuccessPage() {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 5000); // Stop after 5s
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fallback simple CSS animation if no package, but here creates a nice effect if we had the package. 
          For MVP without extra heavy deps, I'll skip the actual confetti component/package and just use CSS or nothing.
          Actually, I won't use 'react-confetti' to avoid another install if not needed.
          I'll just do a CSS animation.
      */}

            <Card className="max-w-lg w-full bg-white border-gold-500 border-t-4 shadow-2xl relative z-10">
                <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-500 mb-8">Thank you for your purchase. Your tickets have been sent to your email.</p>

                    <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-300 border-dashed relative">
                        <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full border-r border-gray-300"></div>
                        <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full border-l border-gray-300"></div>

                        <h3 className="text-gold-600 font-bold tracking-widest uppercase mb-2">TICKET ID</h3>
                        <p className="text-2xl font-mono text-gray-900 tracking-widest">UV-{Math.floor(100000 + Math.random() * 900000)}</p>
                        <div className="mt-4 flex justify-center">
                            <div className="w-32 h-32 bg-white p-2">
                                {/* Mock QR */}
                                <div className="w-full h-full bg-black pattern-grid-lg"></div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Scan at the venue entrance</p>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/" className="flex-1">
                            <Button variant="outline" className="w-full">
                                <Home className="w-4 h-4 mr-2" /> Return Home
                            </Button>
                        </Link>
                        <Button className="flex-1">
                            <Download className="w-4 h-4 mr-2" /> Download Ref
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
