import { useMemo, useState } from 'react'
import { CalendarDays, CookingPot, Utensils } from 'lucide-react'
import { DataTable, type Column } from '../../../components/DataTable'
import { FilterSection } from '../../../components/FilterSection'
import { PageHeader } from '../../../components/PageHeader'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { formatDateTime } from '../../healthcare/utils'
import { useCreateMealPrep, useMealPreps, useOperationsNutritionPlans } from '../hooks/useOperations'
import type { OperationsNutritionPlan } from '../types'

const getCalorieBand = (calories: number) => {
    if (calories >= 2200) return 'High Calorie'
    if (calories <= 1400) return 'Light Diet'
    return 'Standard Diet'
}

export function NutritionPlanning() {
    const [searchQuery, setSearchQuery] = useState('')
    const { data: nutritionPlans = [], isLoading } = useOperationsNutritionPlans()
    const { data: mealPreps = [] } = useMealPreps()
    const createMealPrep = useCreateMealPrep()

    const mealPrepByNutritionId = useMemo(() => {
        return new Map(mealPreps.map((prep) => [prep.nutritionId, prep]))
    }, [mealPreps])

    const visiblePlans = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return nutritionPlans.filter((plan) => !query || [
            plan.patient?.name || '',
            plan.dietPlan,
            plan.calories,
            getCalorieBand(Number(plan.calories || 0))
        ].some((value) => String(value).toLowerCase().includes(query)))
    }, [nutritionPlans, searchQuery])

    const highCalorie = nutritionPlans.filter((plan) => Number(plan.calories || 0) >= 2200).length
    const lightDiet = nutritionPlans.filter((plan) => Number(plan.calories || 0) <= 1400).length
    const standardDiet = nutritionPlans.length - highCalorie - lightDiet

    const columns: Column<OperationsNutritionPlan>[] = [
        { key: 'sno', header: 'S.No', cell: (_plan, index) => index + 1, sortable: false },
        {
            key: 'patient',
            header: 'Patient',
            cell: (plan) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                        <Utensils className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-black text-slate-950">{plan.patient?.name || 'Patient'}</p>
                        <p className="text-xs font-semibold text-slate-500">Kitchen planning</p>
                    </div>
                </div>
            )
        },
        { key: 'calories', header: 'Calories', cell: (plan) => `${plan.calories} kcal`, sortable: true },
        { key: 'dietBand', header: 'Diet Band', cell: (plan) => <StatusHighlighter value={getCalorieBand(Number(plan.calories || 0))} /> },
        {
            key: 'dietPlan',
            header: 'Diet Instructions',
            cell: (plan) => <span className="whitespace-normal text-sm font-semibold text-slate-700">{plan.dietPlan}</span>
        },
        { key: 'createdAt', header: 'Plan Date', cell: (plan) => formatDateTime(plan.createdAt), sortable: true },
        {
            key: 'mealPrep',
            header: 'Kitchen Prep',
            sortable: false,
            cell: (plan) => {
                const prep = mealPrepByNutritionId.get(plan.id)
                if (prep) return <StatusHighlighter value={prep.status} />

                return (
                    <button
                        type="button"
                        onClick={() => createMealPrep.mutate({ nutritionId: plan.id })}
                        disabled={createMealPrep.isPending}
                        className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <CookingPot className="h-3.5 w-3.5" />
                        Create Meal Prep
                    </button>
                )
            }
        }
    ]

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="Nutrition Planning"
                subtitle="Kitchen planning board from live patient nutrition and diet records."
                breadcrumbs={[{ label: 'Operations' }, { label: 'Nutrition Planning' }]}
            />

            <div className="mb-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-teal-700 shadow-sm">
                    <p className="text-2xl font-black">{nutritionPlans.length}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Total Diet Plans</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 shadow-sm">
                    <p className="text-2xl font-black">{standardDiet}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Standard Diet</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-700 shadow-sm">
                    <p className="text-2xl font-black">{lightDiet}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Light Diet</p>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sky-700 shadow-sm">
                    <p className="text-2xl font-black">{highCalorie}</p>
                    <p className="text-xs font-black uppercase tracking-wide">High Calorie</p>
                </div>
            </div>

            <div className="mb-4 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
                <CalendarDays className="mr-2 inline h-4 w-4" />
                Review live diet plans here, then create meal-prep work for the kitchen. Food Preparation only shows plans moved from this board.
            </div>

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search patient, diet instructions, calories..."
            />

            <DataTable
                data={visiblePlans}
                columns={columns}
                keyExtractor={(plan) => plan.id}
                isLoading={isLoading}
                emptyStateMessage="No live nutrition plans found. Add diet plans from Healthcare → Nutrition & Diet."
            />
        </div>
    )
}
