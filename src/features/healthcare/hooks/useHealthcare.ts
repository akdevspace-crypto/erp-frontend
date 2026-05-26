import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../components/Toast'
import { useAuthStore } from '../../../store/authStore'
import { healthcareService } from '../services/healthcare'

const resolveErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || fallback

export const useMedicationSchedules = () => {
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || 'no-unit')
    return useQuery({
        queryKey: ['medication-schedules', activeUnitId],
        queryFn: healthcareService.getMedicationSchedules
    })
}

export const useHealthcarePatients = () => {
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || 'no-unit')
    return useQuery({
        queryKey: ['healthcare-patients', activeUnitId],
        queryFn: healthcareService.getPatients
    })
}

export const useCreateHealthcarePatient = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: healthcareService.createPatient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthcare-patients'] })
            toast({ type: 'success', title: 'Patient Saved', message: 'Patient added to live healthcare dashboard' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Patient Failed', message: resolveErrorMessage(error, 'Failed to save patient') })
        }
    })
}

export const useVitalSigns = () => {
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || 'no-unit')
    return useQuery({
        queryKey: ['healthcare-vital-signs', activeUnitId],
        queryFn: healthcareService.getVitalSigns
    })
}

export const useCreateVitalSign = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: healthcareService.createVitalSign,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthcare-vital-signs'] })
            toast({ type: 'success', title: 'Vitals Saved', message: 'Vital signs recorded successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Vitals Failed', message: resolveErrorMessage(error, 'Failed to save vital signs') })
        }
    })
}

export const useNutritionPlans = () => {
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || 'no-unit')
    return useQuery({
        queryKey: ['healthcare-nutrition-plans', activeUnitId],
        queryFn: healthcareService.getNutritionPlans
    })
}

export const useCreateNutritionPlan = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: healthcareService.createNutritionPlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthcare-nutrition-plans'] })
            queryClient.invalidateQueries({ queryKey: ['healthcare-patients'] })
            toast({ type: 'success', title: 'Diet Plan Saved', message: 'Nutrition plan added successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Diet Plan Failed', message: resolveErrorMessage(error, 'Failed to save nutrition plan') })
        }
    })
}

export const useAdlRecords = () => {
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || 'no-unit')
    return useQuery({
        queryKey: ['healthcare-adl-records', activeUnitId],
        queryFn: healthcareService.getAdlRecords
    })
}

export const useCreateAdlRecord = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: healthcareService.createAdlRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthcare-adl-records'] })
            toast({ type: 'success', title: 'ADL Saved', message: 'Daily living record saved successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'ADL Failed', message: resolveErrorMessage(error, 'Failed to save ADL record') })
        }
    })
}

export const useUpdateAdlStatus = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: healthcareService.updateAdlStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthcare-adl-records'] })
            toast({ type: 'success', title: 'ADL Updated', message: 'Daily living status updated successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'ADL Update Failed', message: resolveErrorMessage(error, 'Failed to update ADL status') })
        }
    })
}

export const useCreateMedicationSchedule = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: healthcareService.createMedicationSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medication-schedules'] })
            toast({ type: 'success', title: 'Schedule Saved', message: 'Medication schedule saved successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Schedule Failed', message: resolveErrorMessage(error, 'Failed to save medication schedule') })
        }
    })
}

export const useAdministerMedicationDose = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: healthcareService.administerMedicationDose,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medication-schedules'] })
            toast({ type: 'success', title: 'Dose Updated', message: 'Medication dose marked as administered' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Dose Failed', message: resolveErrorMessage(error, 'Failed to update medication dose') })
        }
    })
}
