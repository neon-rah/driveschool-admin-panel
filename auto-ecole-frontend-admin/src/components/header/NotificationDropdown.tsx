"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStudent } from "@/contexts/StudentContext";
import { timeSince } from "@/lib/utils";
import { FaBell, FaTimes, FaTrash } from "react-icons/fa";

interface NotificationEvent {
    id: number;
    title: string;
    message: string;
    sent_at: string;
    is_read: boolean;
    training_id?: number;
}

export default function NotificationDropdown() {
    const { notifications, markAsRead, removeNotification, fetchAllNotifications } = useStudent();
    const [isOpen, setIsOpen] = useState(false);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);

    useEffect(() => {
        setHasNewNotifications(notifications.some((n) => !n.is_read));
    }, [notifications]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasNewNotifications(false);
            const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
            if (unreadIds.length > 0) {
                unreadIds.forEach((id) => markAsRead(id));
            }
        }
    };

    const closeDropdown = () => setIsOpen(false);

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="relative flex items-center justify-center w-11 h-11 text-gray-500 bg-white border border-gray-200 rounded-full hover:text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors duration-200"
            >
                {hasNewNotifications && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                )}
                <FaBell className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50">
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
                        <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notifications</h5>
                        <button
                            onClick={closeDropdown}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>

                    {notifications.length === 0 ? (
                        <p className="p-4 text-gray-500 dark:text-gray-400 text-center">Aucune notification</p>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                            {notifications.map((notif) => (
                                <li
                                    key={notif.id}
                                    className="flex items-start justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                                >
                                    <div className="flex-1">
                                        <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {notif.title}
                                        </h6>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {notif.message}
                                        </p>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {timeSince(notif.sent_at)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeNotification(notif.id)}
                                        className="ml-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                        <Link
                            href="/notifications"
                            className="block text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            onClick={closeDropdown}
                        >
                            Voir toutes les notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}