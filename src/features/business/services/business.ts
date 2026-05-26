import { api } from '../../../lib/axios'

export interface WelcomeCall {
    id: string
    clientId: string
    clientName?: string
    status: 'PENDING' | 'COMPLETED'
    notes?: string
    callDate?: string
    createdAt: string
}

export const businessService = {
    getWelcomeCalls: async (): Promise<WelcomeCall[]> => {
        const res = await api.get('/business')
        return Array.isArray(res.data.data) ? res.data.data : []
    },
    createWelcomeCall: async (data: any) => {
        const res = await api.post('/business', data)
        return res.data.data
    },
    updateWelcomeCall: async (id: string, data: any) => {
        const res = await api.put(`/business/${id}`, data)
        return res.data.data
    }
}
