import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../components/Toast'
import { ambulanceService } from '../services/ambulance'
import type { AmbulanceRecordType } from '../types'

const resolveErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || fallback

export const ambulanceQueryKey = (type: AmbulanceRecordType) => ['ambulance-records', type]

export const useAmbulanceRecords = (type: AmbulanceRecordType) => {
    return useQuery({
        queryKey: ambulanceQueryKey(type),
        queryFn: () => ambulanceService.getRecords(type),
        retry: false
    })
}

export const useCreateAmbulanceRecord = (type: AmbulanceRecordType) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ambulanceService.createRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ambulanceQueryKey(type) })
            toast({ type: 'success', title: 'Saved', message: 'Ambulance record saved successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Save Failed', message: resolveErrorMessage(error, 'Failed to save ambulance record') })
        }
    })
}

export const useUpdateAmbulanceStatus = (type: AmbulanceRecordType) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ambulanceService.updateStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ambulanceQueryKey(type) })
            toast({ type: 'success', title: 'Updated', message: 'Ambulance status updated successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Update Failed', message: resolveErrorMessage(error, 'Failed to update ambulance status') })
        }
    })
}
