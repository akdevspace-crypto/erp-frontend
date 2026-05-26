import React from 'react'
import { X, Send } from 'lucide-react'
import { useAddFollowUp } from '../hooks/useEnquiry'
import { StatusHighlighter } from '../../../components/StatusHighlighter'

interface EnquiryFollowUpModalProps {
    isOpen: boolean
    onClose: () => void
    enquiry: any
    staffOptions: { value: string, label: string }[]
}

export function EnquiryFollowUpModal({ isOpen, onClose, enquiry, staffOptions }: EnquiryFollowUpModalProps) {
    const addFollowUp = useAddFollowUp()
    const availableStaffOptions = React.useMemo(
        () => staffOptions.filter((option) => option.value),
        [staffOptions]
    )
    const requiresStaffSelection = availableStaffOptions.length > 0
    const [form, setForm] = React.useState({
        followupMode: '',
        followupStatus: '',
        clientInterest: 'Neutral',
        readyToPayAmount: '',
        paymentMode: '',
        nextFollowupDate: new Date().toISOString().split('T')[0],
        staffId: '',
        attachmentName: '',
        comments: ''
    })

    const resetForm = () => {
        setForm({
            followupMode: '',
            followupStatus: '',
            clientInterest: 'Neutral',
            readyToPayAmount: '',
            paymentMode: '',
            nextFollowupDate: new Date().toISOString().split('T')[0],
            staffId: '',
            attachmentName: '',
            comments: ''
        })
    }

    React.useEffect(() => {
        if (isOpen) resetForm()
    }, [isOpen])

    if (!isOpen || !enquiry) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.comments.trim() || (requiresStaffSelection && !form.staffId)) return

        const note = [
            `Mode: ${form.followupMode || 'N/A'}`,
            `Status: ${form.followupStatus || 'N/A'}`,
            `Comments: ${form.comments.trim()}`
        ].join(' | ')

        addFollowUp.mutate(
            {
                id: enquiry.id,
                data: {
                    notes: note,
                    staffId: form.staffId || undefined,
                    channel: form.followupMode || undefined,
                    outcome: form.followupStatus || undefined,
                    attachmentName: form.attachmentName || undefined,
                    clientInterest: form.clientInterest || undefined,
                    readyToPayAmount: form.readyToPayAmount ? parseFloat(form.readyToPayAmount) : undefined,
                    paymentMode: form.paymentMode || undefined,
                    nextFollowupStatus: form.followupStatus || undefined,
                    nextDate: form.followupStatus === 'Followup Required' && form.nextFollowupDate
                        ? new Date(form.nextFollowupDate).toISOString()
                        : new Date().toISOString()
                }
            },
            {
                onSuccess: () => {
                    onClose()
                    resetForm()
                }
            }
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className="relative z-10 max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-gray-200 bg-white p-4 text-left shadow-2xl scrollbar-hide dark:border-white/10 dark:bg-black sm:p-6 lg:rounded-[32px] 2xl:max-w-6xl 2xl:p-8">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <header className="mb-6 sm:mb-8">
                    <h2 className="mb-5 pr-10 text-lg font-bold text-gray-900 dark:text-gray-100 sm:mb-6 sm:text-xl font-sans">Client Follow-up - {enquiry.clientName}</h2>

                    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm dark:border-white/5 dark:bg-black sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="min-w-0">
                            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Client Reference No.</p>
                            <h3 className="truncate text-2xl font-black tracking-tight text-[#ffc107] sm:text-3xl">{enquiry.refNo || `ENQ-${enquiry.id?.substring(0, 6).toUpperCase()}`}</h3>
                        </div>
                        <div className="text-left sm:text-right">
                            <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 min-w-[140px] shadow-sm">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">CURRENT STATUS</p>
                                <StatusHighlighter value={enquiry.status} />
                            </div>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:gap-8">
                        {/* Enquiry Snapshot */}
                        <section>
                            <h4 className="text-[12px] font-black text-[#ffc107] uppercase tracking-[0.2em] mb-4">ENQUIRY SNAPSHOT</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="bg-amber-50/30 dark:bg-black border border-amber-100 dark:border-[#ffc107]/10 rounded-xl p-4">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">UNIT</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{enquiry.unitId || 'Sunrise Edlercare'}</p>
                                </div>
                                <div className="bg-amber-50/30 dark:bg-black border border-amber-100 dark:border-[#ffc107]/10 rounded-xl p-4">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">SERVICE</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{enquiry.service || 'Standard'}</p>
                                </div>
                                <div className="bg-amber-50/30 dark:bg-black border border-amber-100 dark:border-[#ffc107]/10 rounded-xl p-4">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">ENQUIRY MODE</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{enquiry.mode || 'Call'}</p>
                                </div>
                                <div className="bg-amber-50/30 dark:bg-black border border-amber-100 dark:border-[#ffc107]/10 rounded-xl p-4">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">SOURCE</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{enquiry.source || 'Website'}</p>
                                </div>
                            </div>
                        </section>

                        {/* Client Details */}
                        <section>
                            <h4 className="text-[12px] font-black text-[#00b0a3] uppercase tracking-[0.2em] mb-4">CLIENT DETAILS</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="bg-teal-50/30 dark:bg-black border border-teal-100 dark:border-[#00b0a3]/10 rounded-xl p-4">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">CLIENT NAME</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{enquiry.clientName}</p>
                                </div>
                                <div className="bg-teal-50/30 dark:bg-black border border-teal-100 dark:border-[#00b0a3]/10 rounded-xl p-4">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">MOBILE</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{enquiry.mobile}</p>
                                </div>
                                <div className="bg-teal-50/30 dark:bg-[#010e0c] border border-teal-100 dark:border-[#00b0a3]/10 rounded-xl p-4 col-span-2">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">EMAIL</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{enquiry.email || '--'}</p>
                                </div>
                                <div className="bg-teal-50/30 dark:bg-[#010e0c] border border-teal-100 dark:border-[#00b0a3]/10 rounded-xl p-4 col-span-2">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">LAST COMMENTS</p>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic">"{enquiry.comments || 'No initial comments provided.'}"</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Follow-up Form Section */}
                    <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-[24px] p-6 shadow-sm">
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Discussion Record</h4>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4 2xl:gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Followup Mode</label>
                                <select
                                    value={form.followupMode}
                                    onChange={(e) => setForm(prev => ({ ...prev, followupMode: e.target.value }))}
                                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ffc107]/20 focus:border-[#ffc107] transition-all"
                                >
                                    <option value="">-- Select Mode --</option>
                                    <option value="Phone Call">Phone Call</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Visit">Visit</option>
                                    <option value="Email">Email</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Staff Followup *</label>
                                <select
                                    value={form.staffId}
                                    onChange={(e) => setForm(prev => ({ ...prev, staffId: e.target.value }))}
                                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ffc107]/20 focus:border-[#ffc107] transition-all"
                                    required={requiresStaffSelection}
                                >
                                    <option value="">
                                        {requiresStaffSelection ? '-- Select Staff --' : '-- No staff available --'}
                                    </option>
                                    {availableStaffOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {!requiresStaffSelection && (
                                    <p className="ml-1 text-[11px] font-semibold text-amber-600">
                                        Staff list is unavailable. Follow-up will be saved without staff assignment.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Outcome / Status</label>
                                <select
                                    value={form.followupStatus}
                                    onChange={(e) => setForm(prev => ({ ...prev, followupStatus: e.target.value }))}
                                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ffc107]/20 focus:border-[#ffc107] transition-all"
                                >
                                    <option value="">-- Select Status --</option>
                                    <option value="Followup Required">Followup Required</option>
                                    <option value="Followup Not Required">Followup Not Required</option>
                                    <option value="Admission Planned">Admission Planned</option>
                                    <option value="Converted">Converted</option>
                                    <option value="Lost">Lost</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Next Followup Date</label>
                                <input
                                    type="date"
                                    value={form.nextFollowupDate}
                                    onChange={(e) => setForm(prev => ({ ...prev, nextFollowupDate: e.target.value }))}
                                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ffc107]/20 focus:border-[#ffc107] transition-all"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2 2xl:col-span-4">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Discussion Timeline & Notes *</label>
                                <textarea
                                    value={form.comments}
                                    onChange={(e) => setForm(prev => ({ ...prev, comments: e.target.value }))}
                                    rows={4}
                                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ffc107]/20 focus:border-[#ffc107] transition-all placeholder:text-gray-400"
                                    placeholder="Enter client follow-up discussion points..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col justify-end gap-3 border-t border-gray-200 pt-6 dark:border-white/5 sm:flex-row sm:gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95 text-left"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={addFollowUp.isPending || !form.comments.trim() || (requiresStaffSelection && !form.staffId)}
                                className="px-8 py-3 rounded-xl bg-[#00b0a3] text-white font-black text-sm uppercase tracking-wider hover:bg-[#00d1c1] shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {addFollowUp.isPending ? 'Submitting...' : 'Submit Follow-up'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
