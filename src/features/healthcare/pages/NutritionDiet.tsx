import { useMemo, useState } from 'react'
import { Apple, Plus } from 'lucide-react'
import { ActionBar } from '../../../components/ActionBar'
import { DataTable, type Column } from '../../../components/DataTable'
import { Drawer } from '../../../components/Drawer'
import { FilterSection } from '../../../components/FilterSection'
import { Input } from '../../../components/Input'
import { PageHeader } from '../../../components/PageHeader'
import { useCreateNutritionPlan, useHealthcarePatients, useNutritionPlans } from '../hooks/useHealthcare'
import type { HealthcareNutrition } from '../types'
import { formatDateTime } from '../utils'

export function NutritionDiet() {
    const [searchQuery, setSearchQuery] = useState('')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [formData, setFormData] = useState({ patientId: '', calories: '', dietPlan: '' })

    const { data: patients = [], isLoading: patientsLoading } = useHealthcarePatients()
    const { data: nutritionPlans = [], isLoading: nutritionLoading } = useNutritionPlans()
    const createNutrition = useCreateNutritionPlan()

    const visiblePlans = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return nutritionPlans.filter((plan) => !query || [
            plan.patient?.name || '',
            plan.dietPlan,
            plan.calories
        ].some((value) => String(value).toLowerCase().includes(query)))
    }, [nutritionPlans, searchQuery])

    const averageCalories = nutritionPlans.length
        ? Math.round(nutritionPlans.reduce((sum, plan) => sum + Number(plan.calories || 0), 0) / nutritionPlans.length)
        : 0

    const columns: Column<HealthcareNutrition>[] = [
        { key: 'sno', header: 'S.No', cell: (_item, index) => index + 1, sortable: false },
        {
            key: 'patient',
            header: 'Patient',
            cell: (plan) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        <Apple className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-black text-slate-950">{plan.patient?.name || 'Patient'}</p>
                        <p className="text-xs font-semibold text-slate-500">Nutrition plan</p>
                    </div>
                </div>
            )
        },
        { key: 'calories', header: 'Calories', cell: (plan) => `${plan.calories} kcal`, sortable: true },
        {
            key: 'dietPlan',
            header: 'Diet Plan',
            cell: (plan) => <span className="whitespace-normal text-sm font-semibold text-slate-700">{plan.dietPlan}</span>
        },
        { key: 'createdAt', header: 'Created', cell: (plan) => formatDateTime(plan.createdAt), sortable: true },
        { key: 'updatedAt', header: 'Updated', cell: (plan) => formatDateTime(plan.updatedAt), sortable: true }
    ]

    const handleCreateNutrition = async (event: React.FormEvent) => {
        event.preventDefault()
        const calories = Math.trunc(Number(formData.calories || 0))
        if (!formData.patientId || calories <= 0 || !formData.dietPlan.trim()) return

        await createNutrition.mutateAsync({
            patientId: formData.patientId,
            calories,
            dietPlan: formData.dietPlan.trim()
        })
        setFormData({ patientId: '', calories: '', dietPlan: '' })
        setDrawerOpen(false)
    }

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title="Nutrition & Diet"
                subtitle="Live diet plans linked directly to registered patients."
                breadcrumbs={[{ label: 'Healthcare' }, { label: 'Nutrition & Diet' }]}
            />

            <div className="mb-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-teal-700 shadow-sm">
                    <p className="text-2xl font-black">{nutritionPlans.length}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Diet Plans</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 shadow-sm">
                    <p className="text-2xl font-black">{averageCalories}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Avg Calories</p>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sky-700 shadow-sm">
                    <p className="text-2xl font-black">{patients.length}</p>
                    <p className="text-xs font-black uppercase tracking-wide">Patients Available</p>
                </div>
            </div>

            <ActionBar onAdd={() => setDrawerOpen(true)} addLabel="Add Diet Plan" />

            <FilterSection
                searchQuery={searchQuery}
                onSearchChange={(event) => setSearchQuery(event.target.value)}
                searchPlaceholder="Search patient, diet plan, calories..."
            />

            <DataTable
                data={visiblePlans}
                columns={columns}
                keyExtractor={(plan) => plan.id}
                isLoading={patientsLoading || nutritionLoading}
                emptyStateMessage="No live nutrition plans found. Add a diet plan for an existing patient."
            />

            <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Diet Plan" size="md">
                <form onSubmit={handleCreateNutrition} className="space-y-4">
                    <label className="block">
                        <span className="mb-1 block text-sm font-bold text-slate-700">Patient</span>
                        <select
                            required
                            value={formData.patientId}
                            onChange={(event) => setFormData((prev) => ({ ...prev, patientId: event.target.value }))}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                        >
                            <option value="">Select patient</option>
                            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
                        </select>
                    </label>
                    <Input label="Calories" required type="number" min="1" step="1" value={formData.calories} onChange={(event) => setFormData((prev) => ({ ...prev, calories: event.target.value }))} placeholder="1800" />
                    <label className="block">
                        <span className="mb-1 block text-sm font-bold text-slate-700">Diet Plan</span>
                        <textarea
                            required
                            value={formData.dietPlan}
                            onChange={(event) => setFormData((prev) => ({ ...prev, dietPlan: event.target.value }))}
                            placeholder="Breakfast, lunch, dinner, restrictions, hydration notes..."
                            className="min-h-32 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#00b3a7] focus:outline-none focus:ring-2 focus:ring-[#00b3a7]/20"
                        />
                    </label>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                        This saves to the live Nutrition table and appears on the patient dashboard.
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">Cancel</button>
                        <button type="submit" disabled={createNutrition.isPending || !patients.length} className="inline-flex items-center gap-2 rounded-xl bg-[#00b3a7] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60">
                            <Plus className="h-4 w-4" />
                            {createNutrition.isPending ? 'Saving...' : 'Save Diet Plan'}
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    )
}
