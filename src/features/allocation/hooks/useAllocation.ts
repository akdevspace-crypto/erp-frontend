import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { allocationService } from '../services/allocation'
import { useToast } from '../../../components/Toast'

export const useHomeCareAllocations = () => {
    return useQuery({
        queryKey: ['allocations', 'home-care'],
        queryFn: allocationService.getHomeCareAllocations
    })
}

export const useOthersAllocations = () => {
    return useQuery({
        queryKey: ['allocations', 'others'],
        queryFn: allocationService.getOthersAllocations
    })
}

export const useClinicalAllocations = () => {
    return useQuery({
        queryKey: ['allocations', 'clinical'],
        queryFn: allocationService.getClinicalAllocations
    })
}

export const useInHouseAllocations = () => {
    return useQuery({
        queryKey: ['allocations', 'in-house'],
        queryFn: allocationService.getInHouseAllocations
    })
}

export const useCreateAllocation = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: allocationService.createAllocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allocations'] })
            queryClient.invalidateQueries({ queryKey: ['admissions'] })
            toast({ type: 'success', title: 'Care Assigned', message: 'Admission handoff moved into allocation workflow' })
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.errors?.[0]?.message ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to assign care'
            console.error('Create allocation failed:', error?.response?.data || error)
            toast({ type: 'error', title: 'Handoff Failed', message })
        }
    })
}

export const useUpdateAllocation = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: allocationService.updateAllocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allocations'] })
            queryClient.invalidateQueries({ queryKey: ['admissions'] })
            toast({ type: 'success', title: 'Staff Assigned', message: 'Allocation updated successfully' })
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.errors?.[0]?.message ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to update allocation'
            console.error('Update allocation failed:', error?.response?.data || error)
            toast({ type: 'error', title: 'Assignment Failed', message })
        }
    })
}
