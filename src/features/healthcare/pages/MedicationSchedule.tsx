import { useMemo, useState } from 'react'
import { CalendarClock, CheckCircle2, Pill, Plus } from 'lucide-react'
import { ActionBar } from '../../../components/ActionBar'
import { DataTable, type Column } from '../../../components/DataTable'
import { Drawer } from '../../../components/Drawer'
import { FilterSection } from '../../../components/FilterSection'
import { Input } from '../../../components/Input'
import { PageHeader } from '../../../components/PageHeader'
import { Select } from '../../../components/Select'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useInventoryStockIssueRequests } from '../../inventory/hooks/useInventory'
import type { InventoryStockIssueRequest } from '../../inventory/types'
import { useAdministerMedicationDose, useCreateMedicationSchedule, useMedicationSchedules } from '../hooks/useHealthcare'
import type { MedicationSchedule } from '../types'

const medicineCategory = 'medical'
const medicineUsageType = 'PATIENT_MEDICATION'
const doseSlots = ['Morning', 'Afternoon', 'Night']

const today = () => new Date().toISOString().slice(0, 10)

const formatDateTime = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-GB')
}

const isMedicineIssue = (request: InventoryStockIssueRequest) => {
    const category = String(request.category || '').toLowerCase()
    return request.status === 'APPROVED' && (category === medicineCategory || request.usageType === medicineUsageType)
}

const scheduleStatusLabel = (status: MedicationSchedule['status']) => {
    if (status === 'COMPLETED') return 'Administered'
    if (status === 'IN_PROGRESS') return 'Partially Given'
    return 'Scheduled'
}

