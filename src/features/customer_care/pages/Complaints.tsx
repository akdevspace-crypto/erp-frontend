import { useRef, useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { ActionBar } from '../../../components/ActionBar'
import { Drawer } from '../../../components/Drawer'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { Edit2, Eye } from 'lucide-react'
import { useComplaints, useCreateComplaint, useUpdateComplaintWorkflow } from '../hooks/useCustomerCare'
import { useToast } from '../../../components/Toast'
import { useAuthStore } from '../../../store/authStore'
import { useUnits } from '../../master/hooks/useUnit'
import { useStaff } from '../../hr/hooks/useHR'

const toApiComplaintStatus = (value: string): 'OPEN' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED' => {
    const normalized = String(value || '').toLowerCase()
    if (normalized === 'closed') return 'CLOSED'
    if (normalized === 'resolved') return 'RESOLVED'
    if (normalized === 'in progress' || normalized === 'assigned') return 'ASSIGNED'
    return 'OPEN'
}

export function Complaints() {
    const { data: dbComplaints = [], isLoading } = useComplaints()
    const { data: units = [] } = useUnits()
    const { data: staff = [] } = useStaff({ scope: 'all' })
    const createComplaint = useCreateComplaint()
    const updateComplaintWorkflow = useUpdateComplaintWorkflow()
    const { toast } = useToast()
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || '')
    const canReadAllUnits = useAuthStore((state) => {
        const roleName = typeof state.user?.role === 'string'
            ? state.user.role
            : state.user?.role?.name || ''
        return state.user?.unitAccess?.includes('*') || roleName.trim().toLowerCase() === 'customer relations manager'
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedAttachmentName, setSelectedAttachmentName] = useState('')
    const attachmentInputRef = useRef<HTMLInputElement | null>(null)

    // Standard Drawer layout management
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [drawerMode, setDrawerMode] = useState<'raise' | 'update' | 'view'>('raise')
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
    const unitOptions = units.map((unit) => ({
        value: unit.id,
        label: unit.location?.label ? `${unit.name} - ${unit.location.label}` : unit.name
    }))
    const staffOptions = staff
        .filter((member) => member.user?.id && member.user.isActive && !member.isDeleted)
        .map((member) => ({
            value: member.id,
            label: `${member.name}${member.empId ? ` (${member.empId})` : ''}`
        }))
    const selectedUnitId = selectedComplaint?.unitId || activeUnitId || unitOptions[0]?.value || ''
    const filteredComplaints = dbComplaints.filter((row: any) => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return true

        return [
            row.ticketNo,
            row.ref,
            row.clientName,
            row.category,
            row.priority,
            row.status,
            row.description,
            row.assignedTo,
            row.unitId
        ].some((value) => String(value || '').toLowerCase().includes(query))
    })

    const resetAttachment = () => {
        setSelectedAttachmentName('')
        if (attachmentInputRef.current) {
            attachmentInputRef.current.value = ''
        }
    }

    const handleRaise = () => {
        setSelectedComplaint(null)
        setDrawerMode('raise')
        resetAttachment()
        setIsDrawerOpen(true)
    }

    const handleUpdate = (row: any) => {
        setSelectedComplaint(row)
        setDrawerMode('update')
        resetAttachment()
        setIsDrawerOpen(true)
    }

    const handleView = (row: any) => {
        setSelectedComplaint(row)
        setDrawerMode('view')
        resetAttachment()
        setIsDrawerOpen(true)
    }

    const columns: Column<any>[] = [
        { key: 'sno', header: 'S.No', cell: (_, index) => <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{index + 1}</span> },
        { key: 'clientRef', header: 'Client Ref. No.', cell: (row) => <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{row.ref || row.ticketNo || row.id.split('-')[0]}</span> },
        {
            key: 'serviceDetails', header: 'Service Details', cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{row.service || row.category || 'General Form'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">ACARE, Coimbatore</span>
                </div>
            )
        },
        {
            key: 'clientDetails', header: 'Client Details', cell: (row) => (
                <div className="flex flex-col items-center justify-center">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{row.clientName || 'Walk-in'}</span>
                    {row.phone && <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">{row.phone}</span>}
                </div>
            )
        },
        { key: 'complaintDate', header: 'Complaint Date', cell: (row) => <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{row.date || new Date().toISOString().split('T')[0]}</span> },
        { key: 'staffAllocation', header: 'Staff Allocation', cell: (row) => <span className="text-sm text-gray-700 dark:text-gray-300">{row.staff || row.assignedTo || '-'}</span> },
        { key: 'complaintStatus', header: 'Complaint Status', cell: (row) => <StatusHighlighter value={row.status} /> },
        {
            key: 'action', header: '', cell: (row) => {
                if (row.status === 'Issue Rectified' || row.status === 'Contract Terminated') {
                    return (
                        <button onClick={() => handleView(row)} className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-white/5 rounded" title="View Details">
                            <Eye className="h-4 w-4" />
                        </button>
                    )
                }
                return (
                    <button onClick={() => handleUpdate(row)} className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/5 rounded" title="Update Complaint">
                        <Edit2 className="h-4 w-4" />
                    </button>
                )
            }
        }
    ]

    // Form submission wrapper
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)

        if (drawerMode === 'raise') {
            const description = String(fd.get('description') || '').trim()
            if (description.length < 5) {
                toast({ type: 'error', title: 'Complaint required', message: 'Please enter at least 5 characters in the complaint comments.' })
                return
            }

            createComplaint.mutate({
                clientName: (fd.get('reference') as string) || 'Walk-in Client',
                category: String(fd.get('category') || 'General Complaint'),
                priority: String(fd.get('priority') || 'Medium'),
                status: 'Open',
                description,
                unitId: (fd.get('unitId') as string) || activeUnitId
            } as any, {
                onSuccess: () => {
                    resetAttachment()
                    setIsDrawerOpen(false)
                }
            })
        } else {
            if (!selectedComplaint?.id) {
                toast({ type: 'error', title: 'Missing Complaint', message: 'Please select a complaint before updating.' })
                return
            }

            updateComplaintWorkflow.mutate({
                complaintId: selectedComplaint.id,
                data: {
                    status: toApiComplaintStatus(String(fd.get('status') || selectedComplaint.status || 'Open')),
                    assignedTo: String(fd.get('assignedTo') || '').trim() || undefined,
                    resolutionNotes: String(fd.get('resolutionNotes') || '').trim() || undefined
                },
                options: canReadAllUnits ? { scope: 'all' } : undefined
            }, {
                onSuccess: () => {
                    resetAttachment()
                    setIsDrawerOpen(false)
                }
            })
        }
    }

    return (
        <div className="flex flex-col h-full bg-transparent dark:bg-black">
            <PageHeader
                title="Customer Complaints"
                breadcrumbs={[
                    { label: 'Home' },
                    { label: 'Customer Complaints' }
                ]}
            />

            <ActionBar
                onAdd={handleRaise}
                addLabel="Raise New Complaint"
            />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                searchPlaceholder="Search complaints..."
            />

            {isLoading ? (
                <div className="animate-pulse bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-sm rounded-lg h-64 p-6" />
            ) : (
                <DataTable
                    data={filteredComplaints}
                    columns={columns}
                    keyExtractor={(item: any) => item.id}
                    emptyStateMessage="No complaints available in table"
                />
            )}

            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => {
                    resetAttachment()
                    setIsDrawerOpen(false)
                }}
                title={
                    drawerMode === 'raise'
                        ? 'Raise Customer Complaint'
                        : drawerMode === 'view'
                            ? 'View Customer Complaint Details'
                            : 'Update Customer Complaint'
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4 pb-16">
                    <Select
                        label="Unit Name"
                        name="unitId"
                        options={unitOptions}
                        defaultValue={selectedUnitId}
                        disabled={drawerMode === 'view'}
                    />

                    {drawerMode === 'raise' ? (
                        <Input
                            label="Client Name / Ref. No."
                            name="reference"
                            placeholder="Search Ref No. or Name or Mobile No."
                        />
                    ) : (
                        <Input
                            label="Client Name / Ref. No."
                            defaultValue={`${selectedComplaint?.ref || ''} - ${selectedComplaint?.clientName || ''} - ${selectedComplaint?.phone || ''}`}
                            readOnly
                            disabled
                        />
                    )}

                    <Input
                        label="Complaint Date *"
                        name="date"
                        type="date"
                        defaultValue={drawerMode === 'raise' ? new Date().toISOString().split('T')[0] : selectedComplaint?.date || new Date().toISOString().split('T')[0]}
                        disabled={drawerMode === 'view'}
                    />

                    <Select
                        label="Complaint Category *"
                        name="category"
                        options={[
                            { value: 'Service Feedback', label: 'Service Feedback' },
                            { value: 'Service Delay', label: 'Service Delay' },
                            { value: 'Staff Behaviour', label: 'Staff Behaviour' },
                            { value: 'Billing Query', label: 'Billing Query' },
                            { value: 'General Complaint', label: 'General Complaint' }
                        ]}
                        defaultValue={selectedComplaint?.category || 'General Complaint'}
                        disabled={drawerMode === 'view'}
                    />

                    <Select
                        label="Priority *"
                        name="priority"
                        options={[
                            { value: 'Low', label: 'Low' },
                            { value: 'Medium', label: 'Medium' },
                            { value: 'High', label: 'High' },
                            { value: 'Critical', label: 'Critical' }
                        ]}
                        defaultValue={selectedComplaint?.priority || 'Medium'}
                        disabled={drawerMode === 'view'}
                    />

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complaint (Comments) *</label>
                        <textarea
                            name="description"
                            className="w-full border border-gray-300 dark:border-white/10 rounded-md shadow-sm p-3 focus:ring-primary-500 focus:border-primary-500 min-h-[100px] text-sm bg-transparent text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:text-gray-500"
                            placeholder="Enter Feedback"
                            defaultValue={drawerMode === 'raise' ? '' : selectedComplaint?.description || 'CUSTOMER WHAT REFUND'}
                            disabled={drawerMode === 'view'}
                        />
                    </div>

                    {drawerMode === 'view' || drawerMode === 'update' ? (
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Document Attached</label>
                            <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all block py-2 font-medium">
                                {selectedComplaint?.ref || 'DOC'}_complaint_26032025171028.jpeg
                            </a>
                        </div>
                    ) : null}

                    {drawerMode !== 'raise' && (
                        <Select
                            label="Assigned To"
                            name="assignedTo"
                            options={[
                                { value: '', label: '-- Select Staff --' },
                                ...staffOptions
                            ]}
                            defaultValue={selectedComplaint?.assignedStaffId || ''}
                            disabled={drawerMode === 'view'}
                        />
                    )}

                    {drawerMode !== 'view' && (
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complaint Attachment *</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">(Audio files or Documents)</span>
                            <div className="flex border border-gray-300 dark:border-white/10 rounded-md overflow-hidden shadow-sm text-sm">
                                <input
                                    type="text"
                                    readOnly
                                    value={selectedAttachmentName}
                                    placeholder="Choose file"
                                    className="flex-1 p-2 bg-transparent text-gray-900 dark:text-gray-100"
                                />
                                <input
                                    ref={attachmentInputRef}
                                    type="file"
                                    name="attachment"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.m4a,.aac,.ogg"
                                    onChange={(e) => setSelectedAttachmentName(e.target.files?.[0]?.name || '')}
                                />
                                <button
                                    type="button"
                                    onClick={() => attachmentInputRef.current?.click()}
                                    className="px-4 py-2 bg-gray-100 dark:bg-white/10 border-l border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
                                >
                                    Browse
                                </button>
                            </div>
                        </div>
                    )}

                    <Select
                        label="Request Staff Allocation *"
                        options={[
                            { value: 'none', label: '-- Select the Status --' },
                            { value: 'no', label: 'Not Required' },
                            { value: 'yes', label: 'Yes (Staff Allocation is Required)' }
                        ]}
                        defaultValue={drawerMode === 'raise' ? 'none' : 'yes'}
                        disabled={drawerMode === 'view'}
                    />

                    {drawerMode !== 'raise' && (
                        <Select
                            label="Complaint Status *"
                            name="status"
                            options={[
                                { value: 'Open', label: 'Open' },
                                { value: 'In Progress', label: 'Assigned / In Progress' },
                                { value: 'Resolved', label: 'Resolved' },
                                { value: 'Closed', label: 'Closed' }
                            ]}
                            defaultValue={selectedComplaint?.status || 'Open'}
                            disabled={drawerMode === 'view'}
                        />
                    )}

                    {drawerMode !== 'raise' && (
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resolution Notes</label>
                            <textarea
                                name="resolutionNotes"
                                className="w-full border border-gray-300 dark:border-white/10 rounded-md shadow-sm p-3 focus:ring-primary-500 focus:border-primary-500 min-h-[90px] text-sm bg-transparent text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:text-gray-500"
                                placeholder="Add what was assigned, resolved, or closed"
                                defaultValue={selectedComplaint?.resolutionNotes || ''}
                                disabled={drawerMode === 'view'}
                            />
                        </div>
                    )}

                    {drawerMode !== 'view' && (
                        <div className="pt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-white/10 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    resetAttachment()
                                    setIsDrawerOpen(false)
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white/5 font-medium shadow-sm transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createComplaint.isPending || updateComplaintWorkflow.isPending}
                                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium shadow-sm transition-colors text-sm"
                            >
                                {drawerMode === 'raise'
                                    ? (createComplaint.isPending ? 'Raising...' : 'Raise Complaint')
                                    : (updateComplaintWorkflow.isPending ? 'Saving...' : 'Save Workflow')}
                            </button>
                        </div>
                    )}
                </form>
            </Drawer>
        </div>
    )
}
