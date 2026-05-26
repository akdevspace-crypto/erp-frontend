import { useMemo, useState } from 'react'
import { ActionBar } from '../../../components/ActionBar'
import { DataTable, type Column } from '../../../components/DataTable'
import { Drawer } from '../../../components/Drawer'
import { FilterSection } from '../../../components/FilterSection'
import { Input } from '../../../components/Input'
import { PageHeader } from '../../../components/PageHeader'
import { Select } from '../../../components/Select'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { hasPermissionAccess } from '../../../lib/access'
import { useAuthStore } from '../../../store/authStore'
import { useApproveInventoryStockIssueRequest, useCreateInventoryStockIssueRequest, useInventoryStock, useInventoryStockIssueRequests, useRejectInventoryStockIssueRequest } from '../hooks/useInventory'
import type { InventoryStock, InventoryStockIssueRequest } from '../types'

const usageTypeOptions = [
    { value: 'PATIENT_CARE', label: 'Patient Care' },
    { value: 'KITCHEN_RATION', label: 'Kitchen / Ration' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'STAFF_USE', label: 'Staff Use' },
    { value: 'ROOM_USE', label: 'Room Use' },
    { value: 'OTHER', label: 'Other' }
]

const formatUsageType = (value: string) => usageTypeOptions.find((option) => option.value === value)?.label || value

