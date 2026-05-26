import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessService } from '../services/business'

export const useWelcomeCalls = () => {
    return useQuery({
        queryKey: ['welcome-calls'],
        queryFn: businessService.getWelcomeCalls,
        retry: false
    })
}

export const useUpdateWelcomeCall = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => businessService.updateWelcomeCall(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['welcome-calls'] })
        }
    })
}
