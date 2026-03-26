"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Info, AlertTriangle, CheckCircle, X, CheckCheck, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notification-actions";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const loadNotifications = async () => {
        try {
            const data = await fetchNotifications();
            setNotifications(data);
            setUnreadCount(data.filter((n) => !n.isRead).length);
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    };

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        await markNotificationAsRead(id);
        loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead();
        loadNotifications();
    };

    const getIcon = (type) => {
        switch (type) {
            case "ALERT":
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case "SUCCESS":
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case "WARNING":
                return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* BELL ICON */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="relative mx-2 cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-all group active:scale-95"
            >
                <Bell className={`w-5 h-5 transition-colors ${isOpen ? 'text-emerald-600' : 'text-gray-500 group-hover:text-emerald-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </div>

            {/* DROPDOWN */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-[380px] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] overflow-hidden z-[100] backdrop-blur-3xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-amber-500" /> Notifications
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Real-time environmental logs</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                                >
                                    <CheckCheck className="w-3 h-3" /> Mark all
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => {
                                            if (!n.isRead) handleMarkAsRead(n.id);
                                        }}
                                        className={`p-5 border-b border-slate-50 flex gap-4 transition-all cursor-pointer group/item ${!n.isRead ? "bg-emerald-50/20 hover:bg-emerald-50/40" : "hover:bg-slate-50/50"
                                            }`}
                                    >
                                        <div className={`mt-0.5 p-2.5 rounded-2xl shrink-0 transition-transform group-hover/item:scale-110 ${n.type === 'ALERT' ? 'bg-red-50 text-red-500' :
                                                n.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-500' :
                                                    'bg-blue-50 text-blue-500'
                                            }`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-1.5">
                                                <h4 className={`text-sm font-bold truncate transition-colors ${!n.isRead ? 'text-slate-900' : 'text-slate-400 font-semibold'}`}>
                                                    {n.title}
                                                </h4>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter whitespace-nowrap mt-1">
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className={`text-[11px] leading-relaxed line-clamp-2 ${!n.isRead ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                                                {n.message}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <div className="mt-2 w-2 h-2 bg-emerald-500 rounded-full shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-16 px-10 text-center flex flex-col items-center gap-5">
                                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                                        <Bell className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black uppercase tracking-widest text-slate-300">All Quiet</h5>
                                        <p className="text-[10px] font-bold text-slate-400 max-w-[180px] mx-auto mt-2 leading-relaxed">System is stable. No new alerts or report updates at this time.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-4 bg-slate-50/30 text-center border-t border-slate-50">
                                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2 mx-auto group">
                                    System Feed History <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
