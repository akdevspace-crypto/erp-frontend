import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrService } from '../services/hr'
import { useToast } from '../../../components/Toast'
import { useAuthStore } from '../../../store/authStore'

const resolveApiErrorMessage = (error: any, fallback: string) => {
    const validationErrors = error?.response?.data?.errors
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        return validationErrors[0]?.message || fallback
    }

    return error?.response?.data?.message || fallback
}

export const useStaff = (options?: { includeFormer?: boolean; scope?: 'all' }) => {
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || 'no-unit')

    return useQuery({
        queryKey: ['staff', options?.scope === 'all' ? 'all' : activeUnitId, options?.includeFormer ? 'includeFormer' : 'activeOnly'],
        queryFn: () => hrService.getStaffList(options),
        retry: false
    })
}

export const useRoles = () => {
    return useQuery({
        queryKey: ['roles'],
        queryFn: hrService.getRoles
    })
}

export const useAttendanceLogs = (options?: { date?: string; scope?: 'all' }) => {
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || 'no-unit')

    return useQuery({
        queryKey: ['attendance', options?.scope === 'all' ? 'all' : activeUnitId, options?.date || 'today'],
        queryFn: () => hrService.getAttendanceLogs(options),
        retry: false
    })
}

export const useMyAttendanceLogs = (options?: { date?: string }) => {
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || 'no-unit')
    const staffId = useAuthStore((state) => state.user?.staffId || 'no-staff')

    return useQuery({
        queryKey: ['my-attendance', activeUnitId, staffId, options?.date || 'today'],
        queryFn: () => hrService.getMyAttendanceLogs(options),
        retry: false
    })
}

export const useMarkMyAttendance = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: hrService.markMyAttendance,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['my-attendance'] })
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
            toast({
                type: 'success',
                title: variables.action === 'CHECK_IN' ? 'Checked In' : 'Checked Out',
                message: variables.action === 'CHECK_IN' ? 'Your attendance check-in is saved' : 'Your attendance check-out is saved'
            })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Error', message: resolveApiErrorMessage(error, 'Failed to update attendance') })
        }
    })
}

export const usePayrollPreview = (options?: { month?: string; scope?: 'all' }) => {
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || 'no-unit')

    return useQuery({
        queryKey: ['payroll-preview', options?.scope === 'all' ? 'all' : activeUnitId, options?.month || 'current'],
        queryFn: () => hrService.getPayrollPreview(options),
        retry: false
    })
}

export const useProcessPayroll = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: hrService.processPayroll,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll-preview'] })
            toast({ type: 'success', title: 'Processed', message: 'Payroll has been marked as processed' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Error', message: resolveApiErrorMessage(error, 'Failed to process payroll') })
        }
    })
}

export const useLeaveRequests = () => {
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || 'no-unit')

    return useQuery({
        queryKey: ['leave-requests', activeUnitId, 'all-accessible'],
        queryFn: () => hrService.getLeaveRequests({ scope: 'all' }),
        retry: false
    })
}

export const useCreateLeaveRequest = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: hrService.createLeaveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
            toast({ type: 'success', title: 'Saved', message: 'Leave request created successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Error', message: resolveApiErrorMessage(error, 'Failed to create leave request') })
        }
    })
}

export const useMyLeaveRequests = () => {
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || 'no-unit')
    const staffId = useAuthStore((state) => state.user?.staffId || 'no-staff')

    return useQuery({
        queryKey: ['my-leave-requests', activeUnitId, staffId],
        queryFn: hrService.getMyLeaveRequests,
        retry: false
    })
}

export const useCreateMyLeaveRequest = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: hrService.createMyLeaveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] })
            queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
            toast({ type: 'success', title: 'Submitted', message: 'Leave request sent to HR for approval' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Error', message: resolveApiErrorMessage(error, 'Failed to submit leave request') })
        }
    })
}

export const useUpdateLeaveRequestStatus = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ id, status, remarks }: { id: string; status: 'APPROVED' | 'REJECTED'; remarks?: string }) =>
            hrService.updateLeaveRequestStatus(id, { status, remarks }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
            queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] })
            toast({ type: 'success', title: 'Updated', message: `Leave request ${variables.status.toLowerCase()} successfully` })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Error', message: resolveApiErrorMessage(error, 'Failed to update leave request') })
        }
    })
}

export const useAddStaff = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: hrService.addStaff,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] })
            toast({ type: 'success', title: 'Success', message: 'Staff member onboarded successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Error', message: resolveApiErrorMessage(error, 'Failed to onboard staff') })
        }
    })
}

export const useUpdateStaff = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ staffId, data }: { staffId: string, data: any }) => hrService.updateStaff(staffId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] })
            toast({ type: 'success', title: 'Success', message: 'Staff member updated successfully' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Error', message: resolveApiErrorMessage(error, 'Failed to update staff member') })
        }
    })
}

export const useDeleteStaff = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: hrService.deleteStaff,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] })
            toast({ type: 'success', title: 'Deleted', message: 'Staff member removed' })
        },
        onError: (error: any) => {
            toast({ type: 'error', title: 'Error', message: resolveApiErrorMessage(error, 'Failed to delete staff member') })
        }
    })
}

export const useCreateStaffLogin = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ staffId, data }: { staffId: string; data: { email: string; password: string; roleId: string } }) =>
            hrService.createStaffLogin(staffId, data),
        retry: 0,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] })
            toast({ type: 'success', title: 'Success', message: 'Staff login created and linked successfully' })
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to create staff login'
            toast({ type: 'error', title: 'Error', message })
        }
    })
}

// Job Applications Hooks
export const useJobApplications = () => {
    return useQuery({
        queryKey: ['job-applications'],
        queryFn: hrService.getJobApplications
    })
}

export const useCreateJobApplication = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: hrService.createJobApplication,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-applications'] })
            toast({ type: 'success', title: 'Success', message: 'Job Application submitted' })
        },
        onError: () => toast({ type: 'error', title: 'Error', message: 'Failed to submit application' })
    })
}

export const useUpdateJobApplication = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => hrService.updateJobApplication(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-applications'] })
            toast({ type: 'success', title: 'Success', message: 'Job Application updated' })
        },
        onError: () => toast({ type: 'error', title: 'Error', message: 'Failed to update application' })
    })
}

export const useDeleteJobApplication = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: hrService.deleteJobApplication,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-applications'] })
            toast({ type: 'success', title: 'Deleted', message: 'Job Application removed' })
        },
        onError: () => toast({ type: 'error', title: 'Error', message: 'Failed to delete application' })
    })
}

// Force Vite HMR Cache Invalidation
