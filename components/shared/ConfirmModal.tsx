import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    loading = false
}) => {
    const colors = {
        danger: {
            bg: 'rgba(254, 242, 242, 0.8)',
            icon: '#ef4444',
            button: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'rgba(239, 68, 68, 0.1)'
        },
        warning: {
            bg: 'rgba(255, 251, 235, 0.8)',
            icon: '#f59e0b',
            button: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            border: 'rgba(245, 158, 11, 0.1)'
        },
        info: {
            bg: 'rgba(239, 246, 255, 0.8)',
            icon: '#3b82f6',
            button: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'rgba(59, 130, 246, 0.1)'
        }
    };

    const c = colors[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!loading ? onClose : undefined}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.5)',
                            backdropFilter: 'blur(8px)',
                        }}
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: 420,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 24,
                            padding: '32px 32px 24px 32px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Upper Icon Decor */}
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: 18,
                            background: c.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20,
                            border: `1px solid ${c.border}`
                        }}>
                            <AlertTriangle size={28} color={c.icon} />
                        </div>

                        <h3 style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: '#1e293b',
                            marginBottom: 12,
                            letterSpacing: '-0.02em'
                        }}>
                            {title}
                        </h3>

                        <p style={{
                            fontSize: 15,
                            lineHeight: 1.6,
                            color: '#64748b',
                            marginBottom: 32,
                            fontWeight: 500
                        }}>
                            {message}
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: 12,
                        }}>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    border: '1px solid #e2e8f0',
                                    background: '#fff',
                                    color: '#475569',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                style={{
                                    flex: 1.5,
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: c.button,
                                    color: '#fff',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {loading && (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                        style={{ display: 'flex' }}
                                    >
                                        <X size={16} />
                                    </motion.div>
                                )}
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
