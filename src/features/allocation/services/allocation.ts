import { api } from '../../../lib/axios'
import type { HomeCareAllocation } from '../types'

const formatAllocationStatus = (status?: string) => {
    if (status === 'ALLOCATED') return 'Allocated'
    if (status === 'PENDING') return 'Pending'
    if (status === 'ON_HOLD') return 'On Hold'
    if (status === 'COMPLETED') return 'Completed'
    return status || 'Pending'
}

const formatStaffName = (allocation: any) => allocation.staff
    ? `${allocation.staff.firstName} ${allocation.staff.lastName || ''}`.trim()
    : allocation.staffName || (allocation.staffId ? 'Assigned Staff' : 'Not Assigned')

const formatDateTime = (value?: string | null) => {
    if (!value) return '-'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'

    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const mapAllocation = (allocation: any, fallbackService: string) => ({
    id: allocation.id,
    staffId: allocation.staffId || allocation.staff?.id || null,
    ref: allocation.enquiry?.refNo || allocation.ref || '-',
    service: allocation.enquiry?.service?.name || allocation.service || fallbackService,
    serviceCategory: allocation.enquiry?.service?.category || '',
    clientName: allocation.enquiry?.client?.name || allocation.clientName || allocation.metadata?.clientName || 'Unknown Client',
    mobile: allocation.enquiry?.client?.mobile || allocation.mobile || '',
    mode: allocation.enquiry?.mode || allocation.mode || 'Admission',
    status: formatAllocationStatus(allocation.status),
    contract: allocation.contract || 'Monthly',
    staffName: formatStaffName(allocation),
    startDate: allocation.startDate || null,
    endDate: allocation.endDate || null,
    scheduleText: `${formatDateTime(allocation.startDate)} - ${formatDateTime(allocation.endDate)}`,
    patient: allocation.metadata?.patientName || allocation.patient || '-',
    guardian: allocation.metadata?.clientName || allocation.guardian || '-',
    payment: allocation.metadata?.payment || allocation.payment || 'Pending',
    notes: allocation.metadata?.notes || ''
})

export const allocationService = {
    getHomeCareAllocations: async (): Promise<HomeCareAllocation[]> => {
        const res = await api.get('/allocation/home-care')
        const allocations = Array.isArray(res.data.data) ? res.data.data : []

        return allocations.map((a: any) => mapAllocation(a, 'Home Care'))
    },

    getClinicalAllocations: async (): Promise<any[]> => {
        const res = await api.get('/allocation/clinical')
        const allocations = Array.isArray(res.data.data) && res.data.data.length > 0
            ? res.data.data
            : []

        return allocations.map((a: any) => mapAllocation(a, 'Clinical Care'))
    },

    getInHouseAllocations: async (): Promise<any[]> => {
        const res = await api.get('/allocation/in-house')
        const allocations = Array.isArray(res.data.data) && res.data.data.length > 0
            ? res.data.data
            : []

        return allocations.map((a: any) => mapAllocation(a, 'In-House Care'))
    },
    getOthersAllocations: async (): Promise<any[]> => {
        const res = await api.get('/allocation/others')
        const allocations = Array.isArray(res.data.data) ? res.data.data : []

        return allocations.map((a: any) => mapAllocation(a, 'Others'))
    },

    createAllocation: async (data: any) => {
        const res = await api.post('/allocation', data)
        return res.data.data
    },

    updateAllocation: async ({ id, ...data }: { id: string, [key: string]: any }) => {
        const res = await api.patch(`/allocation/${id}`, data)
        return res.data.data
    }
}
