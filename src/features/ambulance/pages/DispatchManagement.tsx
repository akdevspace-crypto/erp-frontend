import { AmbulanceRegisterPage, type AmbulanceRegisterConfig } from './AmbulanceRegisterPage'

const config: AmbulanceRegisterConfig = {
    type: 'DISPATCH',
    title: 'Dispatch Management',
    subtitle: 'Live ambulance dispatch movement with vehicle and driver tracking.',
    addLabel: 'Add Dispatch',
    emptyMessage: 'No live dispatch records found. Add dispatch details after booking confirmation.',
    initialStatus: 'DISPATCHED',
    statuses: ['DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED'],
    fields: [
        { key: 'bookingRef', label: 'Booking Reference', required: true, placeholder: 'Booking/client reference' },
        { key: 'ambulanceNo', label: 'Ambulance No.', required: true },
        { key: 'driverName', label: 'Driver Name', required: true },
        { key: 'pickupLocation', label: 'Pickup Location' },
        { key: 'destination', label: 'Destination' },
        { key: 'dispatchTime', label: 'Dispatch Time', type: 'datetime-local' }
    ],
    columns: [
        { key: 'bookingRef', header: 'Booking Ref' },
        { key: 'ambulanceNo', header: 'Ambulance' },
        { key: 'driverName', header: 'Driver' },
        { key: 'pickupLocation', header: 'Pickup' },
        { key: 'destination', header: 'Destination' }
    ]
}

export function DispatchManagement() {
    return <AmbulanceRegisterPage config={config} />
}
