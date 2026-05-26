import { AmbulanceRegisterPage, type AmbulanceRegisterConfig } from './AmbulanceRegisterPage'

const config: AmbulanceRegisterConfig = {
    type: 'BOOKING',
    title: 'Ambulance Bookings',
    subtitle: 'Live ambulance booking requests created manually for dispatch follow-up.',
    addLabel: 'Add Booking',
    emptyMessage: 'No live ambulance bookings found. Add a booking to start dispatch flow.',
    initialStatus: 'REQUESTED',
    statuses: ['REQUESTED', 'DISPATCH_READY', 'DISPATCHED', 'COMPLETED'],
    fields: [
        { key: 'clientName', label: 'Client / Patient Name', required: true, placeholder: 'Enter client or patient name' },
        { key: 'mobile', label: 'Mobile', required: true, placeholder: 'Contact number' },
        { key: 'pickupLocation', label: 'Pickup Location', required: true },
        { key: 'destination', label: 'Destination', required: true },
        { key: 'priority', label: 'Priority', placeholder: 'Emergency / Normal' },
        { key: 'notes', label: 'Notes', placeholder: 'Ambulance need, oxygen, stretcher...' }
    ],
    columns: [
        { key: 'clientName', header: 'Client / Patient' },
        { key: 'mobile', header: 'Mobile' },
        { key: 'pickupLocation', header: 'Pickup' },
        { key: 'destination', header: 'Destination' },
        { key: 'priority', header: 'Priority' }
    ]
}

export function AmbulanceBookings() {
    return <AmbulanceRegisterPage config={config} />
}
