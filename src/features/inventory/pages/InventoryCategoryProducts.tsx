import { useMemo, useState } from 'react'
import { Package } from 'lucide-react'
import { ActionBar } from '../../../components/ActionBar'
import { DataTable, type Column } from '../../../components/DataTable'
import { Drawer } from '../../../components/Drawer'
import { FilterSection } from '../../../components/FilterSection'
import { Input } from '../../../components/Input'
import { PageHeader } from '../../../components/PageHeader'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useCreateInventoryProduct, useInventoryProducts, useInventoryStock, useUpdateInventoryStock } from '../hooks/useInventory'
import type { InventoryProduct } from '../types'

const lowStockThreshold = 10

type InventoryCategoryProductsProps = {
    category: string
    categoryLabel: string
    title: string
    subtitle: string
    addLabel: string
    productHeader: string
    searchPlaceholder: string
    emptyStateMessage: string
    breadcrumbs: Array<{ label: string }>
    placeholder: string
}

export function InventoryCategoryProducts({
    category,
    categoryLabel,
    title,
    subtitle,
    addLabel,
    productHeader,
    searchPlaceholder,
    emptyStateMessage,
    breadcrumbs,
    placeholder
}: InventoryCategoryProductsProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', openingStock: '' })
    const { data: products = [], isLoading: isProductsLoading } = useInventoryProducts()
    const { data: stock = [], isLoading: isStockLoading } = useInventoryStock()
    const createProduct = useCreateInventoryProduct()
    const updateStock = useUpdateInventoryStock()

    const stockByProductId = useMemo(() => new Map(stock.map((item) => [item.productId, item])), [stock])

    const categoryProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        const normalizedCategory = category.toLowerCase()

        return products
            .filter((product) => product.category.toLowerCase() === normalizedCategory)
            .filter((product) => !query || [
                product.name,
                product.category,
                stockByProductId.get(product.id)?.quantity ?? ''
            ].some((value) => String(value).toLowerCase().includes(query)))
    }, [category, products, searchQuery, stockByProductId])

    const getQuantity = (productId: string) => Number(stockByProductId.get(productId)?.quantity || 0)
    const getStockStatus = (quantity: number) => {
        if (quantity <= 0) return 'Out of Stock'
        if (quantity <= lowStockThreshold) return 'Low Stock'
        return 'Available'
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const productName = formData.name.trim()
        if (!productName) return

        const product = await createProduct.mutateAsync({ name: productName, category })
        const openingStock = Number(formData.openingStock || 0)
        if (openingStock > 0) {
            await updateStock.mutateAsync({ productId: product.id, quantity: Math.trunc(openingStock) })
        }

        setFormData({ name: '', openingStock: '' })
        setDrawerOpen(false)
    }

    const columns: Column<InventoryProduct>[] = [
        { key: 'sno', header: 'S.No', cell: (_item, index) => index + 1, sortable: false },
        {
            key: 'name',
            header: productHeader,
            cell: (product) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                        <Package className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 dark:text-gray-100">{product.name}</span>
                        <span className="text-xs font-semibold text-gray-500">Category: {categoryLabel}</span>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'quantity',
            header: 'Current Stock',
            cell: (product) => getQuantity(product.id)
        },
        {
            key: 'stockStatus',
            header: 'Stock Status',
            cell: (product) => <StatusHighlighter value={getStockStatus(getQuantity(product.id))} />
        },
        {
            key: 'updatedAt',
            header: 'Last Updated',
            cell: (product) => {
                const stockRow = stockByProductId.get(product.id)
                const date = stockRow?.updatedAt || product.updatedAt
                return date ? new Date(date).toLocaleDateString('en-GB') : '-'
            }
        }
    ]

    const isSaving = createProduct.isPending || updateStock.isPending

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title={title}
                subtitle={subtitle}
                breadcrumbs={breadcrumbs}
            />

            <ActionBar onAdd={() => setDrawerOpen(true)} addLabel={addLabel} />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder={searchPlaceholder}
            />

            <DataTable
                data={categoryProducts}
                columns={columns}
                keyExtractor={(product) => product.id}
                isLoading={isProductsLoading || isStockLoading}
                emptyStateMessage={emptyStateMessage}
            />

            <Drawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={addLabel}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Product Name"
                        required
                        value={formData.name}
                        onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder={placeholder}
                    />
                    <Input
                        label="Opening Stock"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.openingStock}
                        onChange={(event) => setFormData((prev) => ({ ...prev, openingStock: event.target.value }))}
                        placeholder="0"
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
                            disabled={isSaving}
                            className="rounded-xl bg-[#00b3a7] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#01867c] disabled:opacity-60"
                        >
                            {isSaving ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    )
}
