import { useMemo, useState } from 'react'
import { ActionBar } from '../../../components/ActionBar'
import { DataTable, type Column } from '../../../components/DataTable'
import { Drawer } from '../../../components/Drawer'
import { FilterSection } from '../../../components/FilterSection'
import { Input } from '../../../components/Input'
import { PageHeader } from '../../../components/PageHeader'
import { Select } from '../../../components/Select'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useInventoryProducts, useInventoryStock, useUpdateInventoryStock } from '../hooks/useInventory'
import type { InventoryStock } from '../types'

const lowStockThreshold = 10

const stockModeOptions = [
    { value: 'IN', label: 'Stock In' },
    { value: 'OUT', label: 'Stock Out' }
]

export function StockManagement() {
    const [searchQuery, setSearchQuery] = useState('')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [formData, setFormData] = useState({ productId: '', mode: 'IN', quantity: '' })
    const { data: products = [], isLoading: isProductsLoading } = useInventoryProducts()
    const { data: stock = [], isLoading: isStockLoading } = useInventoryStock()
    const updateStock = useUpdateInventoryStock()

    const productOptions = useMemo(() => (
        products.map((product) => ({
            value: product.id,
            label: `${product.name} (${product.category})`
        }))
    ), [products])

    const visibleStock = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        return stock.filter((item) => {
            const product = item.product
            return !query || [
                product?.name || '',
                product?.category || '',
                item.quantity,
                item.updatedAt
            ].some((value) => String(value).toLowerCase().includes(query))
        })
    }, [stock, searchQuery])

    const getStockStatus = (quantity: number) => {
        if (quantity <= 0) return 'Out of Stock'
        if (quantity <= lowStockThreshold) return 'Low Stock'
        return 'Available'
    }

    const openStockDrawer = (mode: 'IN' | 'OUT' = 'IN', productId = '') => {
        setFormData({ productId, mode, quantity: '' })
        setDrawerOpen(true)
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const quantity = Math.trunc(Number(formData.quantity || 0))
        if (!formData.productId || quantity <= 0) return

        await updateStock.mutateAsync({
            productId: formData.productId,
            quantity: formData.mode === 'OUT' ? -quantity : quantity
        })

        setFormData({ productId: '', mode: 'IN', quantity: '' })
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
        { key: 'quantity', header: 'Current Stock', sortable: true },
        {
            key: 'status',
            header: 'Stock Status',
            cell: (item) => <StatusHighlighter value={getStockStatus(Number(item.quantity || 0))} />
        },
        {
            key: 'updatedAt',
            header: 'Last Updated',
            cell: (item) => item.updatedAt ? new Date(item.updatedAt).toLocaleString('en-GB') : '-'
        },
        {
            key: 'stockAction',
            header: 'Stock Action',
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => openStockDrawer('IN', item.productId)}
                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
                    >
                        Stock In
                    </button>
                    <button
                        type="button"
                        onClick={() => openStockDrawer('OUT', item.productId)}
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700 transition hover:bg-rose-100"
                    >
                        Stock Out
                    </button>
                </div>
            )
        }
    ]

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="Stock"
                subtitle="Live stock quantity across inventory products for the selected unit."
                breadcrumbs={[{ label: 'Inventory' }, { label: 'Stock' }]}
            />

            <ActionBar onAdd={() => openStockDrawer('IN')} addLabel="Stock In / Out" />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search stock by product or category..."
            />

            <DataTable
                data={visibleStock}
                columns={columns}
                keyExtractor={(item) => item.id}
                isLoading={isStockLoading || isProductsLoading}
                emptyStateMessage="No live stock records found"
            />

            <Drawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Update Stock"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label="Product"
                        required
                        value={formData.productId}
                        onChange={(event) => setFormData((prev) => ({ ...prev, productId: event.target.value }))}
                        options={productOptions}
                        placeholder={productOptions.length ? 'Select product' : 'Create a product first'}
                    />
                    <Select
                        label="Movement"
                        required
                        value={formData.mode}
                        onChange={(event) => setFormData((prev) => ({ ...prev, mode: event.target.value }))}
                        options={stockModeOptions}
                    />
                    <Input
                        label="Quantity"
                        required
                        type="number"
                        min="1"
                        step="1"
                        value={formData.quantity}
                        onChange={(event) => setFormData((prev) => ({ ...prev, quantity: event.target.value }))}
                        placeholder="Enter quantity"
                    />

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
                            disabled={updateStock.isPending || productOptions.length === 0}
                            className="rounded-xl bg-[#00b3a7] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#01867c] disabled:opacity-60"
                        >
                            {updateStock.isPending ? 'Saving...' : 'Save Stock'}
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    )
}
