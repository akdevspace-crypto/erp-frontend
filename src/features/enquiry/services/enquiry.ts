import { api } from '../../../lib/axios'
import type { Enquiry, Client, AdmissionRecord } from '../types'
import type { EnquiryFormValues } from '../schema'

const mapBackendStatusToUi = (status: string, isConverted?: boolean): Enquiry['status'] => {
    if (status === 'IN_PROGRESS' || status === 'FOLLOW_UP') return 'In Progress'
    if (status === 'CLOSED') return isConverted ? 'Converted' : 'Lost'
    return 'Open'
}

const parseMeta = (rawMessage?: string | null) => {
    if (!rawMessage) return {}
    try {
        const parsed = JSON.parse(rawMessage)
        return parsed && typeof parsed === 'object' ? parsed as Record<string, string> : {}
    } catch {
        return {}
    }
}

const mapBackendEnquiry = (e: any): Enquiry => {
    const meta = parseMeta(e.rawMessage)
    const followUps = Array.isArray(e.followUps) ? e.followUps : []
    const latestFollowUp = followUps[0]
    const renewalFollowUp = followUps.find((followUp: any) => (
        String(followUp?.nextFollowupStatus || '').startsWith('RENEWAL') ||
        String(followUp?.clientInterest || '').toLowerCase() === 'renewal follow-up'
    ))
    const displayFollowUp = renewalFollowUp || latestFollowUp

    return {
        id: e.id,
        refNo: e.refNo,
        createdAt: e.createdAt,
        unitId: e.unitId,
        serviceId: e.serviceId || e.service?.id || '',
        service: e.service?.name || 'Standard',
        serviceCategory: e.service?.category || '',
        mode: e.mode || 'Digital',
        source: e.source || 'Website',
        clientName: e.client?.name || 'Unknown',
        mobile: e.client?.mobile || 'N/A',
        email: e.client?.email || 'N/A',
        comments: e.description || '',
        status: mapBackendStatusToUi(e.status, e.isConverted),
        patientName: meta.patientName || e.patientName || e.admission?.patient?.name || '',
        patientAge: meta.patientAge || e.patientAge || '',
        patientGender: meta.patientGender || e.patientGender || '',
        patientHealthCondition: meta.patientHealthCondition || e.patientHealthCondition || '',
        clientAddress: e.clientAddress || e.client?.address || '',
        clientLocation: meta.clientLocation || e.clientLocation || '',
        remarks: meta.remarks || e.remarks || '',
        lastFollowUp: displayFollowUp?.scheduledAt || null,
        lastFollowUpId: displayFollowUp?.id || undefined,
        lastFollowUpOutcome: displayFollowUp?.outcome || undefined,
        lastFollowUpStatus: displayFollowUp?.nextFollowupStatus || latestFollowUp?.nextFollowupStatus || undefined,
        isRenewalFollowUp: Boolean(renewalFollowUp),
        lastFollowedBy: e.allocation?.staff
            ? `${e.allocation.staff.firstName} ${e.allocation.staff.lastName || ''}`.trim()
            : (latestFollowUp?.user?.firstName || 'Agent'),
        automationScore: typeof e.automationScore === 'number' ? e.automationScore : 0,
        automationPriority: e.automationPriority || 'COLD',
        admissionId: e.admission?.id || null,
        admittedAt: e.admission?.admittedAt || null,
        admittedPatientName: e.admission?.patient?.name || null
    }
}

