import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useGateEntries } from '../hooks/useSecurity'
import { VisitorPassModal } from '../components/VisitorPassModal'
import type { GateEntry } from '../types'

const formatTime = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function VisitorManagement() {
    const { data: entries = [], isLoading } = useGateEntries()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedEntry, setSelectedEntry] = useState<GateEntry | null>(null)

    const filteredEntries = useMemo(() => {
        const query = searchQuery.toLowerCase()
        return entries.filter((entry) => entry.entryType !== 'VEHICLE' && entry.entryType !== 'STAFF').filter((entry) =>
            String(entry.visitorName || '').toLowerCase().includes(query) ||
            String(entry.mobile || '').toLowerCase().includes(query) ||
            String(entry.purpose || '').toLowerCase().includes(query) ||
            String(entry.visitingPerson || '').toLowerCase().includes(query) ||
            String(entry.status || '').toLowerCase().includes(query)
        )
    }, [entries, searchQuery])

    const columns: Column<GateEntry>[] = [
        { key: 'visitorName', header: 'Visitor', sortable: true, cell: (entry) => <span className="font-black text-slate-900">{entry.visitorName || '-'}</span> },
        { key: 'mobile', header: 'Mobile' },
        { key: 'purpose', header: 'Purpose' },
        { key: 'visitingPerson', header: 'Visiting', cell: (entry) => entry.visitingPerson || '-' },
        { key: 'department', header: 'Department', cell: (entry) => entry.department || '-' },
        { key: 'checkInAt', header: 'Check In', cell: (entry) => formatTime(entry.checkInAt), sortable: true },
        { key: 'checkOutAt', header: 'Check Out', cell: (entry) => formatTime(entry.checkOutAt), sortable: true },
        { key: 'status', header: 'Status', cell: (entry) => <StatusHighlighter value={entry.status} /> }
    ]

    return (
        <div className="flex h-full flex-col space-y-6 bg-transparent">
            <PageHeader
                title="Visitor Management"
                subtitle="Live visitor register from gate check-in and checkout records."
                breadcrumbs={[{ label: 'Security' }, { label: 'Visitor Management' }]}
            />

            <FilterSection searchQuery={searchQuery} onSearchChange={(event) => setSearchQuery(event.target.value)} searchPlaceholder="Search visitor, mobile, purpose, or status..." />

            <DataTable
                data={filteredEntries}
                columns={columns}
                keyExtractor={(entry) => entry.id}
                isLoading={isLoading}
                emptyStateMessage="No visitor entries found. Create one from Gate Management."
                actions={(entry) => (
                    <button
                        type="button"
                        onClick={() => setSelectedEntry(entry)}
                        className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700 hover:bg-teal-100"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        View Pass
                    </button>
                )}
            />

            <VisitorPassModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        </div>
    )
}
