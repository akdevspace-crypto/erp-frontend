import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useGateEntries } from '../hooks/useSecurity'
import { VisitorPassModal } from '../components/VisitorPassModal'
import type { GateEntry } from '../types'

type EntryLogRow = GateEntry & {
    duration: string
}

const formatTime = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const durationText = (start?: string, end?: string | null) => {
    if (!start || !end) return '-'
    const startMs = new Date(start).getTime()
    const endMs = new Date(end).getTime()
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) return '-'
    const minutes = Math.max(1, Math.round((endMs - startMs) / 60000))
    if (minutes < 60) return `${minutes} min`
    return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`
}

export function EntryLogs() {
    const { data: entries = [], isLoading } = useGateEntries()
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [dateFilter, setDateFilter] = useState('')
    const [selectedEntry, setSelectedEntry] = useState<GateEntry | null>(null)

    const rows = useMemo<EntryLogRow[]>(() => entries.map((entry) => ({
        ...entry,
        duration: durationText(entry.checkInAt, entry.checkOutAt)
    })), [entries])

    const filteredRows = useMemo(() => {
        const query = searchQuery.toLowerCase()
        return rows.filter((entry) =>
            (typeFilter === 'ALL' || entry.entryType === typeFilter) &&
            (statusFilter === 'ALL' || String(entry.status || '').trim().toLowerCase() === statusFilter.toLowerCase()) &&
            (!dateFilter || new Date(entry.checkInAt || entry.createdAt).toISOString().slice(0, 10) === dateFilter) &&
            (
                String(entry.visitorName || entry.driverName || entry.vehicleNo || entry.staffName || entry.empId || '').toLowerCase().includes(query) ||
                String(entry.mobile || entry.driverMobile || '').toLowerCase().includes(query) ||
                String(entry.purpose || '').toLowerCase().includes(query) ||
                String(entry.status || '').toLowerCase().includes(query) ||
                String(entry.recordedBy || '').toLowerCase().includes(query)
            )
        )
    }, [dateFilter, rows, searchQuery, statusFilter, typeFilter])

    const columns: Column<EntryLogRow>[] = [
        { key: 'entryType', header: 'Type', cell: (entry) => entry.entryType === 'VEHICLE' ? 'Vehicle' : entry.entryType === 'STAFF' ? 'Staff' : 'Visitor', sortable: true },
        { key: 'visitorName', header: 'Name / Vehicle', cell: (entry) => entry.entryType === 'VEHICLE' ? <span className="font-black text-slate-900">{entry.vehicleNo}</span> : entry.entryType === 'STAFF' ? <span className="font-black text-slate-900">{entry.staffName || entry.empId}</span> : entry.visitorName, sortable: true },
        { key: 'mobile', header: 'Mobile', cell: (entry) => entry.entryType === 'VEHICLE' ? entry.driverMobile || '-' : entry.mobile },
        { key: 'purpose', header: 'Purpose' },
        { key: 'checkInAt', header: 'In Time', cell: (entry) => formatTime(entry.checkInAt), sortable: true },
        { key: 'checkOutAt', header: 'Out Time', cell: (entry) => formatTime(entry.checkOutAt), sortable: true },
        { key: 'duration', header: 'Duration' },
        { key: 'recordedBy', header: 'Recorded By', cell: (entry) => entry.recordedBy || '-' },
        { key: 'status', header: 'Status', cell: (entry) => <StatusHighlighter value={entry.status} /> }
    ]

    return (
        <div className="flex h-full flex-col space-y-6 bg-transparent">
            <PageHeader
                title="Entry Logs"
                subtitle="Audit trail for live visitor check-in and checkout movement."
                breadcrumbs={[{ label: 'Security' }, { label: 'Entry Logs' }]}
            />

            <div className="rounded-3xl border border-gray-100/80 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:border-white/10 dark:bg-black">
                <FilterSection
                    searchQuery={searchQuery}
                    onSearchChange={(event) => setSearchQuery(event.target.value)}
                    searchPlaceholder="Search logs by visitor, mobile, purpose, status, or staff..."
                    filters={[
                        {
                            name: 'type',
                            value: typeFilter,
                            onChange: (event) => setTypeFilter(event.target.value),
                            options: [
                        { value: 'ALL', label: 'All Types' },
                        { value: 'VISITOR', label: 'Visitors' },
                        { value: 'STAFF', label: 'Staff' },
                        { value: 'VEHICLE', label: 'Vehicles' }
                            ]
                        },
                        {
                            name: 'status',
                            value: statusFilter,
                            onChange: (event) => setStatusFilter(event.target.value),
                            options: [
                        { value: 'ALL', label: 'All Status' },
                        { value: 'Checked In', label: 'Checked In' },
                        { value: 'Checked Out', label: 'Checked Out' },
                        { value: 'Expected', label: 'Expected' }
                            ]
                        }
                    ]}
                />
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(event) => setDateFilter(event.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-teal-400"
                    />
                    {dateFilter ? (
                        <button type="button" onClick={() => setDateFilter('')} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">
                            Clear Date
                        </button>
                    ) : null}
                </div>
            </div>

            <DataTable
                data={filteredRows}
                columns={columns}
                keyExtractor={(entry) => entry.id}
                isLoading={isLoading}
                emptyStateMessage="No gate entry logs found."
                actions={(entry) => (
                    <button
                        type="button"
                        onClick={() => setSelectedEntry(entry)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-200"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                    </button>
                )}
            />

            <VisitorPassModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        </div>
    )
}