export function StockIssue() {
    const [searchQuery, setSearchQuery] = useState('')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [formData, setFormData] = useState({ productId: '', usageType: 'PATIENT_CARE', quantity: '', issuedTo: '', notes: '' })
    const user = useAuthStore((state) => state.user)
    const { data: stock = [], isLoading } = useInventoryStock()
    const { data: issueRequests = [], isLoading: isIssueRequestsLoading } = useInventoryStockIssueRequests()
    const createIssueRequest = useCreateInventoryStockIssueRequest()
    const approveIssueRequest = useApproveInventoryStockIssueRequest()
    const rejectIssueRequest = useRejectInventoryStockIssueRequest()
    const canRequestIssue = hasPermissionAccess(user, ['Stock Issue Request'])
    const canApproveIssue = hasPermissionAccess(user, ['Stock Issue Approval'])

    const availableStock = useMemo(() => stock.filter((item) => Number(item.quantity || 0) > 0), [stock])

    const productOptions = useMemo(() => (
        availableStock.map((item) => ({
            value: item.productId,
            label: `${item.product?.name || 'Unknown Product'} (${item.product?.category || '-'}) - Qty ${item.quantity}`
        }))
    ), [availableStock])

    const selectedStock = useMemo(
        () => stock.find((item) => item.productId === formData.productId),
        [formData.productId, stock]
    )

    const visibleStock = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        return availableStock.filter((item) => !query || [
            item.product?.name || '',
            item.product?.category || '',
            item.quantity,
            item.updatedAt
        ].some((value) => String(value).toLowerCase().includes(query)))
    }, [availableStock, searchQuery])

    const openDrawer = (productId = '') => {
        if (!canRequestIssue) return
        setFormData({ productId, usageType: 'PATIENT_CARE', quantity: '', issuedTo: '', notes: '' })
        setDrawerOpen(true)
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const quantity = Math.trunc(Number(formData.quantity || 0))
        const currentQuantity = Number(selectedStock?.quantity || 0)
        if (!formData.productId || quantity <= 0 || quantity > currentQuantity) return
        if (!canRequestIssue) return

        await createIssueRequest.mutateAsync({
            productId: formData.productId,
            quantity,
            usageType: formData.usageType,
            issuedTo: formData.issuedTo.trim(),
            notes: formData.notes.trim()
        })

        setFormData({ productId: '', usageType: 'PATIENT_CARE', quantity: '', issuedTo: '', notes: '' })
        setDrawerOpen(false)
    }

    const handleApprove = async (request: InventoryStockIssueRequest) => {
        const liveStock = stock.find((item) => item.productId === request.productId)
        const currentQuantity = Number(liveStock?.quantity || 0)
        if (!canApproveIssue) return
        if (request.status !== 'PENDING' || request.quantity <= 0 || request.quantity > currentQuantity) return

        await approveIssueRequest.mutateAsync(request.id)
    }

    const handleReject = async (request: InventoryStockIssueRequest) => {
        if (!canApproveIssue) return
        if (request.status !== 'PENDING') return

        await rejectIssueRequest.mutateAsync(request.id)
    }

    const requestColumns: Column<InventoryStockIssueRequest>[] = [
        { key: 'sno', header: 'S.No', cell: (_item, index) => index + 1, sortable: false },
        {
            key: 'product',
            header: 'Requested Item',
            cell: (request) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 dark:text-gray-100">{request.productName}</span>
                    <span className="text-xs font-semibold text-gray-500">{request.category}</span>
                </div>
            )
        },
        { key: 'quantity', header: 'Qty', sortable: true },
        {
            key: 'purpose',
            header: 'Purpose',
            cell: (request) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{formatUsageType(request.usageType)}</span>
                    <span className="text-xs text-gray-500">{request.issuedTo || 'Not specified'}</span>
                    <span className="text-xs text-gray-400">By {request.requestedBy || 'Requester'}</span>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Approval Status',
            cell: (request) => <StatusHighlighter value={request.status} />
        },
        {
            key: 'requestedAt',
            header: 'Requested At',
            cell: (request) => new Date(request.requestedAt).toLocaleString('en-GB')
        },
        {
            key: 'approvalAction',
            header: 'Action',
            cell: (request) => {
                const liveStock = stock.find((item) => item.productId === request.productId)
                const currentQuantity = Number(liveStock?.quantity || 0)
                const canApprove = request.status === 'PENDING' && request.quantity <= currentQuantity

                if (request.status !== 'PENDING') {
                    return <span className="text-xs font-bold text-gray-500">Closed</span>
                }

                return canApproveIssue ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleApprove(request)}
                            disabled={!canApprove || approveIssueRequest.isPending || rejectIssueRequest.isPending}
                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                            Approve
                        </button>
                        <button
                            type="button"
                            onClick={() => handleReject(request)}
                            disabled={approveIssueRequest.isPending || rejectIssueRequest.isPending}
                            className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                            Reject
                        </button>
                    </div>
                ) : (
                    <span className="text-xs font-bold text-amber-600">Waiting approval</span>
                )
            },
            sortable: false
        }
    ]

    const columns: Column<InventoryStock>[] = [
        { key: 'sno', header: 'S.No', cell: (_item, index) => index + 1, sortable: false },
        {
            key: 'product',
            header: 'Product',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 dark:text-gray-100">{item.product?.name || 'Unknown Product'}</span>
                    <span className="text-xs font-semibold text-gray-500">{item.product?.category || '-'}</span>
                </div>
            )
        },
        { key: 'quantity', header: 'Available Qty', sortable: true },
        {
            key: 'issueStatus',
            header: 'Issue Status',
            cell: () => <StatusHighlighter value="Available" />
        },
        {
            key: 'updatedAt',
            header: 'Last Updated',
            cell: (item) => item.updatedAt ? new Date(item.updatedAt).toLocaleString('en-GB') : '-'
        },
        ...(canRequestIssue ? [{
            key: 'issueAction',
            header: 'Action',
            cell: (item) => (
                <button
                    type="button"
                    onClick={() => openDrawer(item.productId)}
                    className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700 transition hover:bg-rose-100"
                >
                    Request Issue
                </button>
            )
        } satisfies Column<InventoryStock>] : [])
    ]

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="Stock Issue"
                subtitle="Request and approve inventory usage before reducing live stock."
                breadcrumbs={[{ label: 'Inventory' }, { label: 'Stock Issue' }]}
            />

            {canRequestIssue && <ActionBar onAdd={() => openDrawer()} addLabel="Request Issue" />}

            {!canRequestIssue && !canApproveIssue && (
                <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    This login does not have stock issue request or approval access.
                </div>
            )}

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search available stock by product or category..."
            />

            <div className="mb-4">
                <DataTable
                    data={issueRequests}
                    columns={requestColumns}
                    keyExtractor={(item) => item.id}
                    isLoading={isIssueRequestsLoading}
                    emptyStateMessage="No stock issue requests pending or completed"
                />
            </div>

            <DataTable
                data={visibleStock}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                emptyStateMessage="No available stock found for issue"
            />

            <Drawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Request Stock Issue"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label="Product"
                        required
                        value={formData.productId}
                        onChange={(event) => setFormData((prev) => ({ ...prev, productId: event.target.value }))}
                        options={productOptions}
                        placeholder={productOptions.length ? 'Select product' : 'No available stock'}
                    />
                    <Select
                        label="Usage Type"
                        required
                        value={formData.usageType}
                        onChange={(event) => setFormData((prev) => ({ ...prev, usageType: event.target.value }))}
                        options={usageTypeOptions}
                    />
                    <Input
                        label="Quantity"
                        required
                        type="number"
                        min="1"
                        max={selectedStock?.quantity || undefined}
                        step="1"
                        value={formData.quantity}
                        onChange={(event) => setFormData((prev) => ({ ...prev, quantity: event.target.value }))}
                        placeholder="Enter issue quantity"
                    />
                    <Input
                        label="Issued To"
                        value={formData.issuedTo}
                        onChange={(event) => setFormData((prev) => ({ ...prev, issuedTo: event.target.value }))}
                        placeholder="Patient, staff, room, or department"
                    />
                    <Input
                        label="Notes"
                        value={formData.notes}
                        onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                        placeholder={`Purpose for ${formatUsageType(formData.usageType)}`}
                    />

                    <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                        Saving creates a pending request only. Live stock reduces after approval and then appears in stock movement history.
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-black dark:text-gray-300 dark:hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canRequestIssue || createIssueRequest.isPending || productOptions.length === 0}
                            className="rounded-xl bg-[#00b3a7] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#01867c] disabled:opacity-60"
                        >
                            Save Request
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    )
}
