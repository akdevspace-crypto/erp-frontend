export type AmbulanceRecordType =
    | 'BOOKING'
    | 'DISPATCH'
    | 'FLEET'
    | 'STAFF_ASSIGNMENT'
    | 'TRIP_SHEET'
    | 'MAINTENANCE'
    | 'BILLING'
    | 'EMERGENCY_CALL'

export interface AmbulanceRecord {
    id: string
    entityId: string
    type: AmbulanceRecordType
    status: string
    actionBy?: string
    tenantId: string
    unitId: string
    createdAt: string
    updatedAt: string
    [key: string]: unknown
}

export interface AmbulanceField {
    key: string
    label: string
    placeholder?: string
    type?: 'text' | 'number' | 'datetime-local'
    required?: boolean
}

export interface CreateAmbulanceRecordPayload {
    type: AmbulanceRecordType
    status?: string
    data: Record<string, unknown>
}

export interface UpdateAmbulanceStatusPayload {
    entityId: string
    status: string
    type: AmbulanceRecordType
}
