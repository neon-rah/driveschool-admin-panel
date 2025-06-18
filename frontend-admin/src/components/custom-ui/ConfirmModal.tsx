"use client";

import React from "react";
import {Modal} from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";



interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">{message}</h4>
            <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={onClose}>
                    Annuler
                </Button>
                <Button variant="primary" size="sm" onClick={onConfirm}>
                    Confirmer
                </Button>
            </div>
        </Modal>
    );
};

export default ConfirmModal;