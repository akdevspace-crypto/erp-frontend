import { useMemo, useState } from 'react'
import { CookingPot, PackageCheck } from 'lucide-react'
import { DataTable, type Column } from '../../../components/DataTable'
import { FilterSection } from '../../../components/FilterSection'
import { PageHeader } from '../../../components/PageHeader'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { useInventoryStock } from '../../inventory/hooks/useInventory'
import type { InventoryStock } from '../../inventory/types'
import { formatDateTime } from '../../healthcare/utils'
import { useMealPreps, useUpdateMealPrepStatus } from '../hooks/useOperations'
import type { MealPrepRecord } from '../types'

const rationCategory = 'ration'

const getMealLoad = (calories: number) => {
    if (calories >= 2200) return 'Heavy Prep'
    if (calories <= 1400) return 'Light Prep'
    return 'Normal Prep'
}

const isRationStock = (stock: InventoryStock) => String(stock.product?.category || '').toLowerCase() === rationCategory

const getNextStatus = (status: MealPrepRecord['status']) => {
    if (status === 'PENDING') return 'PREPARING'
    if (status === 'PREPARING') return 'PREPARED'
    if (status === 'PREPARED') return 'SERVED'
    return null
}

export function FoodPreparation() {
    const [searchQuery, setSearchQuery] = useState('')
    const { data: mealPreps = [], isLoading: mealPrepLoading } = useMealPreps()
    const updateMealPrep = useUpdateMealPrepStatus()
    const { data: stock = [], isLoading: stockLoading } = useInventoryStock()

    const rationStock = useMemo(() => stock.filter(isRationStock), [stock])

    const visiblePreps = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return mealPreps.filter((prep) => !query || [
            prep.nutrition?.patient?.name || '',
            prep.nutrition?.dietPlan || '',
            prep.nutrition?.calories || '',
            prep.status,
            getMealLoad(Number(prep.nutrition?.calories || 0))
        ].some((value) => String(value).toLowerCase().includes(query)))
    }, [mealPreps, searchQuery])

    const totalRationQty = rationStock.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    const servedCount = mealPreps.filter((prep) => prep.status === 'SERVED').length

    const columns: Column<MealPrepRecord>[] = [
        { key: 'sno', header: 'S.No', cell: (_prep, index) => index + 1, sortable: false },
        {
            key: 'patient',
            header: 'Meal For',
            cell: (prep) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                        <CookingPot className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-black text-slate-950">{prep.nutrition?.patient?.name || 'Patient'}</p>
                        <p className="text-xs font-semibold text-slate-500">Diet-based food preparation</p>
                    </div>
                </div>
            )
        },
        { key: 'calories', header: 'Calories', cell: (prep) => `${prep.nutrition?.calories || 0} kcal`, sortable: true },
        { key: 'load', header: 'Prep Load', cell: (prep) => <StatusHighlighter value={getMealLoad(Number(prep.nutrition?.calories || 0))} /> },
        {
            key: 'instructions',
            header: 'Food Instructions',
            cell: (prep) => <span className="whitespace-normal text-sm font-semibold text-slate-700">{prep.nutrition?.dietPlan || '-'}</span>
        },
        { key: 'status', header: 'Status', cell: (prep) => <StatusHighlighter value={prep.status} />, sortable: true },
        { key: 'plannedAt', header: 'Prep Date', cell: (prep) => formatDateTime(prep.createdAt), sortable: true },
        {
            key: 'action',
            header: 'Action',
            sortable: false,
            cell: (prep) => {
                const nextStatus = getNextStatus(prep.status)
                if (!nextStatus) return <span className="text-sm font-black text-slate-500">Closed</span>

                return (
                    <button
                        type="button"
                        onClick={() => updateMealPrep.mutate({ nutritionId: prep.nutritionId, status: nextStatus })}
                        disabled={updateMealPrep.isPending}
                        className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Mark {nextStatus}
                    </button>
                )
            }
        }
    ]

    const stockColumns: Column<InventoryStock>[] = [
        { key: 'sno', header: 'S.No', cell: (_item, index) => index + 1, sortable: false },
        { key: 'product', header: 'Ration Item', cell: (item) => <span className="font-black text-slate-950">{item.product?.name || 'Ration Item'}</span> },
        { key: 'quantity', header: 'Current Qty', cell: (item) => item.quantity, sortable: true },
        { key: 'status', header: 'Stock Status', cell: (item) => <StatusHighlighter value={Number(item.quantity || 0) <= 10 ? 'Low Stock' : 'Available'} /> },
        { key: 'updatedAt', header: 'Last Updated', cell: (item) => formatDateTime(item.updatedAt), sortable: true }
    ]

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="Food Preparation"
                subtitle="Kitchen preparation work created from operations nutrition planning."
                breadcrumbs={[{ label: 'Operations' }, { label: 'Food Preparation' }]}
            />

            <div className="mb-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-teal-700 shadow-sm">
                    <p className="text-2xl font-black">{mealPreps.length}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Meal Prep Items</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 shadow-sm">
                    <p className="text-2xl font-black">{rationStock.length}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Ration Items</p>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sky-700 shadow-sm">
                    <p className="text-2xl font-black">{totalRationQty}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Total Ration Qty</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-700 shadow-sm">
                    <p className="text-2xl font-black">{servedCount}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Served Meals</p>
                </div>
            </div>

            <div className="mb-4 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
                <PackageCheck className="mr-2 inline h-4 w-4" />
                Food preparation only shows diet plans converted into meal prep from Nutrition Planning, then tracks Pending, Preparing, Prepared, and Served.
            </div>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search patient, diet instruction, preparation status..."
            />

            <div className="mb-6">
                <DataTable
                    data={visiblePreps}
                    columns={columns}
                    keyExtractor={(prep) => prep.id}
                    isLoading={mealPrepLoading}
                    emptyStateMessage="No meal prep work found. Create meal prep from Operations -> Nutrition Planning."
                />
            </div>

            <section className="flex min-h-[300px] flex-col gap-3">
                <div className="px-1">
                    <h2 className="text-lg font-black text-slate-950">Ration Stock Readiness</h2>
                    <p className="text-sm font-semibold text-slate-500">Live ration inventory available for kitchen operations.</p>
                </div>
                <DataTable
                    data={rationStock}
                    columns={stockColumns}
                    keyExtractor={(item) => item.id}
                    isLoading={stockLoading}
                    emptyStateMessage="No ration stock found. Add ration products and stock from Elder Inventory."
                />
            </section>
        </div>
    )
}
