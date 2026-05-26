import { useMemo, useState, type FormEvent } from 'react'
import { Eye, LogOut, Plus, RefreshCw } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { Input } from '../../../components/Input'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useCheckoutGateEntry, useCreateVehicleEntry, useGateEntries } from '../hooks/useSecurity'
import { VisitorPassModal } from '../components/VisitorPassModal'
import type { GateEntry } from '../types'

const initialForm = {
    vehicleNo: '',
    vehicleType: '',
    driverName: '',
    driverMobile: '',
    purpose: '',
    companyName: '',
    materialDetails: '',
    remarks: ''
}

const formatTime = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const normalizeStatus = (value?: string) => String(value || '').trim().toLowerCase()

export function VehicleRegister() {
    const { data: entries = [], isLoading, refetch, isFetching } = useGateEntries()
    const createVehicleEntry = useCreateVehicleEntry()
    const checkoutEntry = useCheckoutGateEntry()
    const [formData, setFormData] = useState(initialForm)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedEntry, setSelectedEntry] = useState<GateEntry | null>(null)

    const vehicleEntries = useMemo(() => entries.filter((entry) => entry.entryType === 'VEHICLE'), [entries])
    const activeVehicles = useMemo(() => vehicleEntries.filter((entry) => normalizeStatus(entry.status) === 'checked in'), [vehicleEntries])
    const filteredVehicles = useMemo(() => {
        const query = searchQuery.toLowerCase()
        return activeVehicles.filter((entry) =>
            String(entry.vehicleNo || '').toLowerCase().includes(query) ||
            String(entry.driverName || '').toLowerCase().includes(query) ||
            String(entry.driverMobile || '').toLowerCase().includes(query) ||
            String(entry.purpose || '').toLowerCase().includes(query) ||
            String(entry.companyName || '').toLowerCase().includes(query)
        )
    }, [activeVehicles, searchQuery])

    const handleChange = (key: keyof typeof initialForm, value: string) => {
        setFormData((current) => ({ ...current, [key]: value }))
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        try {
            await createVehicleEntry.mutateAsync(formData)
            setFormData(initialForm)
            setSearchQuery('')
        } catch {
            // Toast is handled by the mutation hook.
        }
    }

    const handleCheckout = (entry: GateEntry) => {
        const remarks = window.prompt(`Checkout remarks for ${entry.vehicleNo}`, '')
        checkoutEntry.mutate({ id: entry.id, remarks: remarks || undefined })
    }

    const columns: Column<GateEntry>[] = [
        { key: 'vehicleNo', header: 'Vehicle No', sortable: true, cell: (entry) => <span className="font-black text-slate-900">{entry.vehicleNo}</span> },
        { key: 'vehicleType', header: 'Type', cell: (entry) => entry.vehicleType || '-' },
        { key: 'driverName', header: 'Driver', cell: (entry) => entry.driverName || '-' },
        { key: 'driverMobile', header: 'Mobile', cell: (entry) => entry.driverMobile || '-' },
        { key: 'purpose', header: 'Purpose' },
        { key: 'companyName', header: 'Company', cell: (entry) => entry.companyName || '-' },
        { key: 'checkInAt', header: 'Check In', cell: (entry) => formatTime(entry.checkInAt), sortable: true },
        { key: 'status', header: 'Status', cell: (entry) => <StatusHighlighter value={entry.status} /> }
    ]

    return (
        <div className="flex h-full flex-col space-y-6 bg-transparent">
            <PageHeader
                title="Vehicle Register"
                subtitle="Live vehicle entry, driver details, material movement, and checkout tracking."
                breadcrumbs={[{ label: 'Security' }, { label: 'Vehicle Register' }]}
            />

            <div className="grid gap-3 md:grid-cols-3">
                {[
                    { label: 'Vehicles Inside', value: activeVehicles.length, tone: 'bg-teal-50 text-teal-700' },
                    { label: 'Total Vehicle Entries', value: vehicleEntries.length, tone: 'bg-slate-50 text-slate-700' },
                    { label: 'Checked Out', value: vehicleEntries.filter((entry) => normalizeStatus(entry.status) === 'checked out').length, tone: 'bg-emerald-50 text-emerald-700' }
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
                    <h2 className="text-lg font-black text-slate-950">New Vehicle Entry</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    <Input label="Vehicle No." value={formData.vehicleNo} onChange={(event) => handleChange('vehicleNo', event.target.value)} required />
                    <Input label="Vehicle Type" value={formData.vehicleType} onChange={(event) => handleChange('vehicleType', event.target.value)} placeholder="Visitor, vendor, ambulance..." />
                    <Input label="Driver Name" value={formData.driverName} onChange={(event) => handleChange('driverName', event.target.value)} required />
                    <Input label="Driver Mobile" value={formData.driverMobile} onChange={(event) => handleChange('driverMobile', event.target.value)} />
                    <Input label="Purpose" value={formData.purpose} onChange={(event) => handleChange('purpose', event.target.value)} required />
                    <Input label="Company / Vendor" value={formData.companyName} onChange={(event) => handleChange('companyName', event.target.value)} />
                    <div className="md:col-span-2">
                        <Input label="Material Details" value={formData.materialDetails} onChange={(event) => handleChange('materialDetails', event.target.value)} />
                    </div>
                    <Input label="Remarks" value={formData.remarks} onChange={(event) => handleChange('remarks', event.target.value)} />
                    <div className="flex items-end md:col-span-3">
                        <button
                            type="submit"
                            disabled={createVehicleEntry.isPending}
                            className="h-11 w-full rounded-xl bg-teal-600 px-4 text-sm font-black text-white shadow-sm hover:bg-teal-700 disabled:opacity-60 md:max-w-xs"
                        >
                            {createVehicleEntry.isPending ? 'Saving...' : 'Check In Vehicle'}
                        </button>
                    </div>
                </div>
            </form>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-black text-slate-950">Active Vehicles</h2>
                        <p className="text-sm font-bold text-slate-500">Vehicles currently inside and waiting for checkout.</p>
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

                <FilterSection searchQuery={searchQuery} onSearchChange={(event) => setSearchQuery(event.target.value)} searchPlaceholder="Search vehicle, driver, vendor, or purpose..." />

                <div className="min-h-[320px]">
                    <DataTable
                        data={filteredVehicles}
                        columns={columns}
                        keyExtractor={(entry) => entry.id}
                        isLoading={isLoading}
                        emptyStateMessage={activeVehicles.length > 0 ? 'No active vehicles match the current search.' : 'No active vehicles are currently checked in.'}
                        actions={(entry) => (
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedEntry(entry)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700 hover:bg-teal-100"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Details
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
