import { Printer } from 'lucide-react'
import { Modal } from '../../../components/Modal'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import type { GateEntry } from '../types'

interface VisitorPassModalProps {
    entry: GateEntry | null
    onClose: () => void
}

const formatDateTime = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const passNo = (entry: GateEntry) => `GATE-${entry.id.slice(0, 8).toUpperCase()}`

const escapeHtml = (value?: string | null) =>
    String(value || '-')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

const DetailBox = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
        <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-black text-slate-900">{value || '-'}</p>
    </div>
)

export function VisitorPassModal({ entry, onClose }: VisitorPassModalProps) {
    if (!entry) return null

    const isVehicle = entry.entryType === 'VEHICLE'
    const isStaff = entry.entryType === 'STAFF'
    const title = isVehicle ? 'Vehicle Gate Pass' : isStaff ? 'Staff Gate Pass' : 'Visitor Gate Pass'
    const primaryName = isVehicle ? entry.vehicleNo : isStaff ? entry.staffName || entry.empId : entry.visitorName
    const mobile = isVehicle ? entry.driverMobile : entry.mobile
    const personLabel = isVehicle ? 'Driver' : isStaff ? 'Staff' : 'Visitor'
    const secondaryLabel = isVehicle ? 'Company / Vendor' : isStaff ? 'Department' : 'Visiting'
    const secondaryValue = isVehicle ? entry.companyName : isStaff ? entry.department : entry.visitingPerson || entry.department
    const noteValue = entry.remarks || entry.arrivalRemarks || entry.checkoutRemarks

    const handlePrint = () => {
        const printable = window.open('', '_blank', 'width=720,height=820')
        if (!printable) return

        printable.document.write(`
            <!doctype html>
            <html>
                <head>
                    <title>${escapeHtml(passNo(entry))}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
                        .pass { border: 1px solid #cbd5e1; border-radius: 18px; padding: 24px; max-width: 560px; }
                        .top { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
                        h1 { margin: 0; font-size: 24px; }
                        .badge { border: 1px solid #14b8a6; color: #0f766e; border-radius: 999px; padding: 6px 12px; font-weight: 700; font-size: 12px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; }
                        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
                        .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: .08em; }
                        .value { margin-top: 6px; font-size: 15px; font-weight: 700; }
                        .wide { grid-column: 1 / -1; }
                        .foot { margin-top: 24px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
                    </style>
                </head>
                <body>
                    <section class="pass">
                        <div class="top">
                            <div>
                                <h1>${escapeHtml(title)}</h1>
                                <p>${passNo(entry)}</p>
                            </div>
                            <div class="badge">${escapeHtml(entry.status)}</div>
                        </div>
                        <div class="grid">
                            <div class="box"><div class="label">${escapeHtml(isVehicle ? 'Vehicle No' : isStaff ? 'Staff' : 'Visitor')}</div><div class="value">${escapeHtml(primaryName)}</div></div>
                            <div class="box"><div class="label">Mobile</div><div class="value">${escapeHtml(mobile)}</div></div>
                            <div class="box"><div class="label">Purpose</div><div class="value">${escapeHtml(entry.purpose)}</div></div>
                            <div class="box"><div class="label">${escapeHtml(isVehicle ? 'Driver' : isStaff ? 'Employee ID' : 'Visiting')}</div><div class="value">${escapeHtml(isVehicle ? entry.driverName : isStaff ? entry.empId : entry.visitingPerson || entry.department)}</div></div>
                            <div class="box"><div class="label">${escapeHtml(isVehicle ? 'Vehicle Type' : isStaff ? 'Designation' : 'Vehicle')}</div><div class="value">${escapeHtml(isVehicle ? entry.vehicleType : isStaff ? entry.designation : entry.vehicleNo)}</div></div>
                            <div class="box"><div class="label">Check In</div><div class="value">${escapeHtml(formatDateTime(entry.checkInAt))}</div></div>
                            <div class="box"><div class="label">Check Out</div><div class="value">${escapeHtml(formatDateTime(entry.checkOutAt))}</div></div>
                            <div class="box"><div class="label">Recorded By</div><div class="value">${escapeHtml(entry.recordedBy)}</div></div>
                            <div class="box wide"><div class="label">${escapeHtml(isVehicle ? 'Material / Remarks' : 'Remarks')}</div><div class="value">${escapeHtml(isVehicle ? entry.materialDetails || noteValue : noteValue)}</div></div>
                        </div>
                        <div class="foot">
                            <span>Generated from ERP gate register</span>
                            <span>Security verification</span>
                        </div>
                    </section>
                </body>
            </html>
        `)
        printable.document.close()
        printable.focus()
        printable.print()
    }

    return (
        <Modal
            isOpen={Boolean(entry)}
            onClose={onClose}
            title={title}
            type="info"
            onConfirm={handlePrint}
            confirmLabel="Print Pass"
            cancelLabel="Close"
        >
            <div className="mt-4 space-y-4 text-left">
                <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wide text-teal-700">Pass No</p>
                            <p className="mt-1 text-xl font-black text-slate-950">{passNo(entry)}</p>
                        </div>
                        <StatusHighlighter value={entry.status} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-600">
                        {isVehicle ? `${entry.vehicleNo} driven by ${entry.driverName || '-'}` : isStaff ? `${entry.staffName || entry.empId} marked for ${entry.purpose}` : `${entry.visitorName} visiting for ${entry.purpose}`}
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <DetailBox label={isVehicle ? 'Vehicle No.' : personLabel} value={primaryName} />
                    <DetailBox label={isVehicle ? 'Driver Mobile' : 'Mobile'} value={mobile} />
                    <DetailBox label="Purpose" value={entry.purpose} />
                    <DetailBox label={isVehicle ? 'Driver' : isStaff ? 'Employee ID' : 'Visiting'} value={isVehicle ? entry.driverName : isStaff ? entry.empId : entry.visitingPerson || entry.department} />
                    <DetailBox label={secondaryLabel} value={secondaryValue} />
                    <DetailBox label={isVehicle ? 'Vehicle Type' : isStaff ? 'Designation' : 'Vehicle No.'} value={isVehicle ? entry.vehicleType : isStaff ? entry.designation : entry.vehicleNo} />
                    {isVehicle && <DetailBox label="Material Details" value={entry.materialDetails} />}
                    <DetailBox label="Check In" value={formatDateTime(entry.checkInAt)} />
                    <DetailBox label="Check Out" value={formatDateTime(entry.checkOutAt)} />
                    <DetailBox label="Recorded By" value={entry.recordedBy} />
                    <DetailBox label="Remarks" value={noteValue} />
                </div>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                    <Printer className="h-4 w-4" />
                    Print {isVehicle ? 'vehicle' : isStaff ? 'staff' : 'visitor'} pass
                </button>
            </div>
        </Modal>
    )
}
