"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/button/Button"; // Import corrigé
import { Input } from "@/components/ui/input";
import { ImageIcon, XCircleIcon } from "lucide-react";

interface ImageUploadProps {
    onImageSelect: (file: File | null) => void;
    className?: string;
    shape?: "round" | "square";
    required?: boolean;
    initialImage?: string;
    id?: string; // Nouvelle prop pour ID unique
}

export default function ImageUpload({
                                        onImageSelect,
                                        className,
                                        shape = "square", // Par défaut carré
                                        required = false,
                                        initialImage,
                                        id = "file-upload", // ID par défaut, peut être remplacé
                                    }: ImageUploadProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(initialImage || null);
    const [error, setError] = useState<string | null>(null);
    const uniqueId = `${id}-${Math.random().toString(36).substr(2, 9)}`; // ID unique pour chaque instance

    useEffect(() => {
        setImagePreview(initialImage || null);
    }, [initialImage]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const allowedExtensions = ["image/jpeg", "image/png", "image/jpg"];
            if (!allowedExtensions.includes(file.type)) {
                setError("Seuls les fichiers JPG, JPEG et PNG sont autorisés.");
                setImagePreview(initialImage || null);
                onImageSelect(null);
                return;
            }

            setError(null);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            onImageSelect(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setError(null);
        onImageSelect(null);
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div
                className={cn(
                    "relative w-32 h-32 bg-gray-200 dark:bg-gray-900 flex items-center justify-center",
                    shape === "round" ? "rounded-full" : "rounded-md",
                    className
                )}
            >
                {imagePreview ? (
                    <>
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className={`w-full h-full object-cover ${shape === "round" ? "rounded-full" : "rounded-md"}`}
                        />
                        <button
                            type="button"
                            className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-md"
                            onClick={handleRemoveImage}
                        >
                            <XCircleIcon className="w-5 h-5 text-red-500" />
                        </button>
                    </>
                ) : (
                    <ImageIcon className="w-10 h-10 text-gray-500" />
                )}
            </div>

            <Input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                className="hidden"
                id={uniqueId} // ID unique
                onChange={handleFileChange}
            />

            <Button variant="primary" size="sm">
                <label htmlFor={uniqueId} className="cursor-pointer">
                    Choisir une image
                </label>
            </Button>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {required && !imagePreview && !error && (
                <p className="text-sm text-red-500">Image requise</p>
            )}
        </div>
    );
}