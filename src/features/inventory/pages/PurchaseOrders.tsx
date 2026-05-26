import { useMemo, useState } from 'react'
import { ActionBar } from '../../../components/ActionBar'
import { DataTable, type Column } from '../../../components/DataTable'
import { Drawer } from '../../../components/Drawer'
import { FilterSection } from '../../../components/FilterSection'
import { Input } from '../../../components/Input'
import { PageHeader } from '../../../components/PageHeader'
import { Select } from '../../../components/Select'
import { useCreateInventoryPurchase, useInventoryProducts, useInventoryPurchases } from '../hooks/useInventory'
import type { InventoryPurchase } from '../types'

export function PurchaseOrders() {
    const [searchQuery, setSearchQuery] = useState('')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [formData, setFormData] = useState({ productId: '', vendor: '', quantity: '' })
    const { data: products = [], isLoading: isProductsLoading } = useInventoryProducts()
    const { data: purchases = [], isLoading: isPurchasesLoading } = useInventoryPurchases()
    const createPurchase = useCreateInventoryPurchase()

    const productOptions = useMemo(() => (
        products.map((product) => ({
            value: product.id,
            label: `${product.name} (${product.category})`
        }))
    ), [products])

    const visiblePurchases = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        return purchases.filter((purchase) => !query || [
            purchase.product?.name || '',
            purchase.product?.category || '',
            purchase.vendor,
            purchase.quantity,
            purchase.createdAt
        ].some((value) => String(value).toLowerCase().includes(query)))
    }, [purchases, searchQuery])

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

    const columns: Column<InventoryPurchase>[] = [
        { key: 'sno', header: 'S.No', cell: (_item, index) => index + 1, sortable: false },
        {
            key: 'product',
            header: 'Product',
            cell: (purchase) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 dark:text-gray-100">{purchase.product?.name || 'Unknown Product'}</span>
                    <span className="text-xs font-semibold text-gray-500">{purchase.product?.category || '-'}</span>
                </div>
            )
        },
        { key: 'vendor', header: 'Vendor', sortable: true },
        { key: 'quantity', header: 'Purchased Qty', sortable: true },
        {
            key: 'createdAt',
            header: 'Purchase Date',
            cell: (purchase) => purchase.createdAt ? new Date(purchase.createdAt).toLocaleString('en-GB') : '-'
        }
    ]

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="Purchase Orders"
                subtitle="Live purchase entries. Each purchase automatically increases product stock."
                breadcrumbs={[{ label: 'Inventory' }, { label: 'Purchase Orders' }]}
            />

            <ActionBar onAdd={() => setDrawerOpen(true)} addLabel="Add Purchase" />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search purchase by product, vendor, or category..."
            />

            <DataTable
                data={visiblePurchases}
                columns={columns}
                keyExtractor={(purchase) => purchase.id}
                isLoading={isPurchasesLoading || isProductsLoading}
                emptyStateMessage="No live purchase entries found"
            />

            <Drawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Add Purchase"
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
                    <Input
                        label="Vendor"
                        required
                        value={formData.vendor}
                        onChange={(event) => setFormData((prev) => ({ ...prev, vendor: event.target.value }))}
                        placeholder="Vendor or shop name"
                    />
                    <Input
                        label="Quantity"
                        required
                        type="number"
                        min="1"
                        step="1"
                        value={formData.quantity}
                        onChange={(event) => setFormData((prev) => ({ ...prev, quantity: event.target.value }))}
                        placeholder="Purchased quantity"
                    />

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                        Saving this purchase will automatically increase the selected product stock.
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
