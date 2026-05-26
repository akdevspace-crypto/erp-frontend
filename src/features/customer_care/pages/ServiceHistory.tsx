import { useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { FilterSection } from '../../../components/FilterSection'
import { DataTable, type Column } from '../../../components/DataTable'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { Modal } from '../../../components/Modal'
import { History as HistoryIcon, MessageSquare } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { customerCareService } from '../services/customer_care'
import { useAuthStore } from '../../../store/authStore'
import { useRecordServiceFeedback } from '../hooks/useCustomerCare'

export function ServiceHistory() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedService, setSelectedService] = useState<any | null>(null)
    const [feedbackForm, setFeedbackForm] = useState({ rating: '5', comments: '' })
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || null)
    const canReadAllUnits = useAuthStore((state) => {
        const roleName = typeof state.user?.role === 'string'
            ? state.user.role
            : state.user?.role?.name || ''
        return state.user?.unitAccess?.includes('*') || roleName.trim().toLowerCase() === 'customer relations manager'
    })
    const recordFeedback = useRecordServiceFeedback()
    const { data: history = [], isLoading } = useQuery({
        queryKey: ['customer-care', 'service-history', canReadAllUnits ? 'all' : activeUnitId],
        queryFn: () => customerCareService.getServiceHistory(canReadAllUnits ? { scope: 'all' } : undefined)
    })

    const filteredHistory = history.filter((row: any) => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return true
        return [
            row.ref,
            row.allocationRef,
            row.service,
            row.clientName,
            row.patientName,
            row.status,
            row.paymentStatus,
            row.invoiceNo,
            row.receiptNo,
            row.allocatedDetails,
            row.taskRefNo,
            row.feedbackStatus,
            row.complaintRefNo,
            row.finalClosureStatus
        ].some((value) => String(value || '').toLowerCase().includes(query))
    })

    const openFeedbackModal = (row: any) => {
        setSelectedService(row)
        setFeedbackForm({ rating: String(row.feedbackRating || 5), comments: row.feedbackComments || '' })
    }

    const submitFeedback = () => {
        if (!selectedService) return
        recordFeedback.mutate({
            allocationId: selectedService.id,
            data: {
                rating: Number(feedbackForm.rating),
                comments: feedbackForm.comments
            },
            options: canReadAllUnits ? { scope: 'all' } : undefined
        }, {
            onSuccess: () => setSelectedService(null)
        })
    }

    const columns: Column<any>[] = [
        { key: 'sno', header: 'S.No', cell: (_, index) => <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{index + 1}</span> },
        { key: 'clientRef', header: 'Client Ref. No.', cell: (row) => <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{row.ref || '-'}</span> },
        { key: 'serviceLookingFor', header: 'Service Looking for', cell: (row) => <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{row.service || '-'}</span> },
        { key: 'clientDetails', header: 'Client Details', cell: (row) => <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.clientName || '-'}</span> },
        { key: 'allocatedStatus', header: 'Allocated Status', cell: (row) => <StatusHighlighter value={row.status} /> },
        { key: 'allocatedDetails', header: 'Allocated Details', cell: (row) => <span className="text-sm text-gray-700 dark:text-gray-300">{row.allocatedDetails || '-'}</span> },
        {
            key: 'billing',
            header: 'Billing',
            cell: (row) => (
                <div className="space-y-1 text-sm">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{row.invoiceNo || '-'}</p>
                    <p className="text-xs text-gray-500">Receipt: {row.receiptNo || '-'}</p>
                    <p className="text-xs font-semibold text-gray-600">Rs {Number(row.paidAmount || 0).toFixed(2)} paid</p>
                </div>
            )
        },
        { key: 'paymentStatus', header: 'Payment', cell: (row) => <StatusHighlighter value={row.paymentStatus || 'PENDING'} /> },
        {
            key: 'feedbackStatus',
            header: 'Feedback',
            cell: (row) => (
                <div className="space-y-1">
                    <StatusHighlighter value={row.feedbackStatus || 'PENDING'} />
                    {row.feedbackRating && <p className="text-xs font-semibold text-gray-500">{row.feedbackRating}/5</p>}
                    {row.complaintRefNo && <p className="text-xs font-semibold text-red-600">Complaint: {row.complaintRefNo}</p>}
                </div>
            )
        },
        {
            key: 'followUpHistory',
            header: 'Follow-Up History',
            cell: () => (
                <button className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/5 rounded" title="View History">
                    <HistoryIcon className="h-4 w-4" />
                </button>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            cell: (row) => row.feedbackStatus === 'COLLECTED' ? (
                <span className="text-xs font-semibold text-green-700">Closed</span>
            ) : (
                <button
                    type="button"
                    onClick={() => openFeedbackModal(row)}
                    disabled={row.paymentStatus !== 'PAID'}
                    className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Feedback
                </button>
            )
        }
    ]

    return (
        <div className="flex flex-col h-full bg-transparent dark:bg-black">
            <PageHeader
                title="Client Service History"
                breadcrumbs={[
                    { label: 'Home' },
                    { label: 'Service History' }
                ]}
            />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                searchPlaceholder="Search history..."
            />

            <DataTable
                data={filteredHistory}
                columns={columns}
                keyExtractor={(item: any) => item.id || Math.random().toString()}
                emptyStateMessage={isLoading ? 'Loading service history...' : 'No history available in table'}
            />

            <Modal
                isOpen={Boolean(selectedService)}
                onClose={() => setSelectedService(null)}
                title="Final Customer Closure"
                type={Number(feedbackForm.rating) <= 2 ? 'warning' : 'success'}
                confirmLabel={recordFeedback.isPending ? 'Saving...' : 'Save Feedback'}
                confirmDisabled={recordFeedback.isPending || Number(feedbackForm.rating) < 1 || Number(feedbackForm.rating) > 5}
                onConfirm={submitFeedback}
            >
                {selectedService && (
                    <div className="space-y-4 text-left">
                        <div className="rounded-xl border border-primary-100 bg-primary-50 p-3">
                            <p className="text-sm font-black text-gray-900">{selectedService.clientName || 'Client'}</p>
                            <p className="text-xs font-semibold text-gray-600">{selectedService.ref} - {selectedService.service}</p>
                        </div>
                        <label className="block text-sm font-bold text-gray-700">
                            Rating
                            <select
                                value={feedbackForm.rating}
                                onChange={(event) => setFeedbackForm((prev) => ({ ...prev, rating: event.target.value }))}
                                className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            >
                                <option value="5">5 - Excellent</option>
                                <option value="4">4 - Good</option>
                                <option value="3">3 - Average</option>
                                <option value="2">2 - Poor</option>
                                <option value="1">1 - Critical</option>
                            </select>
                        </label>
                        <label className="block text-sm font-bold text-gray-700">
                            Closure Notes
                            <textarea
                                value={feedbackForm.comments}
                                onChange={(event) => setFeedbackForm((prev) => ({ ...prev, comments: event.target.value }))}
                                rows={4}
                                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                placeholder="Record customer satisfaction and closure notes..."
                            />
                        </label>
                        {Number(feedbackForm.rating) <= 2 && (
                            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                                Low ratings will create a customer complaint automatically.
                            </p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}
