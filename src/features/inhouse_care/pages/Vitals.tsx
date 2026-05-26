import { useMemo, useState } from 'react'
import { HeartPulse } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useHealthcarePatients, useVitalSigns } from '../../healthcare/hooks/useHealthcare'
import type { HealthcarePatient, VitalSign } from '../../healthcare/types'
import { formatDateTime, getVitalRisk, latestVitalForPatient } from '../../healthcare/utils'

type VitalRow = {
    patient: HealthcarePatient
    latestVital?: VitalSign
    risk: ReturnType<typeof getVitalRisk>
}

export function Vitals() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const { data: patients = [], isLoading: patientsLoading } = useHealthcarePatients()
    const { data: vitals = [], isLoading: vitalsLoading } = useVitalSigns()

    const rows: VitalRow[] = useMemo(() => patients.map((patient) => {
        const latestVital = latestVitalForPatient(patient.id, vitals)
        return {
            patient,
            latestVital,
            risk: getVitalRisk(latestVital)
        }
    }), [patients, vitals])

    const visibleRows = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return rows.filter((row) => {
            const matchesSearch = !query || [
                row.patient.name,
                row.latestVital?.bp,
                row.latestVital?.pulse,
                row.latestVital?.temp,
                row.latestVital?.spO2,
                row.latestVital?.notes,
                row.risk.label
            ].some((value) => String(value || '').toLowerCase().includes(query))
            const matchesStatus = !statusFilter || row.risk.level === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [rows, searchQuery, statusFilter])

    const criticalCount = rows.filter((row) => row.risk.level === 'critical').length
    const missingCount = rows.filter((row) => row.risk.level === 'missing').length
    const stableCount = rows.filter((row) => row.risk.level === 'stable').length

    const columns: Column<VitalRow>[] = [
        { key: 'sno', header: 'S.No', cell: (_row, index) => index + 1 },
        {
            key: 'patient',
            header: 'Patient',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                        <HeartPulse className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-black text-slate-950">{row.patient.name}</p>
                        <p className="text-xs font-semibold text-slate-500">Registered patient</p>
                    </div>
                </div>
            )
        },
        {
            key: 'latestVitals',
            header: 'Latest Vitals',
            cell: (row) => row.latestVital
                ? `${row.latestVital.bp || '-'} | P ${row.latestVital.pulse || '-'} | T ${row.latestVital.temp || '-'} | SpO2 ${row.latestVital.spO2 || '-'}`
                : 'No vitals recorded'
        },
        { key: 'risk', header: 'Care Status', cell: (row) => <StatusHighlighter value={row.risk.label} /> },
        { key: 'notes', header: 'Notes', cell: (row) => row.latestVital?.notes || '-' },
        { key: 'updated', header: 'Last Recorded', cell: (row) => row.latestVital ? formatDateTime(row.latestVital.createdAt) : '-' }
    ]

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="In-House Vitals"
                subtitle="Live patient vital status from healthcare records."
                breadcrumbs={[{ label: 'In-House Care' }, { label: 'Vitals' }]}
            />

            <div className="mb-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-teal-700 shadow-sm">
                    <p className="text-2xl font-black">{patients.length}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Patients</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 shadow-sm">
                    <p className="text-2xl font-black">{stableCount}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Stable</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-700 shadow-sm">
                    <p className="text-2xl font-black">{criticalCount}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Critical</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-700 shadow-sm">
                    <p className="text-2xl font-black">{missingCount}</p>
                    <p className="text-xs font-black uppercase tracking-wide">No Vitals</p>
                </div>
            </div>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search patient, vitals, notes..."
                filters={[
                    {
                        name: 'statusFilter',
                        value: statusFilter,
                        onChange: (event) => setStatusFilter(event.target.value),
                        options: [
                            { value: '', label: 'All Status' },
                            { value: 'stable', label: 'Stable' },
                            { value: 'critical', label: 'Critical' },
                            { value: 'missing', label: 'No Vitals' }
                        ]
                    }
                ]}
            />

            <DataTable
                data={visibleRows}
                columns={columns}
                keyExtractor={(row) => row.patient.id}
                isLoading={patientsLoading || vitalsLoading}
                emptyStateMessage="No live patients found. Add or admit a patient first."
            />
        </div>
    )
}
