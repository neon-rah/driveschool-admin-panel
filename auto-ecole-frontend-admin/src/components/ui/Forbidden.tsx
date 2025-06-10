"use client";

import { useRouter } from "next/navigation";
import { ShieldOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
    const router = useRouter();

    const handleRedirect = () => {
        router.push("/profile"); // Redirige vers le profil ou une autre page
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center space-y-6">
                {/* Icône */}
                <div className="flex justify-center">
                    <ShieldOffIcon className="w-16 h-16 text-red-500 dark:text-red-400" />
                </div>

                {/* Titre */}
                <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
                    Access Denied
                </h1>

                {/* Message */}
                <p className="text-gray-600 dark:text-gray-300">
                    You do not have permission to access this resource. Only the owner can view or edit this content.
                </p>

                {/* Bouton */}
                <Button
                    onClick={handleRedirect}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                    Back to Profile
                </Button>
            </div>
        </div>
    );
}