import { api } from '../../../lib/axios'
import type { CreateGateEntryPayload, CreateStaffEntryPayload, CreateVehicleEntryPayload, GateEntry } from '../types'

export const securityService = {
    getGateEntries: async (): Promise<GateEntry[]> => {
        const response = await api.get('/security/gate-entries')
        return response.data?.data || []
    },

    createGateEntry: async (payload: CreateGateEntryPayload): Promise<GateEntry> => {
        const response = await api.post('/security/gate-entries', payload)
        return response.data?.data
    },

    createExpectedVisitor: async (payload: CreateGateEntryPayload): Promise<GateEntry> => {
        const response = await api.post('/security/expected-visitors', payload)
        return response.data?.data
    },

    createVehicleEntry: async (payload: CreateVehicleEntryPayload): Promise<GateEntry> => {
        const response = await api.post('/security/vehicle-entries', payload)
        return response.data?.data
    },

    createStaffEntry: async (payload: CreateStaffEntryPayload): Promise<GateEntry> => {
        const response = await api.post('/security/staff-entries', payload)
        return response.data?.data
    },

    checkInExpectedVisitor: async ({ id, remarks }: { id: string; remarks?: string }): Promise<GateEntry> => {
        const response = await api.patch(`/security/expected-visitors/${id}/check-in`, { remarks })
        return response.data?.data
    },

    checkoutGateEntry: async ({ id, remarks }: { id: string; remarks?: string }): Promise<GateEntry> => {
        const response = await api.patch(`/security/gate-entries/${id}/checkout`, { remarks })
        return response.data?.data
    }
}
