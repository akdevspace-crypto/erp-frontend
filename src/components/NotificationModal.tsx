import { X, Bell, CheckCircle, AlertTriangle } from 'lucide-react'

export function NotificationModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-gray-900/10 backdrop-blur-[1px] p-4 sm:p-6 sm:pr-20 sm:pt-20 animate-in fade-in duration-200">
            <div className="fixed inset-0 z-40" onClick={onClose}></div>
            <div className="w-full max-w-sm bg-white dark:bg-[#1E1E1E] dark:border-white/10 rounded-[24px] shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden relative z-50 flex flex-col max-h-[80vh] scale-100 animate-in slide-in-from-right-10 duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 px-5 py-4 shrink-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-[16px] flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary-500" /> Notifications
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col">
                        <div className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50/50 dark:border-white/5 cursor-pointer flex gap-3 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5"><AlertTriangle className="w-4 h-4" /></div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight">High Priority Complaint</span>
                                <span className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">New complaint registered for clinical care unit. Needs immediate review.</span>
                                <span className="text-[10px] font-bold text-gray-400 mt-1">2 mins ago</span>
                            </div>
                        </div>

                        <div className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50/50 dark:border-white/5 cursor-pointer flex gap-3 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle className="w-4 h-4" /></div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight">Task Completed</span>
                                <span className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Nurse allocation for PT #120 has been finalized.</span>
                                <span className="text-[10px] font-bold text-gray-400 mt-1">1 hr ago</span>
                            </div>
                        </div>

                        <div className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50/50 dark:border-white/5 cursor-pointer flex gap-3 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0 mt-0.5"><Bell className="w-4 h-4" /></div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight">System Update</span>
                                <span className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Scheduled maintenance at 00:00 GMT.</span>
                                <span className="text-[10px] font-bold text-gray-400 mt-1">Yesterday</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-3 border-t border-gray-100 dark:border-white/10 text-center shrink-0">
                    <button className="text-[12px] font-bold text-primary-500 hover:text-primary-600 transition-colors">Mark all as read</button>
                </div>
            </div>
        </div>
    )
}
