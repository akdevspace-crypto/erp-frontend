import { AmbulanceRegisterPage, type AmbulanceRegisterConfig } from './AmbulanceRegisterPage'

const config: AmbulanceRegisterConfig = {
    type: 'STAFF_ASSIGNMENT',
    title: 'Driver & Staff Assignment',
    subtitle: 'Live ambulance duty assignment for drivers and support staff.',
    addLabel: 'Assign Staff',
    emptyMessage: 'No live ambulance staff assignments found. Assign a driver or support staff to begin.',
    initialStatus: 'ASSIGNED',
    statuses: ['ASSIGNED', 'ON_DUTY', 'COMPLETED'],
    fields: [
        { key: 'driverName', label: 'Driver Name', required: true },
        { key: 'supportStaff', label: 'Support Staff' },
        { key: 'vehicleNo', label: 'Vehicle No.', required: true },
        { key: 'shift', label: 'Shift / Duty Time', placeholder: 'Morning / Night / 08:00-20:00' },
        { key: 'bookingRef', label: 'Booking Reference' },
        { key: 'notes', label: 'Notes' }
    ],
    columns: [
        { key: 'driverName', header: 'Driver' },
        { key: 'supportStaff', header: 'Support Staff' },
        { key: 'vehicleNo', header: 'Vehicle' },
        { key: 'shift', header: 'Shift' },
        { key: 'bookingRef', header: 'Booking Ref' }
    ]
}

export function AmbulanceStaffAssignment() {
    return <AmbulanceRegisterPage config={config} />
}
