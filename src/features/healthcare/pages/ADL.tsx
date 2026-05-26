import { useMemo, useState } from 'react'
import { ClipboardCheck, Plus } from 'lucide-react'
import { ActionBar } from '../../../components/ActionBar'
import { DataTable, type Column } from '../../../components/DataTable'
import { Drawer } from '../../../components/Drawer'
import { FilterSection } from '../../../components/FilterSection'
import { Input } from '../../../components/Input'
import { PageHeader } from '../../../components/PageHeader'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useAdlRecords, useCreateAdlRecord, useHealthcarePatients, useUpdateAdlStatus } from '../hooks/useHealthcare'
import type { AdlRecord } from '../types'
import { formatDateTime } from '../utils'

export function ADLDailyLiving() {
    const [searchQuery, setSearchQuery] = useState('')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [formData, setFormData] = useState({ patientId: '', mobility: '', hygiene: '', feeding: '', notes: '' })

    const { data: patients = [], isLoading: patientsLoading } = useHealthcarePatients()
    const { data: adlRecords = [], isLoading: adlLoading } = useAdlRecords()
    const createAdl = useCreateAdlRecord()
    const updateStatus = useUpdateAdlStatus()

    const visibleRecords = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return adlRecords.filter((record) => !query || [
            record.patient?.name,
            record.mobility,
            record.hygiene,
            record.feeding,
            record.notes,
            record.status
        ].some((value) => String(value || '').toLowerCase().includes(query)))
    }, [adlRecords, searchQuery])

    const needsSupport = adlRecords.filter((record) => record.status === 'NEEDS_SUPPORT').length
    const completed = adlRecords.filter((record) => record.status === 'COMPLETED').length

    const columns: Column<AdlRecord>[] = [
        { key: 'sno', header: 'S.No', cell: (_record, index) => index + 1 },
        {
            key: 'patient',
            header: 'Patient',
            cell: (record) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                        <ClipboardCheck className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-black text-slate-950">{record.patient?.name || 'Patient'}</p>
                        <p className="text-xs font-semibold text-slate-500">Daily living check</p>
                    </div>
                </div>
            )
        },
        { key: 'mobility', header: 'Mobility', cell: (record) => record.mobility },
        { key: 'hygiene', header: 'Hygiene', cell: (record) => record.hygiene },
        { key: 'feeding', header: 'Feeding', cell: (record) => record.feeding },
        { key: 'notes', header: 'Notes', cell: (record) => record.notes || '-' },
        { key: 'status', header: 'Status', cell: (record) => <StatusHighlighter value={record.status.replace(/_/g, ' ')} /> },
        { key: 'createdAt', header: 'Recorded', cell: (record) => formatDateTime(record.createdAt), sortable: true },
        {
            key: 'actions',
            header: 'Actions',
            cell: (record) => (
                <div className="flex flex-wrap gap-2">
                    {record.status !== 'NEEDS_SUPPORT' && (
                        <button
                            type="button"
                            onClick={() => updateStatus.mutate({ id: record.id, status: 'NEEDS_SUPPORT' })}
                            className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700"
                        >
                            Needs Support
                        </button>
                    )}
                    {record.status !== 'COMPLETED' && (
                        <button
                            type="button"
                            onClick={() => updateStatus.mutate({ id: record.id, status: 'COMPLETED' })}
                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700"
                        >
                            Complete
                        </button>
                    )}
                </div>
            )
        }
    ]

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!formData.patientId || !formData.mobility.trim() || !formData.hygiene.trim() || !formData.feeding.trim()) return

        await createAdl.mutateAsync({
            patientId: formData.patientId,
            mobility: formData.mobility.trim(),
            hygiene: formData.hygiene.trim(),
            feeding: formData.feeding.trim(),
            notes: formData.notes.trim()
        })
        setFormData({ patientId: '', mobility: '', hygiene: '', feeding: '', notes: '' })
        setDrawerOpen(false)
    }

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="ADL Daily Living"
                subtitle="Live activities of daily living checks for registered patients."
                breadcrumbs={[{ label: 'Healthcare' }, { label: 'ADL Daily Living' }]}
            />

            <div className="mb-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-teal-700 shadow-sm">
                    <p className="text-2xl font-black">{adlRecords.length}</p>
                    <p className="text-xs font-black uppercase tracking-wide">ADL Records</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-700 shadow-sm">
                    <p className="text-2xl font-black">{needsSupport}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Needs Support</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 shadow-sm">
                    <p className="text-2xl font-black">{completed}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Completed</p>
                </div>
            </div>

            <ActionBar onAdd={() => setDrawerOpen(true)} addLabel="Record ADL" />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search patient, mobility, hygiene, feeding, notes..."
            />

            <DataTable
                data={visibleRecords}
                columns={columns}
                keyExtractor={(record) => record.id}
                isLoading={patientsLoading || adlLoading}
                emptyStateMessage="No live ADL records found. Record a daily living check for a patient."
            />

            <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Record ADL" size="md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="mb-1 block text-sm font-bold text-slate-700">Patient</span>
                        <select
                            required
                            value={formData.patientId}
                            onChange={(event) => setFormData((prev) => ({ ...prev, patientId: event.target.value }))}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                        >
                            <option value="">Select patient</option>
                            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
                        </select>
                    </label>
                    <Input label="Mobility" required value={formData.mobility} onChange={(event) => setFormData((prev) => ({ ...prev, mobility: event.target.value }))} placeholder="Walked with support / bed rest / independent" />
                    <Input label="Hygiene" required value={formData.hygiene} onChange={(event) => setFormData((prev) => ({ ...prev, hygiene: event.target.value }))} placeholder="Bathing, grooming, oral care notes" />
                    <Input label="Feeding" required value={formData.feeding} onChange={(event) => setFormData((prev) => ({ ...prev, feeding: event.target.value }))} placeholder="Self-fed / assisted / appetite notes" />
                    <label className="block">
                        <span className="mb-1 block text-sm font-bold text-slate-700">Notes</span>
                        <textarea
                            value={formData.notes}
                            onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                            className="min-h-24 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#00b3a7] focus:outline-none focus:ring-2 focus:ring-[#00b3a7]/20"
                            placeholder="Observation, discomfort, assistance needed..."
                        />
                    </label>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                        This saves to the live database through the ADL audit record flow without changing the database schema.
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">Cancel</button>
                        <button type="submit" disabled={createAdl.isPending || !patients.length} className="inline-flex items-center gap-2 rounded-xl bg-[#00b3a7] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60">
                            <Plus className="h-4 w-4" />
                            {createAdl.isPending ? 'Saving...' : 'Save ADL'}
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    )
}
