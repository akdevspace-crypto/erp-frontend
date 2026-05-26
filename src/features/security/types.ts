export type GateEntry = {
    id: string
    entryType: string
    visitorName: string
    mobile: string
    purpose: string
    visitingPerson?: string
    department?: string
    vehicleNo?: string
    vehicleType?: string
    driverName?: string
    driverMobile?: string
    staffName?: string
    empId?: string
    designation?: string
    companyName?: string
    materialDetails?: string
    remarks?: string
    expectedAt?: string | null
    arrivalRemarks?: string
    checkoutRemarks?: string
    status: string
    checkInAt?: string
    checkOutAt?: string | null
    recordedBy?: string
    createdAt: string
    updatedAt: string
}

export type CreateVehicleEntryPayload = {
    vehicleNo: string
    vehicleType?: string
    driverName: string
    driverMobile?: string
    purpose: string
    companyName?: string
    materialDetails?: string
    remarks?: string
}

export type CreateStaffEntryPayload = {
    staffName: string
    empId: string
    department?: string
    designation?: string
    mobile?: string
    purpose: string
    remarks?: string
}

export type CreateGateEntryPayload = {
    visitorName: string
    mobile: string
    purpose: string
    visitingPerson?: string
    department?: string
    vehicleNo?: string
    remarks?: string
    expectedAt?: string
}
