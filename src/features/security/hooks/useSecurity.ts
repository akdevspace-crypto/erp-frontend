import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../components/Toast'
import { securityService } from '../services/security'

const resolveErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || fallback

export const useGateEntries = () => {
    return useQuery({
        queryKey: ['security-gate-entries'],
        queryFn: securityService.getGateEntries,
        retry: false
    })
}

export const useCreateGateEntry = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: securityService.createGateEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['security-gate-entries'] })
            toast({ type: 'success', title: 'Checked In', message: 'Visitor entry saved successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Check-in Failed', message: resolveErrorMessage(error, 'Failed to save visitor entry') })
        }
    })
}

export const useCreateExpectedVisitor = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: securityService.createExpectedVisitor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['security-gate-entries'] })
            toast({ type: 'success', title: 'Expected Visitor Saved', message: 'Visitor added to expected queue' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Expected Visitor Failed', message: resolveErrorMessage(error, 'Failed to save expected visitor') })
        }
    })
}

export const useCheckInExpectedVisitor = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: securityService.checkInExpectedVisitor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['security-gate-entries'] })
            toast({ type: 'success', title: 'Checked In', message: 'Expected visitor moved to active gate register' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Check-in Failed', message: resolveErrorMessage(error, 'Failed to check in expected visitor') })
        }
    })
}

export const useCreateVehicleEntry = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: securityService.createVehicleEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['security-gate-entries'] })
            toast({ type: 'success', title: 'Vehicle Checked In', message: 'Vehicle entry saved successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Vehicle Entry Failed', message: resolveErrorMessage(error, 'Failed to save vehicle entry') })
        }
    })
}

export const useCreateStaffEntry = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: securityService.createStaffEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['security-gate-entries'] })
            toast({ type: 'success', title: 'Staff Checked In', message: 'Staff movement saved successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Staff Entry Failed', message: resolveErrorMessage(error, 'Failed to save staff movement') })
        }
    })
}

export const useCheckoutGateEntry = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: securityService.checkoutGateEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['security-gate-entries'] })
            toast({ type: 'success', title: 'Checked Out', message: 'Visitor checkout saved successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Checkout Failed', message: resolveErrorMessage(error, 'Failed to checkout visitor') })
        }
    })
}
