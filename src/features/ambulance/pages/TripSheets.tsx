import { AmbulanceRegisterPage, type AmbulanceRegisterConfig } from './AmbulanceRegisterPage'

const config: AmbulanceRegisterConfig = {
    type: 'TRIP_SHEET',
    title: 'Trip Sheets',
    subtitle: 'Live trip sheet records for ambulance trips, kilometres, and closure.',
    addLabel: 'Add Trip Sheet',
    emptyMessage: 'No live trip sheets found. Add trip closure details after dispatch completion.',
    initialStatus: 'OPEN',
    statuses: ['OPEN', 'COMPLETED', 'BILLED'],
    fields: [
        { key: 'bookingRef', label: 'Booking Reference', required: true },
        { key: 'vehicleNo', label: 'Vehicle No.', required: true },
        { key: 'driverName', label: 'Driver Name', required: true },
        { key: 'kmStart', label: 'KM Start', type: 'number' },
        { key: 'kmEnd', label: 'KM End', type: 'number' },
        { key: 'tripNotes', label: 'Trip Notes' }
    ],
    columns: [
        { key: 'bookingRef', header: 'Booking Ref' },
        { key: 'vehicleNo', header: 'Vehicle' },
        { key: 'driverName', header: 'Driver' },
        { key: 'kmStart', header: 'KM Start' },
        { key: 'kmEnd', header: 'KM End' }
    ]
}

export function TripSheets() {
    return <AmbulanceRegisterPage config={config} />
}
