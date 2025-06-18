"use client";

import React, { useEffect } from "react";
import { useStudent } from "@/contexts/StudentContext";
import { timeSince } from "@/lib/utils";
import Button from "@/components/ui/button/Button";
import { FaTrash } from "react-icons/fa";

const NotificationsPage: React.FC = () => {
    const { notifications, loading, markAsRead, removeNotification, removeAllNotifications } = useStudent();

    useEffect(() => {
        notifications.forEach((n) => !n.is_read && markAsRead(n.id));
    }, [notifications, markAsRead]);

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                <Button
                    size="sm"
                    onClick={removeAllNotifications}
                    className="bg-red-500 hover:bg-red-600 text-white"
                >
                    Supprimer tout
                </Button>
            </div>

            {loading ? (
                <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
            ) : notifications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">Aucune notification</p>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className="flex items-start justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {notif.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">{notif.message}</p>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {timeSince(notif.sent_at)}
                                </span>
                            </div>
                            <button
                                onClick={() => removeNotification(notif.id)}
                                className="ml-4 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                            >
                                <FaTrash className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;