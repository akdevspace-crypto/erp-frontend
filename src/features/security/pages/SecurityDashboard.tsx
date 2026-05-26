import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ClipboardList, DoorOpen, ShieldCheck, Truck, UserCog, Users } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useGateEntries } from '../hooks/useSecurity'
import type { GateEntry } from '../types'

const normalizeStatus = (value?: string) => String(value || '').trim().toLowerCase()
const todayKey = () => new Date().toISOString().slice(0, 10)
const dateKey = (value?: string | null) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 10)
}

const formatTime = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const entryName = (entry: GateEntry) => {
    if (entry.entryType === 'VEHICLE') return entry.vehicleNo || '-'
    if (entry.entryType === 'STAFF') return entry.staffName || entry.empId || '-'
    return entry.visitorName || '-'
}

const entryTypeLabel = (entry: GateEntry) => {
    if (entry.entryType === 'VEHICLE') return 'Vehicle'
    if (entry.entryType === 'STAFF') return 'Staff'
    return 'Visitor'
}

export function SecurityDashboard() {
    const { data: entries = [], isLoading } = useGateEntries()
    const [queueType, setQueueType] = useState('ALL')

    const today = todayKey()
    const activeEntries = useMemo(() => entries.filter((entry) => normalizeStatus(entry.status) === 'checked in'), [entries])
    const expectedVisitors = useMemo(() => entries.filter((entry) => entry.entryType !== 'VEHICLE' && entry.entryType !== 'STAFF' && normalizeStatus(entry.status) === 'expected'), [entries])
    const todayEntries = useMemo(() => entries.filter((entry) => dateKey(entry.checkInAt || entry.createdAt) === today), [entries, today])
    const todayCheckedOut = useMemo(() => entries.filter((entry) => normalizeStatus(entry.status) === 'checked out' && dateKey(entry.checkOutAt || entry.updatedAt) === today), [entries, today])

    const queueRows = useMemo(() => {
        const rows = activeEntries.filter((entry) => queueType === 'ALL' || entry.entryType === queueType)
        return rows.slice(0, 8)
    }, [activeEntries, queueType])

    const stats = [
        { label: 'Visitors Inside', value: activeEntries.filter((entry) => entry.entryType !== 'VEHICLE' && entry.entryType !== 'STAFF').length, icon: Users, tone: 'bg-teal-50 text-teal-700', href: '/security/gate-management' },
        { label: 'Staff Inside', value: activeEntries.filter((entry) => entry.entryType === 'STAFF').length, icon: UserCog, tone: 'bg-sky-50 text-sky-700', href: '/security/staff-register' },
        { label: 'Vehicles Inside', value: activeEntries.filter((entry) => entry.entryType === 'VEHICLE').length, icon: Truck, tone: 'bg-indigo-50 text-indigo-700', href: '/security/vehicle-register' },
        { label: 'Expected Visitors', value: expectedVisitors.length, icon: CalendarClock, tone: 'bg-amber-50 text-amber-700', href: '/security/gate-management' },
        { label: 'Today Entries', value: todayEntries.length, icon: DoorOpen, tone: 'bg-slate-50 text-slate-700', href: '/security/entry-logs' },
        { label: 'Today Checked Out', value: todayCheckedOut.length, icon: ShieldCheck, tone: 'bg-emerald-50 text-emerald-700', href: '/security/entry-logs' }
    ]

    const columns: Column<GateEntry>[] = [
        { key: 'entryType', header: 'Type', cell: entryTypeLabel, sortable: true },
        { key: 'visitorName', header: 'Name / Ref', cell: (entry) => <span className="font-black text-slate-900">{entryName(entry)}</span>, sortable: true },
        { key: 'purpose', header: 'Purpose', cell: (entry) => entry.purpose || '-' },
        { key: 'checkInAt', header: 'Check In', cell: (entry) => formatTime(entry.checkInAt), sortable: true },
        { key: 'recordedBy', header: 'Recorded By', cell: (entry) => entry.recordedBy || '-' },
        { key: 'status', header: 'Status', cell: (entry) => <StatusHighlighter value={entry.status} /> }
    ]

    return (
        <div className="flex h-full flex-col space-y-6 bg-transparent">
            <PageHeader
                title="Security Dashboard"
                subtitle="Live gate, visitor, staff, vehicle, and checkout monitoring."
                breadcrumbs={[{ label: 'UNCF' }, { label: 'Security' }, { label: 'Dashboard' }]}
                action={(
                    <div className="flex flex-wrap gap-2">
                        <Link to="/security/gate-management" className="rounded-full bg-teal-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-teal-700">Gate Entry</Link>
                        <Link to="/security/entry-logs" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">Entry Logs</Link>
                    </div>
                )}
            />

            <div className="grid gap-3 md:grid-cols-3 2xl:grid-cols-6">
                {stats.map((item) => (
                    <Link key={item.label} to={item.href} className={`rounded-2xl border border-slate-100 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.tone}`}>
                        <item.icon className="mb-3 h-5 w-5" />
                        <p className="text-2xl font-black">{item.value}</p>
                        <p className="text-xs font-black uppercase tracking-wide">{item.label}</p>
                    </Link>
                ))}
            </div>

            <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Action Queue</p>
                        <h2 className="text-xl font-black text-slate-950">Currently inside</h2>
                        <p className="text-sm font-bold text-slate-500">Open movements that still need checkout.</p>
                    </div>
                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                        {[
                            ['ALL', 'All'],
                            ['STAFF', 'Staff'],
                            ['VEHICLE', 'Vehicles'],
                            ['VISITOR', 'Visitors']
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setQueueType(value)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-black ${queueType === value ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <DataTable
                    data={queueRows}
                    columns={columns}
                    keyExtractor={(entry) => entry.id}
                    isLoading={isLoading}
                    emptyStateMessage="No active gate movements waiting for checkout."
                    actions={(entry) => (
                        <Link to={entry.entryType === 'STAFF' ? '/security/staff-register' : entry.entryType === 'VEHICLE' ? '/security/vehicle-register' : '/security/gate-management'} className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700 hover:bg-teal-100">
                            Open
                        </Link>
                    )}
                />
            </section>

            <div className="grid gap-3 md:grid-cols-3">
                {[
                    { label: 'Visitor Register', href: '/security/visitor-management' },
                    { label: 'Vehicle Register', href: '/security/vehicle-register' },
                    { label: 'Staff Register', href: '/security/staff-register' }
                ].map((item) => (
                    <Link key={item.href} to={item.href} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-black text-slate-700 shadow-sm hover:bg-teal-50 hover:text-teal-700">
                        <ClipboardList className="mb-3 h-5 w-5 text-teal-600" />
                        {item.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}
