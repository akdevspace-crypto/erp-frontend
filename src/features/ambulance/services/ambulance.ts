import { api } from '../../../lib/axios'
import type { AmbulanceRecord, AmbulanceRecordType, CreateAmbulanceRecordPayload, UpdateAmbulanceStatusPayload } from '../types'

export const ambulanceService = {
    getRecords: async (type: AmbulanceRecordType): Promise<AmbulanceRecord[]> => {
        const response = await api.get('/ambulance/records', { params: { type } })
        return response.data?.data || []
    },

    createRecord: async (payload: CreateAmbulanceRecordPayload): Promise<AmbulanceRecord> => {
        const response = await api.post('/ambulance/records', payload)
        return response.data?.data
    },

    updateStatus: async ({ entityId, status }: UpdateAmbulanceStatusPayload): Promise<AmbulanceRecord> => {
        const response = await api.patch(`/ambulance/records/${entityId}/status`, { status })
        return response.data?.data
    }
}
