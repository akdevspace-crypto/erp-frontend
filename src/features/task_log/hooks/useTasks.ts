import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services/tasks'
import { useToast } from '../../../components/Toast'
import { AxiosError } from 'axios'

export const useTasks = (params?: { scope?: 'approval' | 'mine'; assigneeId?: string; assignedStaffId?: string }) => {
    return useQuery({
        queryKey: ['tasks', params || {}],
        queryFn: () => taskService.getTasks(params)
    })
}

export const useApprovalTasks = () => {
    return useQuery({
        queryKey: ['tasks', 'approval'],
        queryFn: () => taskService.getTasks({ scope: 'approval' })
    })
}

export const useCreateTask = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: taskService.createTask,
        retry: 0,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['tasks', 'approval'] })
            toast({ type: 'success', title: 'Assigned', message: 'Task successfully created' })
        },
        onError: (error) => {
            const message = error instanceof AxiosError
                ? error.response?.data?.message || 'Failed to assign task'
                : 'Failed to assign task'
            toast({ type: 'error', title: 'Error', message })
        }
    })
}

export const useUpdateTaskStatus = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED' }) =>
            taskService.updateTaskStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['tasks', 'approval'] })
            queryClient.invalidateQueries({ queryKey: ['customer-care', 'service-history'] })
            toast({ type: 'success', title: 'Updated', message: 'Task status updated' })
        },
        onError: (error) => {
            const message = error instanceof AxiosError
                ? error.response?.data?.message || 'Failed to update task status'
                : 'Failed to update task status'
            toast({ type: 'error', title: 'Error', message })
        }
    })
}