export function MedicationSchedule() {
    const [searchQuery, setSearchQuery] = useState('')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedSlots, setSelectedSlots] = useState<string[]>(['Morning'])
    const [formData, setFormData] = useState({ medicineIssueId: '', dose: '', frequency: 'Once Daily', startDate: today(), notes: '' })

    const { data: issueRequests = [], isLoading: isIssuesLoading } = useInventoryStockIssueRequests()
    const { data: schedules = [], isLoading: isSchedulesLoading } = useMedicationSchedules()
    const createSchedule = useCreateMedicationSchedule()
    const administerDose = useAdministerMedicationDose()

    const approvedMedicineIssues = useMemo(() => issueRequests.filter(isMedicineIssue), [issueRequests])
    const scheduledIssueIds = useMemo(() => new Set(schedules.map((schedule) => schedule.medicineIssueId)), [schedules])
    const unscheduledMedicineIssues = useMemo(
        () => approvedMedicineIssues.filter((request) => !scheduledIssueIds.has(request.id)),
        [approvedMedicineIssues, scheduledIssueIds]
    )

    const issueOptions = useMemo(() => (
        unscheduledMedicineIssues.map((request) => ({
            value: request.id,
            label: `${request.productName} - ${request.issuedTo || 'Patient'} - Qty ${request.quantity}`
        }))
    ), [unscheduledMedicineIssues])

    const selectedIssue = useMemo(
        () => approvedMedicineIssues.find((request) => request.id === formData.medicineIssueId),
        [approvedMedicineIssues, formData.medicineIssueId]
    )

    const visibleSchedules = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return schedules.filter((schedule) => !query || [
            schedule.medicineName,
            schedule.patientName,
            schedule.dose,
            schedule.frequency,
            schedule.status,
            schedule.notes || ''
        ].some((value) => String(value).toLowerCase().includes(query)))
    }, [schedules, searchQuery])

    const toggleSlot = (slot: string) => {
        setSelectedSlots((prev) => (
            prev.includes(slot)
                ? prev.filter((item) => item !== slot)
                : [...prev, slot]
        ))
    }

    const resetForm = () => {
        setFormData({ medicineIssueId: '', dose: '', frequency: 'Once Daily', startDate: today(), notes: '' })
        setSelectedSlots(['Morning'])
    }

    const openScheduleDrawer = (issue?: InventoryStockIssueRequest) => {
        setFormData({ medicineIssueId: issue?.id || '', dose: '', frequency: 'Once Daily', startDate: today(), notes: '' })
        setSelectedSlots(['Morning'])
        setDrawerOpen(true)
    }

    const handleCreateSchedule = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!selectedIssue || !formData.dose.trim() || selectedSlots.length === 0) return

        await createSchedule.mutateAsync({
            medicineIssueId: selectedIssue.id,
            medicineName: selectedIssue.productName,
            patientName: selectedIssue.issuedTo || 'Patient',
            dose: formData.dose.trim(),
            frequency: formData.frequency,
            times: selectedSlots,
            startDate: formData.startDate,
            notes: formData.notes.trim()
        })

        resetForm()
        setDrawerOpen(false)
    }

    const handleAdministerDose = async (schedule: MedicationSchedule, slot: string) => {
        const administeredSlots = Array.isArray(schedule.administeredSlots) ? schedule.administeredSlots : []
        if (administeredSlots.includes(slot)) return
        await administerDose.mutateAsync({ id: schedule.id, slot })
    }

    const columns: Column<MedicationSchedule>[] = [
        { key: 'sno', header: 'S.No', cell: (_item, index) => index + 1, sortable: false },
        {
            key: 'medicine',
            header: 'Medicine / Patient',
            cell: (schedule) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                        <Pill className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 dark:text-gray-100">{schedule.medicineName}</span>
                        <span className="text-xs font-semibold text-gray-500">{schedule.patientName}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'dose',
            header: 'Dose Plan',
            cell: (schedule) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{schedule.dose}</span>
                    <span className="text-xs text-gray-500">{schedule.frequency} from {schedule.startDate}</span>
                    <span className="text-xs text-gray-400">{schedule.notes || '-'}</span>
                </div>
            )
        },
        {
            key: 'times',
            header: 'Dose Slots',
            cell: (schedule) => (
                <div className="flex flex-wrap gap-2">
                    {(Array.isArray(schedule.times) ? schedule.times : []).map((slot) => {
                        const administeredSlots = Array.isArray(schedule.administeredSlots) ? schedule.administeredSlots : []
                        const done = administeredSlots.includes(slot)
                        return (
                            <button
                                key={slot}
                                type="button"
                                onClick={() => handleAdministerDose(schedule, slot)}
                                disabled={done || administerDose.isPending}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black transition disabled:opacity-70 ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                                title={done ? `${slot} dose already administered` : `Mark ${slot} dose as given`}
                            >
                                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                                {done ? `${slot} Given` : `Mark ${slot} Given`}
                            </button>
                        )
                    })}
                </div>
            )
        },
        {
            key: 'history',
            header: 'Administration History',
            cell: (schedule) => {
                const history = Array.isArray(schedule.administeredHistory) ? schedule.administeredHistory : []
                if (!history.length) return <span className="text-xs font-semibold text-gray-400">No dose given yet</span>

                return (
                    <div className="max-w-56 space-y-1">
                        {history.slice(-2).map((item, index) => (
                            <div key={`${item.slot}-${item.administeredAt || index}`} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                                <p className="font-black">{item.slot} given</p>
                                <p className="truncate">{item.administeredBy || 'Care staff'} - {formatDateTime(item.administeredAt)}</p>
                            </div>
                        ))}
                        {history.length > 2 ? <p className="text-[11px] font-bold text-gray-400">+{history.length - 2} earlier dose record(s)</p> : null}
                    </div>
                )
            }
        },
        { key: 'status', header: 'Status', cell: (schedule) => <StatusHighlighter value={scheduleStatusLabel(schedule.status)} /> },
        {
            key: 'updatedAt',
            header: 'Last Updated',
            cell: (schedule) => formatDateTime(schedule.updatedAt),
            sortable: true
        }
    ]

    const summary = [
        { label: 'Schedules', value: schedules.length, tone: 'bg-teal-50 text-teal-700' },
        { label: 'Pending Doses', value: schedules.reduce((sum, item) => {
            const times = Array.isArray(item.times) ? item.times : []
            const administeredSlots = Array.isArray(item.administeredSlots) ? item.administeredSlots : []
            return sum + Math.max(0, times.length - administeredSlots.length)
        }, 0), tone: 'bg-amber-50 text-amber-700' },
        { label: 'Completed', value: schedules.filter((item) => item.status === 'COMPLETED').length, tone: 'bg-emerald-50 text-emerald-700' }
    ]

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="Medication Schedule"
                subtitle="Schedule issued medicines and mark daily dose administration."
                breadcrumbs={[{ label: 'Healthcare' }, { label: 'Medication Schedule' }]}
            />

            <div className="mb-5 grid gap-3 md:grid-cols-3">
                {summary.map((item) => (
                    <div key={item.label} className={`rounded-2xl border border-slate-100 p-4 shadow-sm ${item.tone}`}>
                        <p className="text-2xl font-black">{item.value}</p>
                        <p className="text-xs font-black uppercase tracking-wide">{item.label}</p>
                    </div>
                ))}
            </div>

            <ActionBar onAdd={() => openScheduleDrawer()} addLabel="Create Schedule" />

            <div className="mb-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-black text-gray-900 dark:text-gray-100">Issued medicines waiting for schedule</p>
                        <p className="text-xs font-semibold text-gray-500">Approved medicine issues appear here before patient dose tracking starts.</p>
                    </div>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                        {unscheduledMedicineIssues.length} Pending
                    </span>
                </div>
                {unscheduledMedicineIssues.length ? (
                    <div className="grid gap-2 lg:grid-cols-2">
                        {unscheduledMedicineIssues.slice(0, 4).map((issue) => (
                            <div key={issue.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-gray-900 dark:text-gray-100">{issue.productName}</p>
                                    <p className="text-xs font-semibold text-gray-500">Qty {issue.quantity} issued to {issue.issuedTo || 'Patient'}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openScheduleDrawer(issue)}
                                    className="rounded-lg bg-[#00b3a7] px-3 py-1.5 text-xs font-black text-white shadow-sm transition hover:bg-[#01867c]"
                                >
                                    Create Schedule
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                        All approved issued medicines are already scheduled.
                    </div>
                )}
            </div>

            <div className="mb-4 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
                <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Schedules are created from approved medicine issue records, so patient medication tracking starts only after stock is approved.
                </div>
            </div>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search medicine, patient, dose, status..."
            />

            <DataTable
                data={visibleSchedules}
                columns={columns}
                keyExtractor={(schedule) => schedule.id}
                isLoading={isIssuesLoading || isSchedulesLoading}
                emptyStateMessage="No medication schedules found. Approve a medicine request, then create a schedule."
            />

            <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Create Medication Schedule" size="md">
                <form onSubmit={handleCreateSchedule} className="space-y-4">
                    <Select
                        label="Issued Medicine"
                        required
                        value={formData.medicineIssueId}
                        onChange={(event) => setFormData((prev) => ({ ...prev, medicineIssueId: event.target.value }))}
                        options={issueOptions}
                        placeholder={issueOptions.length ? 'Select approved medicine issue' : 'No unscheduled issued medicines'}
                    />
                    <Input label="Dose" required value={formData.dose} onChange={(event) => setFormData((prev) => ({ ...prev, dose: event.target.value }))} placeholder="1 tablet after food" />
                    <Select
                        label="Frequency"
                        value={formData.frequency}
                        onChange={(event) => setFormData((prev) => ({ ...prev, frequency: event.target.value }))}
                        options={['Once Daily', 'Twice Daily', 'Thrice Daily', 'As Needed'].map((value) => ({ value, label: value }))}
                    />
                    <Input label="Start Date" type="date" required value={formData.startDate} onChange={(event) => setFormData((prev) => ({ ...prev, startDate: event.target.value }))} />
                    <div>
                        <p className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-200">Dose Slots</p>
                        <div className="flex flex-wrap gap-2">
                            {doseSlots.map((slot) => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => toggleSlot(slot)}
                                    className={`rounded-full px-4 py-2 text-xs font-black transition ${selectedSlots.includes(slot) ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Input label="Notes" value={formData.notes} onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Monitoring notes or instruction" />

                    <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                        Dose completion is stored in the database through the medication schedule audit trail.
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-black dark:text-gray-300 dark:hover:bg-white/5">Cancel</button>
                        <button type="submit" disabled={createSchedule.isPending || issueOptions.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-[#00b3a7] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#01867c] disabled:opacity-60">
                            <Plus className="h-4 w-4" />
                            {createSchedule.isPending ? 'Saving...' : 'Save Schedule'}
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    )
}