const mapBackendAdmission = (record: any): AdmissionRecord => {
    const meta = parseMeta(record.enquiry?.rawMessage)

    return {
        id: record.id,
        enquiryId: record.enquiry?.id || '',
        refNo: record.enquiry?.refNo || record.id,
        status: record.status || 'ACTIVE',
        admittedAt: record.admittedAt,
        patientName: record.patient?.name || meta.patientName || record.enquiry?.client?.name || 'Unknown',
        clientName: record.enquiry?.client?.name || 'Unknown',
        mobile: record.enquiry?.client?.mobile || 'N/A',
        email: record.enquiry?.client?.email || '',
        service: record.enquiry?.service?.name || 'Standard',
        serviceCategory: record.enquiry?.service?.category || '',
        mode: record.enquiry?.mode || '',
        patientAge: meta.patientAge || '',
        patientGender: meta.patientGender || '',
        patientHealthCondition: meta.patientHealthCondition || '',
        clientAddress: record.enquiry?.client?.address || '',
        remarks: meta.remarks || record.enquiry?.description || ''
    }
}

export const enquiryService = {
    getEnquiries: async (): Promise<Enquiry[]> => {
        const response = await api.get('/enquiry')
        return response.data.data.map(mapBackendEnquiry)
    },

    getEnquiryDetail: async (id: string): Promise<Enquiry> => {
        const response = await api.get(`/enquiry/${id}`)
        return mapBackendEnquiry(response.data.data)
    },

    addEnquiry: async (data: EnquiryFormValues): Promise<Enquiry> => {
        const response = await api.post('/enquiry', data)
        return response.data.data
    },

    updateEnquiry: async (id: string, data: EnquiryFormValues): Promise<Enquiry> => {
        const response = await api.put(`/enquiry/${id}`, data)
        return response.data.data
    },

    deleteEnquiry: async (id: string): Promise<void> => {
        await api.delete(`/enquiry/${id}`)
    },

    addFollowUp: async (
        id: string,
        data: {
            notes: string
            nextDate: string
            staffId?: string
            channel?: string
            outcome?: string
            attachmentName?: string
            clientInterest?: string
            readyToPayAmount?: number
            paymentMode?: string
            nextFollowupStatus?: string
        }
    ): Promise<Enquiry> => {
        const response = await api.post(`/enquiry/${id}/follow-up`, data)
        return response.data.data
    },

    recordRenewalOutcome: async (
        id: string,
        data: {
            followUpId?: string
            outcome: 'INTERESTED' | 'NOT_INTERESTED' | 'CALL_LATER' | 'CONVERTED_TO_NEW_SERVICE' | 'CLOSED'
            notes?: string
            nextDate?: string
            service?: string
        }
    ): Promise<any> => {
        const response = await api.post(`/enquiry/${id}/renewal-outcome`, data)
        return response.data.data
    },

    convertToAdmission: async (
        id: string,
        data: { patientName?: string, status?: string }
    ): Promise<AdmissionRecord> => {
        const response = await api.post(`/enquiry/${id}/convert-to-admission`, data)
        return mapBackendAdmission(response.data.data)
    },

    getAdmissions: async (): Promise<AdmissionRecord[]> => {
        const response = await api.get('/enquiry/admissions')
        return response.data.data.map(mapBackendAdmission)
    },

    createAdmissionClientPortalAccess: async (
        admissionId: string,
        data: { email: string; mobile?: string; password: string; roleName: 'Family Member' | 'Client Family Member' }
    ): Promise<any> => {
        const response = await api.post(`/enquiry/admissions/${admissionId}/client-portal-access`, data)
        return response.data.data
    },

    getClients: async (): Promise<Client[]> => {
        try {
            const response = await api.get('/clients')
            return response.data.data
        } catch (error) {
            const enquiries = await enquiryService.getEnquiries()
            const clients = new Map<string, Client>()

            enquiries.forEach((enquiry) => {
                const key = enquiry.email || enquiry.mobile || enquiry.clientName
                if (!key || clients.has(key)) return

                clients.set(key, {
                    id: enquiry.id,
                    name: enquiry.clientName,
                    unitId: enquiry.unitId,
                    status: enquiry.status === 'Lost' ? 'inactive' : 'active',
                    enquiriesCount: 1
                })
            })

            return Array.from(clients.values())
        }
    }
}
