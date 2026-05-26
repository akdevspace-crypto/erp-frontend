import { useMemo, useState } from 'react'
import { DataTable, type Column } from '../../../components/DataTable'
import { Drawer } from '../../../components/Drawer'
import { FilterSection } from '../../../components/FilterSection'
import { Input } from '../../../components/Input'
import { PageHeader } from '../../../components/PageHeader'
import { Select } from '../../../components/Select'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useCreateInventoryPurchase, useInventoryStock } from '../hooks/useInventory'
import type { InventoryStock } from '../types'

const lowStockThreshold = 10

export function LowStockAlerts() {
    const [searchQuery, setSearchQuery] = useState('')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [formData, setFormData] = useState({ productId: '', vendor: '', quantity: '' })
    const { data: stock = [], isLoading } = useInventoryStock()
    const createPurchase = useCreateInventoryPurchase()

    const lowStockRows = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        return stock
            .filter((item) => Number(item.quantity || 0) <= lowStockThreshold)
            .filter((item) => !query || [
                item.product?.name || '',
                item.product?.category || '',
                item.quantity
            ].some((value) => String(value).toLowerCase().includes(query)))
    }, [stock, searchQuery])

    const getAlertStatus = (quantity: number) => {
        if (quantity <= 0) return 'Reorder'
        return 'Low'
    }

    const productOptions = useMemo(() => (
        lowStockRows.map((item) => ({
            value: item.productId,
            label: `${item.product?.name || 'Unknown Product'} (${item.product?.category || '-'}) - Qty ${item.quantity}`
        }))
    ), [lowStockRows])

    const openPurchaseDrawer = (productId = '') => {
        setFormData({ productId, vendor: '', quantity: '' })
        setDrawerOpen(true)
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const quantity = Math.trunc(Number(formData.quantity || 0))
        const vendor = formData.vendor.trim()
        if (!formData.productId || !vendor || quantity <= 0) return

        await createPurchase.mutateAsync({
            productId: formData.productId,
            vendor,
            quantity
        })

        setFormData({ productId: '', vendor: '', quantity: '' })
        setDrawerOpen(false)
    }

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
        {
            key: 'category',
            header: 'Category',
            cell: (item) => item.product?.category || '-'
        },
        { key: 'quantity', header: 'Qty', sortable: true },
        {
            key: 'threshold',
            header: 'Threshold',
            cell: () => lowStockThreshold
        },
        {
            key: 'status',
            header: 'Status',
            cell: (item) => <StatusHighlighter value={getAlertStatus(Number(item.quantity || 0))} />
        },
        {
            key: 'purchaseAction',
            header: 'Action',
            cell: (item) => (
                <button
                    type="button"
                    onClick={() => openPurchaseDrawer(item.productId)}
                    className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
                >
                    Create Purchase
                </button>
            )
        }
    ]

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="Low Stock Alerts"
                subtitle="Live stock alerts calculated from current inventory quantities."
                breadcrumbs={[{ label: 'Inventory' }, { label: 'Low Stock Alerts' }]}
            />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search low stock by product or category..."
            />

            <DataTable
                data={lowStockRows}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                emptyStateMessage="No live low stock alerts"
            />

            <Drawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Create Purchase"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label="Product"
                        required
                        value={formData.productId}
                        onChange={(event) => setFormData((prev) => ({ ...prev, productId: event.target.value }))}
                        options={productOptions}
                        placeholder={productOptions.length ? 'Select low stock product' : 'No low stock products'}
                    />
                    <Input
                        label="Vendor"
                        required
                        value={formData.vendor}
                        onChange={(event) => setFormData((prev) => ({ ...prev, vendor: event.target.value }))}
                        placeholder="Vendor or shop name"
                    />
                    <Input
                        label="Purchase Quantity"
                        required
                        type="number"
                        min="1"
                        step="1"
                        value={formData.quantity}
                        onChange={(event) => setFormData((prev) => ({ ...prev, quantity: event.target.value }))}
                        placeholder="Enter quantity to purchase"
                    />

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                        Saving this purchase will increase live stock and remove the item from low-stock alerts once quantity is above threshold.
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
                            disabled={createPurchase.isPending || productOptions.length === 0}
                            className="rounded-xl bg-[#00b3a7] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#01867c] disabled:opacity-60"
                        >
                            {createPurchase.isPending ? 'Saving...' : 'Save Purchase'}
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    )
}
