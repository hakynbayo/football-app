"use client";

import { FC, useState } from "react";
import { Lock, Eye, EyeOff, X } from "lucide-react";

interface PasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => void;
    title?: string;
    message?: string;
}

const PasswordDialog: FC<PasswordDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Please enter the password to continue:",
}) => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        onConfirm(password);
    };

    const handleClose = () => {
        setPassword("");
        setError("");
        setShowPassword(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                            <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                        {message}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Enter password"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    )}
                                </button>
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordDialog;

