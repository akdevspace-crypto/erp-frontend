import { useMemo, useState } from 'react'
import { AlertCircle, CalendarClock, CheckCircle2, CheckSquare, ClipboardList, Phone, Pill, Play, Send } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader'
import { DataTable, type Column } from '../../../components/DataTable'
import { Drawer } from '../../../components/Drawer'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import type { Task } from '../../task_log/types'
import { useTasks, useUpdateTaskStatus } from '../../task_log/hooks/useTasks'
import { useAutomationTasks, useUpdateAutomationTaskStatus } from '../../automation/hooks/useAutomation'
import { useCreateInventoryStockIssueRequest, useInventoryStock, useInventoryStockIssueRequests } from '../../inventory/hooks/useInventory'

const parseTaskDescription = (description?: string) => {
    const lines = String(description || '').split('\n')
    const details: Record<string, string> = {}

    lines.forEach((line) => {
        const [rawKey, ...rest] = line.split(':')
        const key = rawKey?.trim()
        const value = rest.join(':').trim()
        if (key && value) details[key] = value
    })

    return details
}

const normalizeStatus = (status?: string) => String(status || '').trim().toUpperCase().replace(/[\s-]+/g, '_')

const formatDate = (value?: string) => {
    if (!value) return 'No due date'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

const getTaskKind = (task: Task) => {
    const details = parseTaskDescription(task.description)
    if (details.Complaint || task.title.toLowerCase().includes('complaint')) return 'Complaint'
    if (details.Allocation || task.title.toLowerCase().includes('care duty')) return 'Service Duty'
    return task.type === 'SCHEDULED' ? 'Scheduled Task' : 'Daily Task'
}

export function MyTasks() {
    const [medicineDrawerOpen, setMedicineDrawerOpen] = useState(false)
    const [selectedMedicineTask, setSelectedMedicineTask] = useState<Task | null>(null)
    const [medicineForm, setMedicineForm] = useState({ productId: '', quantity: '', notes: '' })

    const { data = [], isLoading: tasksLoading } = useTasks({ scope: 'mine' })
    const { data: realAutomationTasks = [] } = useAutomationTasks()
    const { data: stock = [] } = useInventoryStock()
    const { data: medicineRequests = [] } = useInventoryStockIssueRequests()

    const updateTaskStatus = useUpdateTaskStatus()
    const updateAutoStatus = useUpdateAutomationTaskStatus()
    const createMedicineRequest = useCreateInventoryStockIssueRequest()

    const medicalStock = useMemo(() => (
        stock.filter((item) => item.product?.category?.toLowerCase() === 'medical' && Number(item.quantity || 0) > 0)
    ), [stock])

    const medicineOptions = useMemo(() => (
        medicalStock.map((item) => ({
            value: item.productId,
            label: `${item.product?.name || 'Medicine'} - Qty ${item.quantity}`
        }))
    ), [medicalStock])

    const selectedMedicineStock = useMemo(
        () => medicalStock.find((item) => item.productId === medicineForm.productId),
        [medicalStock, medicineForm.productId]
    )

    const taskHasMedicineRequest = useMemo(() => {
        const requestedTaskIds = new Set<string>()
        medicineRequests.forEach((request) => {
            const match = String(request.notes || '').match(/Task ID:\s*([^\s\n]+)/i)
            if (match?.[1]) requestedTaskIds.add(match[1].trim())
        })
        return (taskId: string) => requestedTaskIds.has(taskId)
    }, [medicineRequests])

    const shouldHoldCompletedDutyForMedicine = (task: Task) => (
        getTaskKind(task) === 'Service Duty' &&
        normalizeStatus(task.status) === 'COMPLETED' &&
        !taskHasMedicineRequest(task.id)
    )

    const activeTasks = useMemo(
        () => data.filter((task) => (
            !['COMPLETED', 'APPROVED', 'VERIFIED'].includes(normalizeStatus(task.status)) ||
            shouldHoldCompletedDutyForMedicine(task)
        )),
        [data, taskHasMedicineRequest]
    )

    const completedTasks = useMemo(
        () => data.filter((task) => (
            ['COMPLETED', 'APPROVED', 'VERIFIED'].includes(normalizeStatus(task.status)) &&
            !shouldHoldCompletedDutyForMedicine(task)
        )),
        [data, taskHasMedicineRequest]
    )

    const summary = useMemo(() => ({
        assigned: data.filter((task) => normalizeStatus(task.status) === 'ASSIGNED').length,
        inProgress: data.filter((task) => normalizeStatus(task.status) === 'IN_PROGRESS').length,
        waitingApproval: data.filter((task) => normalizeStatus(task.status) === 'COMPLETED').length,
        closed: data.filter((task) => ['APPROVED', 'VERIFIED'].includes(normalizeStatus(task.status))).length
    }), [data])

    const startTask = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        updateTaskStatus.mutate({ id, status: 'IN_PROGRESS' })
    }

    const completeTask = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        updateTaskStatus.mutate({ id, status: 'COMPLETED' })
    }

    const handleCall = (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        updateAutoStatus.mutate({ id: taskId, status: 'IN_PROGRESS' })
    }

    const completeAutoTask = (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        updateAutoStatus.mutate({ id: taskId, status: 'COMPLETED' })
    }

    const openMedicineRequest = (task: Task, event: React.MouseEvent) => {
        event.stopPropagation()
        setSelectedMedicineTask(task)
        setMedicineForm({ productId: '', quantity: '', notes: '' })
        setMedicineDrawerOpen(true)
    }

    const closeMedicineRequest = () => {
        setMedicineDrawerOpen(false)
        setSelectedMedicineTask(null)
        setMedicineForm({ productId: '', quantity: '', notes: '' })
    }

    const submitMedicineRequest = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!selectedMedicineTask) return

        const quantity = Math.trunc(Number(medicineForm.quantity || 0))
        const currentQuantity = Number(selectedMedicineStock?.quantity || 0)
        if (!medicineForm.productId || quantity <= 0 || quantity > currentQuantity) return

        const details = parseTaskDescription(selectedMedicineTask.description)
        const patientName = details.Patient || details.Client || selectedMedicineTask.assignedTo || 'Patient'
        const notes = [
            medicineForm.notes.trim(),
            details.Reference ? `Reference: ${details.Reference}` : '',
            details.Allocation ? `Allocation: ${details.Allocation}` : '',
            `Task: ${selectedMedicineTask.title}`,
            `Task ID: ${selectedMedicineTask.id}`,
            details['Care Type'] ? `Care Type: ${details['Care Type']}` : ''
        ].filter(Boolean).join('\n')

        await createMedicineRequest.mutateAsync({
            productId: medicineForm.productId,
            quantity,
            usageType: 'PATIENT_MEDICATION',
            issuedTo: patientName,
            notes
        })

        closeMedicineRequest()
    }

    const getPriorityClasses = (priority?: string) => {
        const normalized = String(priority || '').toUpperCase()
        if (normalized === 'HIGH' || normalized === 'CRITICAL') return 'text-red-700 bg-red-100'
        if (normalized === 'MEDIUM') return 'text-yellow-700 bg-yellow-100'
        return 'text-blue-700 bg-blue-100'
    }

    const renderTaskDetails = (task: Task) => {
        const details = parseTaskDescription(task.description)
        const kind = getTaskKind(task)

        return (
            <div className="max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">
                        {kind}
                    </span>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{task.title}</p>
                </div>

                <div className="mt-2 space-y-0.5 text-xs text-gray-500">
                    {details.Reference && <p><span className="font-semibold text-gray-700">Reference:</span> {details.Reference}</p>}
                    {details.Client && <p><span className="font-semibold text-gray-700">Client:</span> {details.Client}</p>}
                    {details.Patient && <p><span className="font-semibold text-gray-700">Patient:</span> {details.Patient}</p>}
                    {details['Care Type'] && <p><span className="font-semibold text-gray-700">Care:</span> {details['Care Type']}</p>}
                    {details.Category && <p><span className="font-semibold text-gray-700">Category:</span> {details.Category}</p>}
                    {details.Priority && <p><span className="font-semibold text-gray-700">Priority:</span> {details.Priority}</p>}
                    {details.Notes && <p><span className="font-semibold text-gray-700">Notes:</span> {details.Notes}</p>}
                    {!Object.keys(details).length && <p>{task.description || 'Staff task'}</p>}
                </div>
            </div>
        )
    }

    const columns: Column<Task>[] = [
        {
            key: 'title',
            header: 'Work Details',
            sortable: true,
            cell: renderTaskDetails
        },
        { key: 'assignedBy', header: 'Assigned By' },
        { key: 'dueDate', header: 'Due Date', sortable: true, cell: (task) => formatDate(task.dueDate) },
        {
            key: 'priority',
            header: 'Priority',
            cell: (task) => (
                <span className={`px-2 py-1 text-xs font-semibold ${getPriorityClasses(task.priority)}`}>
                    {task.priority || 'MEDIUM'}
                </span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            cell: (task) => (
                <div className="space-y-1">
                    <StatusHighlighter value={task.status} />
                            {normalizeStatus(task.status) === 'COMPLETED' && (
                        <p className="text-xs font-semibold text-amber-700">
                            {shouldHoldCompletedDutyForMedicine(task) ? 'Medicine request pending' : 'Waiting for approval'}
                        </p>
                    )}
                </div>
            )
        }
    ]

    return (
        <div className="flex flex-col h-full space-y-6">
            <PageHeader title="My Daily Tasks" breadcrumbs={[{ label: 'Profile' }, { label: 'My Tasks' }]} />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <ClipboardList className="h-5 w-5 text-blue-700" />
                    <p className="mt-3 text-2xl font-black text-blue-900">{summary.assigned}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Assigned</p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                    <CalendarClock className="h-5 w-5 text-amber-700" />
                    <p className="mt-3 text-2xl font-black text-amber-900">{summary.inProgress}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700">In Progress</p>
                </div>
                <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
                    <AlertCircle className="h-5 w-5 text-orange-700" />
                    <p className="mt-3 text-2xl font-black text-orange-900">{summary.waitingApproval}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-orange-700">Waiting Approval</p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                    <p className="mt-3 text-2xl font-black text-emerald-900">{summary.closed}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Approved</p>
                </div>
            </div>

            {realAutomationTasks.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-orange-900/10 border-l-4 border-orange-500 p-3 rounded-r-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <h2 className="text-sm font-black text-orange-800 dark:text-orange-300 uppercase tracking-widest">Escalated Leads</h2>
                        </div>
                        <span className="text-[10px] bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-full font-bold">
                            {realAutomationTasks.length} PENDING
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {realAutomationTasks.map((task) => (
                            <div key={task.id} className="flex-1 min-w-[300px] bg-white dark:bg-gray-800 p-3 rounded-md border border-orange-200 dark:border-orange-800 flex justify-between items-center group transition-all hover:shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-full">
                                        <Phone className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">{task.description.split(':')[0]}</h4>
                                        <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-1">{task.description.split(':')[1] || task.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {task.status === 'PENDING' ? (
                                        <button
                                            onClick={(e) => handleCall(task.id, e)}
                                            className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] px-3 py-1.5 rounded font-black uppercase transition-all active:scale-95 shadow-sm flex items-center gap-1"
                                        >
                                            <Phone className="h-3 w-3" />
                                            Start
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => completeAutoTask(task.id, e)}
                                            className="bg-green-600 hover:bg-green-700 text-white text-[10px] px-3 py-1.5 rounded font-black uppercase transition-all shadow-sm"
                                        >
                                            Done
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="min-h-[280px] shrink-0">
                <DataTable
                    data={activeTasks}
                    columns={columns}
                    keyExtractor={(task) => task.id}
                    isLoading={tasksLoading}
                    emptyStateMessage="You have no assigned work right now."
                    actions={(task) => (
                        <>
                            {normalizeStatus(task.status) === 'ASSIGNED' && (
                                <button onClick={(event) => startTask(task.id, event)} className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100" title="Start work">
                                    <Play className="h-4 w-4" />
                                    Start
                                </button>
                            )}
                            {normalizeStatus(task.status) === 'IN_PROGRESS' && (
                                <button onClick={(event) => completeTask(task.id, event)} className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-bold text-green-700 hover:bg-green-100" title="Submit completed work for approval">
                                    <CheckSquare className="h-4 w-4" />
                                    Complete
                                </button>
                            )}
                            {getTaskKind(task) === 'Service Duty' && normalizeStatus(task.status) === 'COMPLETED' && !taskHasMedicineRequest(task.id) && (
                                <button onClick={(event) => openMedicineRequest(task, event)} className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-1 text-xs font-bold text-teal-700 hover:bg-teal-100" title="Request medicine for this patient">
                                    <Pill className="h-4 w-4" />
                                    Request Medicine
                                </button>
                            )}
                        </>
                    )}
                />
            </div>

            <div className="mt-8">
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Recently Completed</h3>
                <DataTable
                    data={completedTasks}
                    columns={columns}
                    keyExtractor={(task) => task.id}
                    isLoading={tasksLoading}
                    emptyStateMessage="No completed work yet."
                />
            </div>

            <Drawer isOpen={medicineDrawerOpen} onClose={closeMedicineRequest} title="Request Medicine For Patient" size="md">
                <form onSubmit={submitMedicineRequest} className="space-y-4">
                    {selectedMedicineTask ? (
                        <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
                            <p className="font-black">{selectedMedicineTask.title}</p>
                            <p className="mt-1 text-xs text-teal-700">
                                Patient: {parseTaskDescription(selectedMedicineTask.description).Patient || parseTaskDescription(selectedMedicineTask.description).Client || selectedMedicineTask.assignedTo || 'Patient'}
                            </p>
                        </div>
                    ) : null}

                    <Select
                        label="Medicine"
                        required
                        value={medicineForm.productId}
                        onChange={(event) => setMedicineForm((prev) => ({ ...prev, productId: event.target.value }))}
                        options={medicineOptions}
                        placeholder={medicineOptions.length ? 'Select medicine from live stock' : 'No medicine stock available'}
                    />
                    <Input
                        label="Quantity"
                        required
                        type="number"
                        min="1"
                        max={selectedMedicineStock?.quantity || undefined}
                        step="1"
                        value={medicineForm.quantity}
                        onChange={(event) => setMedicineForm((prev) => ({ ...prev, quantity: event.target.value }))}
                        placeholder="Enter required quantity"
                    />
                    <Input
                        label="Clinical Notes"
                        value={medicineForm.notes}
                        onChange={(event) => setMedicineForm((prev) => ({ ...prev, notes: event.target.value }))}
                        placeholder="Reason, dose instruction, or patient condition"
                    />

                    <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                        This request goes to Medical Inventory for approval. Stock is reduced only after approval.
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={closeMedicineRequest} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-black dark:text-gray-300 dark:hover:bg-white/5">Cancel</button>
                        <button type="submit" disabled={createMedicineRequest.isPending || medicineOptions.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-[#00b3a7] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#01867c] disabled:opacity-60">
                            <Send className="h-4 w-4" />
                            {createMedicineRequest.isPending ? 'Sending...' : 'Send For Approval'}
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    )
}
