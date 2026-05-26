import { AmbulanceRegisterPage, type AmbulanceRegisterConfig } from './AmbulanceRegisterPage'

const config: AmbulanceRegisterConfig = {
    type: 'BILLING',
    title: 'Ambulance Billing',
    subtitle: 'Live ambulance billing records linked to trip and booking references.',
    addLabel: 'Add Bill',
    emptyMessage: 'No live ambulance billing records found. Add a bill after trip sheet completion.',
    initialStatus: 'CREATED',
    statuses: ['CREATED', 'POSTED', 'PAID'],
    fields: [
        { key: 'bookingRef', label: 'Booking Reference', required: true },
        { key: 'clientName', label: 'Client Name', required: true },
        { key: 'tripRef', label: 'Trip Sheet Reference' },
        { key: 'amount', label: 'Amount', type: 'number', required: true },
        { key: 'paymentMode', label: 'Payment Mode' },
        { key: 'remarks', label: 'Remarks' }
    ],
    columns: [
        { key: 'bookingRef', header: 'Booking Ref' },
        { key: 'clientName', header: 'Client' },
        { key: 'tripRef', header: 'Trip Ref' },
        { key: 'amount', header: 'Amount' },
        { key: 'paymentMode', header: 'Payment Mode' }
    ]
}

export function AmbulanceBilling() {
    return <AmbulanceRegisterPage config={config} />
}
