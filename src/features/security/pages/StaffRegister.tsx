import { useMemo, useState, type FormEvent } from 'react'
import { Eye, LogOut, Plus, RefreshCw } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { Input } from '../../../components/Input'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useCheckoutGateEntry, useCreateStaffEntry, useGateEntries } from '../hooks/useSecurity'
import { VisitorPassModal } from '../components/VisitorPassModal'
import type { GateEntry } from '../types'

const initialForm = {
    staffName: '',
    empId: '',
    department: '',
    designation: '',
    mobile: '',
    purpose: '',
    remarks: ''
}

const formatTime = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const normalizeStatus = (value?: string) => String(value || '').trim().toLowerCase()

export function StaffRegister() {
    const { data: entries = [], isLoading, refetch, isFetching } = useGateEntries()
    const createStaffEntry = useCreateStaffEntry()
    const checkoutEntry = useCheckoutGateEntry()
    const [formData, setFormData] = useState(initialForm)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedEntry, setSelectedEntry] = useState<GateEntry | null>(null)

    const staffEntries = useMemo(() => entries.filter((entry) => entry.entryType === 'STAFF'), [entries])
    const activeStaff = useMemo(() => staffEntries.filter((entry) => normalizeStatus(entry.status) === 'checked in'), [staffEntries])
    const filteredStaff = useMemo(() => {
        const query = searchQuery.toLowerCase()
        return activeStaff.filter((entry) =>
            String(entry.staffName || '').toLowerCase().includes(query) ||
            String(entry.empId || '').toLowerCase().includes(query) ||
            String(entry.department || '').toLowerCase().includes(query) ||
            String(entry.designation || '').toLowerCase().includes(query) ||
            String(entry.purpose || '').toLowerCase().includes(query)
        )
    }, [activeStaff, searchQuery])

    const handleChange = (key: keyof typeof initialForm, value: string) => {
        setFormData((current) => ({ ...current, [key]: value }))
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        try {
            await createStaffEntry.mutateAsync(formData)
            setFormData(initialForm)
            setSearchQuery('')
        } catch {
            // Toast is handled by the mutation hook.
        }
    }

    const handleCheckout = (entry: GateEntry) => {
        const remarks = window.prompt(`Checkout remarks for ${entry.staffName || entry.empId}`, '')
        checkoutEntry.mutate({ id: entry.id, remarks: remarks || undefined })
    }

    const columns: Column<GateEntry>[] = [
        { key: 'empId', header: 'Emp ID', sortable: true, cell: (entry) => <span className="font-black text-slate-900">{entry.empId}</span> },
        { key: 'staffName', header: 'Staff Name', sortable: true, cell: (entry) => entry.staffName || '-' },
        { key: 'department', header: 'Department', cell: (entry) => entry.department || '-' },
        { key: 'designation', header: 'Designation', cell: (entry) => entry.designation || '-' },
        { key: 'mobile', header: 'Mobile', cell: (entry) => entry.mobile || '-' },
        { key: 'purpose', header: 'Purpose' },
        { key: 'checkInAt', header: 'Check In', cell: (entry) => formatTime(entry.checkInAt), sortable: true },
        { key: 'status', header: 'Status', cell: (entry) => <StatusHighlighter value={entry.status} /> }
    ]

    return (
        <div className="flex h-full flex-col space-y-6 bg-transparent">
            <PageHeader
                title="Staff In-Out Register"
                subtitle="Live staff gate movement register for check-in, checkout, and security verification."
                breadcrumbs={[{ label: 'Security' }, { label: 'Staff In-Out Register' }]}
            />

            <div className="grid gap-3 md:grid-cols-3">
                {[
                    { label: 'Staff Inside', value: activeStaff.length, tone: 'bg-teal-50 text-teal-700' },
                    { label: 'Total Staff Entries', value: staffEntries.length, tone: 'bg-slate-50 text-slate-700' },
                    { label: 'Checked Out', value: staffEntries.filter((entry) => normalizeStatus(entry.status) === 'checked out').length, tone: 'bg-emerald-50 text-emerald-700' }
                ].map((item) => (
                    <div key={item.label} className={`rounded-2xl border border-slate-100 px-4 py-3 ${item.tone}`}>
                        <p className="text-2xl font-black">{item.value}</p>
                        <p className="text-xs font-black uppercase tracking-wide">{item.label}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-teal-600" />
                    <h2 className="text-lg font-black text-slate-950">New Staff Gate Entry</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    <Input label="Staff Name" value={formData.staffName} onChange={(event) => handleChange('staffName', event.target.value)} required />
                    <Input label="Employee ID" value={formData.empId} onChange={(event) => handleChange('empId', event.target.value)} required />
                    <Input label="Mobile" value={formData.mobile} onChange={(event) => handleChange('mobile', event.target.value)} />
                    <Input label="Department" value={formData.department} onChange={(event) => handleChange('department', event.target.value)} />
                    <Input label="Designation" value={formData.designation} onChange={(event) => handleChange('designation', event.target.value)} />
                    <Input label="Purpose" value={formData.purpose} onChange={(event) => handleChange('purpose', event.target.value)} required />
                    <div className="md:col-span-2">
                        <Input label="Remarks" value={formData.remarks} onChange={(event) => handleChange('remarks', event.target.value)} />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={createStaffEntry.isPending}
                            className="h-11 w-full rounded-xl bg-teal-600 px-4 text-sm font-black text-white shadow-sm hover:bg-teal-700 disabled:opacity-60"
                        >
                            {createStaffEntry.isPending ? 'Saving...' : 'Check In Staff'}
                        </button>
                    </div>
                </div>
            </form>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-black text-slate-950">Active Staff Inside</h2>
                        <p className="text-sm font-bold text-slate-500">Staff currently inside and waiting for checkout.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <FilterSection searchQuery={searchQuery} onSearchChange={(event) => setSearchQuery(event.target.value)} searchPlaceholder="Search staff, employee ID, department, or purpose..." />

                <div className="min-h-[320px]">
                    <DataTable
                        data={filteredStaff}
                        columns={columns}
                        keyExtractor={(entry) => entry.id}
                        isLoading={isLoading}
                        emptyStateMessage={activeStaff.length > 0 ? 'No active staff match the current search.' : 'No staff are currently checked in.'}
                        actions={(entry) => (
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedEntry(entry)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700 hover:bg-teal-100"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Pass
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleCheckout(entry)}
                                    disabled={checkoutEntry.isPending}
                                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-100 disabled:opacity-60"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    Check Out
                                </button>
                            </div>
                        )}
                    />
                </div>
            </section>

            <VisitorPassModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        </div>
    )
}
