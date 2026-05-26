import { api } from '../../../lib/axios'
import type {
    AdministerMedicationDosePayload,
    AdlRecord,
    CreateAdlPayload,
    CreateMedicationSchedulePayload,
    CreateNutritionPayload,
    CreatePatientPayload,
    CreateVitalSignPayload,
    HealthcareNutrition,
    HealthcarePatient,
    MedicationSchedule,
    UpdateAdlStatusPayload,
    VitalSign
} from '../types'

export const healthcareService = {
    getPatients: async (): Promise<HealthcarePatient[]> => {
        const response = await api.get('/patient')
        return response.data?.data || []
    },

    createPatient: async (payload: CreatePatientPayload): Promise<HealthcarePatient> => {
        const response = await api.post('/patient', payload)
        return response.data?.data
    },

    getVitalSigns: async (): Promise<VitalSign[]> => {
        const response = await api.get('/vital-sign')
        return response.data?.data || []
    },

    createVitalSign: async (payload: CreateVitalSignPayload): Promise<VitalSign> => {
        const response = await api.post('/vital-sign', payload)
        return response.data?.data
    },

    getNutritionPlans: async (): Promise<HealthcareNutrition[]> => {
        const response = await api.get('/nutrition')
        return response.data?.data || []
    },

    createNutritionPlan: async (payload: CreateNutritionPayload): Promise<HealthcareNutrition> => {
        const response = await api.post('/nutrition', payload)
        return response.data?.data
    },

    getAdlRecords: async (): Promise<AdlRecord[]> => {
        const response = await api.get('/adl-records')
        return response.data?.data || []
    },

    createAdlRecord: async (payload: CreateAdlPayload): Promise<AdlRecord> => {
        const response = await api.post('/adl-records', payload)
        return response.data?.data
    },

    updateAdlStatus: async ({ id, status }: UpdateAdlStatusPayload): Promise<AdlRecord> => {
        const response = await api.patch(`/adl-records/${id}/status`, { status })
        return response.data?.data
    },

    getMedicationSchedules: async (): Promise<MedicationSchedule[]> => {
        const response = await api.get('/medication-schedules')
        return response.data?.data || []
    },

    createMedicationSchedule: async (payload: CreateMedicationSchedulePayload): Promise<MedicationSchedule> => {
        const response = await api.post('/medication-schedules', payload)
        return response.data?.data
    },

    administerMedicationDose: async ({ id, slot, remarks }: AdministerMedicationDosePayload): Promise<MedicationSchedule> => {
        const response = await api.patch(`/medication-schedules/${id}/administer`, { slot, remarks })
        return response.data?.data
    }
}
