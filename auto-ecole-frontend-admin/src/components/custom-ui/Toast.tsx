"use client";

import React, { useEffect, useState } from "react";

interface ToastProps {
    message: string;
    type: "success" | "error";
    duration?: number;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg text-white z-999999 ${
                type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
        >
            {message}
        </div>
    );
};

export default Toast;