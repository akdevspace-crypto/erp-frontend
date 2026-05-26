export interface Enquiry {
    id: string
    refNo: string
    createdAt: string
    unitId: string
    serviceId?: string
    service: string
    mode: string
    clientName: string
    mobile: string
    email?: string
    comments?: string
    status: 'Open' | 'In Progress' | 'Converted' | 'Lost'
    patientName?: string
    patientAge?: string
    patientGender?: string
    patientHealthCondition?: string
    clientAddress?: string
    clientLocation?: string
    remarks?: string
    lastFollowUp?: string
    lastFollowUpId?: string
    lastFollowUpOutcome?: string
    lastFollowUpStatus?: string
    isRenewalFollowUp?: boolean
    serviceCategory?: string
    source?: string
    lastFollowedBy?: string
    automationScore?: number
    automationPriority?: 'HOT' | 'WARM' | 'COLD'
    admissionId?: string | null
    admittedAt?: string | null
    admittedPatientName?: string | null
}

export interface Client {
    id: string
    name: string
    unitId: string
    status: 'active' | 'inactive'
    enquiriesCount: number
}

export interface AdmissionRecord {
    id: string
    enquiryId: string
    refNo: string
    status: string
    admittedAt: string
    patientName: string
    clientName: string
    mobile: string
    email?: string
    service: string
    serviceCategory?: string
    mode?: string
    patientAge?: string
    patientGender?: string
    patientHealthCondition?: string
    clientAddress?: string
    remarks?: string
}
