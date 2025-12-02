import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
    notification: { message: string; type: 'success' | 'error' | 'info' } | null;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
    if (!notification) return null;

    const bgColors = {
        success: 'bg-emerald-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    const icons = {
        success: '✅',
        error: '⚠️',
        info: 'ℹ️'
    };

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[2000] ${bgColors[notification.type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] max-w-[90vw] border border-white/10 backdrop-blur-md`}
                >
                    <div className="text-2xl">{icons[notification.type]}</div>
                    <div className="flex-1">
                        <p className="font-medium text-sm whitespace-pre-line leading-relaxed">{notification.message}</p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        ✕
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Notification;
