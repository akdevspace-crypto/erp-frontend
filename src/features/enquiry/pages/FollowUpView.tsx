import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Phone,
    MessageSquare,
    User,
    ChevronLeft,
    MoreVertical,
    Send,
    Activity,
    ShieldAlert
} from 'lucide-react'
import { useEnquiry, useAddFollowUp } from '../hooks/useEnquiry'
import { useStaff } from '../../hr/hooks/useHR'
import { GlobalSpinner } from '../../../components/SkeletonLoader'
import { StatusHighlighter } from '../../../components/StatusHighlighter'

export function FollowUpView() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: enquiry, isLoading: isEnquiryLoading } = useEnquiry(id!)
    const { data: staffList = [] } = useStaff()
    const addFollowUp = useAddFollowUp()

    const [notes, setNotes] = useState('')
    const [selectedStaffId, setSelectedStaffId] = useState<string>('')
    const [nextDate, setNextDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [outcome, setOutcome] = useState('Pending')
    const [clientInterest, setClientInterest] = useState('Neutral')
    const [hasAttachment, setHasAttachment] = useState(false)

    const groupedStaff = useMemo(() => {
        const groups: Record<string, any[]> = {}
        staffList.forEach((s: any) => {
            const deptName = s.department?.name || 'Other'
            if (!groups[deptName]) groups[deptName] = []
            groups[deptName].push(s)
        })
        return groups
    }, [staffList])

    const handleSubmit = () => {
        if (!notes) return
        addFollowUp.mutate({
            id: id!,
            data: {
                notes,
                nextDate: new Date(nextDate).toISOString(),
                staffId: selectedStaffId || undefined,
                outcome,
                clientInterest,
                attachmentName: hasAttachment ? "PROCESSED_DOCUMENT" : undefined
            }
        }, {
            onSuccess: () => navigate('/enquiry/follow-up')
        })
    }

    if (isEnquiryLoading) return <GlobalSpinner />
    if (!enquiry) return <div className="p-8 text-center text-gray-500">Enquiry not found</div>

    return (
        <div className="flex h-full min-w-0 flex-col overflow-hidden bg-[#f0f2f5] text-left dark:bg-black">
            <div className="flex items-center justify-between gap-3 bg-[#008069] px-3 py-3 text-white shadow-md sm:px-4">
                <div className="flex min-w-0 items-center gap-3">
                    <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-1 rounded-full text-white">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 truncate text-xs font-bold uppercase">
                            {enquiry.clientName.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-base font-bold leading-tight tracking-wide">{enquiry.clientName}</h2>
                            <p className="text-[11px] text-white/80 opacity-90 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                                <span className={`h-2 w-2 rounded-full ${enquiry.automationPriority === 'HOT' ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                                {enquiry.refNo} • {enquiry.automationPriority}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 sm:mr-1 sm:gap-3 lg:gap-5">
                    <button className="hover:bg-white/10 p-2 rounded-full transition-colors"><Phone className="h-5 w-5" /></button>
                    <button className="hover:bg-white/10 p-2 rounded-full transition-colors"><MessageSquare className="h-5 w-5" /></button>
                    <button className="hover:bg-white/10 p-2 rounded-full transition-colors"><MoreVertical className="h-5 w-5" /></button>
                </div>
            </div>

            <div className="mx-auto flex-1 w-full max-w-none space-y-4 overflow-y-auto p-3 sm:p-4 2xl:p-6">
                <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div className="bg-gray-50/80 dark:bg-white/5 px-4 py-3 border-b dark:border-white/10 flex items-center justify-between">
                        <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-[#008069]" /> Lead Intelligence
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-full">{enquiry.automationScore}/100</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-2 2xl:grid-cols-4 2xl:gap-6">
                        <div className="space-y-4 2xl:col-span-2">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Health Condition</label>
                                <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg flex items-start gap-3">
                                    <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <span className="text-sm font-semibold text-red-900 leading-relaxed italic">{enquiry.patientHealthCondition || 'Condition details not specified'}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Service Type</label><span className="text-sm font-bold text-gray-800 dark:text-gray-200">{enquiry.service}</span></div>
                                <div><label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Status</label><StatusHighlighter value={enquiry.status} /></div>
                            </div>
                        </div>
                        <div className="space-y-4 2xl:col-span-2">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Contact Metadata</label>
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-3 text-sm font-bold text-[#005c4b]"><Phone className="h-4 w-4" /> {enquiry.mobile}</div>
                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-600"><User className="h-4 w-4" /> {enquiry.patientName} ({enquiry.patientAge}, {enquiry.patientGender})</div>
                                </div>
                            </div>
                            <div className="bg-emerald-50/30 p-2 rounded border border-emerald-100/50">
                                <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-wider block mb-1">Agent Comments</label>
                                <p className="text-xs text-gray-600 font-medium leading-relaxed">{enquiry.comments || 'No initial comments provided.'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-emerald-100/30 dark:border-white/10 overflow-hidden">
                    <div className="bg-[#00a884]/5 dark:bg-[#00a884]/10 px-5 py-4 border-b border-emerald-100/40 dark:border-white/10 flex items-center gap-3">
                        <div className="p-2 bg-[#00a884] rounded-lg shadow-sm"><Send className="h-4 w-4 text-white" /></div>
                        <div>
                            <h3 className="font-sans text-lg font-bold text-gray-800 dark:text-gray-100">Record Follow-up Discussion</h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Add notes and assign staff for the next action</p>
                        </div>
                    </div>
                    <div className="space-y-6 p-4 sm:p-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Allocate Follow-up Staff</label>
                                <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)} className="w-full bg-white dark:bg-black border-2 border-gray-100 dark:border-white/10 focus:border-[#00a884] rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-100 outline-none transition-all">
                                    <option value="">-- No Staff Assigned --</option>
                                    {Object.entries(groupedStaff).map(([dept, staff]) => (
                                        <optgroup key={dept} label={dept.toUpperCase()} className="text-[11px] font-black text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40">
                                            {staff.map((s: any) => (<option key={s.id} value={s.id}>{s.firstName} {s.lastName || ''} ({s.designation || 'Staff'})</option>))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Client Interest Level</label>
                                <select value={clientInterest} onChange={(e) => setClientInterest(e.target.value)} className="w-full bg-white dark:bg-black border-2 border-gray-100 dark:border-white/10 focus:border-[#00a884] rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-100 outline-none transition-all">
                                    <option value="Low">Low</option>
                                    <option value="Neutral">Neutral</option>
                                    <option value="Interested">Interested</option>
                                    <option value="Hot">Hot</option>
                                    <option value="Very Interested">Very Interested</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Next Review</label>
                                    <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} className="w-full bg-white dark:bg-black border-2 border-gray-100 dark:border-white/10 focus:border-[#00a884] rounded-xl px-4 py-3 text-[13px] font-bold text-gray-800 dark:text-gray-100 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Call Outcome</label>
                                    <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="w-full bg-white dark:bg-black border-2 border-gray-100 dark:border-white/10 focus:border-[#00a884] rounded-xl px-4 py-3 text-xs font-bold text-gray-800 dark:text-gray-100 outline-none">
                                        <option value="Pending">Pending</option><option value="Interested">Interested</option><option value="Not Interested">Not Interested</option><option value="Admission Planned">Admission Planned</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center">
                            <div className="flex flex-1 items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="hasAttachment"
                                    checked={hasAttachment}
                                    onChange={(e) => setHasAttachment(e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-[#00a884] focus:ring-[#00a884]"
                                />
                                <label htmlFor="hasAttachment" className="text-sm font-bold text-gray-700 cursor-pointer">Document / Receipt Attached</label>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">Adds +20 weight to conversion score</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Discussion Timeline & Notes</label>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} className="w-full bg-white dark:bg-black border-2 border-gray-100 dark:border-white/10 focus:border-[#00a884] rounded-xl px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none resize-none" placeholder="Write down the patient's concerns, budget discussed, or specific care requirements..." />
                        </div>
                        <div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
                            <button onClick={() => navigate(-1)} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Discard</button>
                            <button onClick={handleSubmit} disabled={addFollowUp.isPending || !notes} className="bg-[#00a884] hover:bg-[#008f6f] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 group disabled:opacity-50 disabled:shadow-none">
                                {addFollowUp.isPending ? 'Processing...' : 'Complete Follow-up'}<ChevronLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="pb-10"><div className="flex items-center gap-2 mb-4"><div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div><span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">End of record</span><div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div></div></div>
            </div>
        </div>
    )
}
