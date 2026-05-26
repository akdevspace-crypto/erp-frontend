import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import { ToastProvider } from './components/Toast'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SkeletonLoader, GlobalSpinner } from './components/SkeletonLoader'
import { ErrorBoundary } from './components/ErrorBoundary'

// Auth
import { Login } from './features/auth/pages/Login'

// Lazy loaded modules
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const OrganizationDashboard = lazy(() => import('./pages/OrganizationDashboard').then(m => ({ default: m.OrganizationDashboard })))
const ReportsDashboard = lazy(() => import('./pages/ReportsDashboard').then(m => ({ default: m.ReportsDashboard })))
const FinanceManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.FinanceManagerDashboard })))
const ElderCareAdminDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.ElderCareAdminDashboard })))
const MedicalMonitorDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.MedicalMonitorDashboard })))
const EmergencyCallDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.EmergencyCallDashboard })))
const MasterDataManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.MasterDataManagerDashboard })))
const HRManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.HRManagerDashboard })))
const SecuritySupervisorDashboard = lazy(() => import('./features/security/pages/SecurityDashboard').then(m => ({ default: m.SecurityDashboard })))
const CMSManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.CMSManagerDashboard })))
const AdminFilesManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.AdminFilesManagerDashboard })))
const ProfileTaskDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.ProfileTaskDashboard })))
const InHouseCareManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.InHouseCareManagerDashboard })))
const ElderOperationsManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.ElderOperationsManagerDashboard })))
const ElderInventoryManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.ElderInventoryManagerDashboard })))
const TaskLogCoordinatorDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.TaskLogCoordinatorDashboard })))
const ElderFinanceManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.ElderFinanceManagerDashboard })))
const PatientCareManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.PatientCareManagerDashboard })))
const CareAllocationManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.CareAllocationManagerDashboard })))
const MedicalInventoryManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.MedicalInventoryManagerDashboard })))
const AmbulanceBookingCoordinatorDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.AmbulanceBookingCoordinatorDashboard })))
const DispatchManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.DispatchManagerDashboard })))
const FleetManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.FleetManagerDashboard })))
const AmbulanceBillingManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.AmbulanceBillingManagerDashboard })))
const FollowUpCoordinatorDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.FollowUpCoordinatorDashboard })))
const CustomerRelationsManagerDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.CustomerRelationsManagerDashboard })))
const OmnichannelCoordinatorDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.OmnichannelCoordinatorDashboard })))
const AdmissionsCoordinatorDashboard = lazy(() => import('./pages/RoleDashboards').then(m => ({ default: m.AdmissionsCoordinatorDashboard })))
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })))
const UserManagement = lazy(() => import('./features/super_admin/pages/UserManagement').then(m => ({ default: m.UserManagement })))

// Master
const CityMaster = lazy(() => import('./features/master/pages/CityMaster').then(m => ({ default: m.CityMaster })))
const UnitMaster = lazy(() => import('./features/master/pages/UnitMaster').then(m => ({ default: m.UnitMaster })))
const AdminFileRegister = lazy(() => import('./features/admin/pages/AdminFileRegister').then(m => ({ default: m.AdminFileRegister })))
const PaymentCategoryMaster = lazy(() => import('./features/master/pages/PaymentCategoryMaster').then(m => ({ default: m.PaymentCategoryMaster })))
const ClientServicesMaster = lazy(() => import('./features/master/pages/ClientServicesMaster').then(m => ({ default: m.ClientServicesMaster })))
const DepartmentMaster = lazy(() => import('./features/master/pages/DepartmentMaster').then(m => ({ default: m.DepartmentMaster })))
const DesignationMaster = lazy(() => import('./features/master/pages/DesignationMaster').then(m => ({ default: m.DesignationMaster })))
const LabourServicesMaster = lazy(() => import('./features/master/pages/LabourServicesMaster').then(m => ({ default: m.LabourServicesMaster })))
const VendorMaster = lazy(() => import('./features/master/pages/VendorMaster').then(m => ({ default: m.VendorMaster })))
const RoomManagementMaster = lazy(() => import('./features/master/pages/RoomManagementMaster').then(m => ({ default: m.RoomManagementMaster })))

// Enquiry & Allocation
const EnquiryFollowUp = lazy(() => import('./features/enquiry/pages/EnquiryFollowUp').then(m => ({ default: m.EnquiryFollowUp })))
const NewEnquiry = lazy(() => import('./features/enquiry/pages/NewEnquiry').then(m => ({ default: m.NewEnquiry })))
const AllClients = lazy(() => import('./features/enquiry/pages/AllClients').then(m => ({ default: m.AllClients })))
const FollowUpView = lazy(() => import('./features/enquiry/pages/FollowUpView').then(m => ({ default: m.FollowUpView })))
const HomeCare = lazy(() => import('./features/allocation/pages/HomeCare').then(m => ({ default: m.HomeCare })))
const ClinicalCare = lazy(() => import('./features/allocation/pages/ClinicalCare').then(m => ({ default: m.ClinicalCare })))
const AllocInHouseCare = lazy(() => import('./features/allocation/pages/InHouseCare').then(m => ({ default: m.InHouseCare })))
const OthersAllocation = lazy(() => import('./features/allocation/pages/Others').then(m => ({ default: m.OthersAllocation })))

// Business & Customer Care
const WelcomeCall = lazy(() => import('./features/business/pages/WelcomeCall').then(m => ({ default: m.WelcomeCall })))
const PendingFeedback = lazy(() => import('./features/customer_care/pages/PendingFeedback').then(m => ({ default: m.PendingFeedback })))
const Complaints = lazy(() => import('./features/customer_care/pages/Complaints').then(m => ({ default: m.Complaints })))
const ServiceHistory = lazy(() => import('./features/customer_care/pages/ServiceHistory').then(m => ({ default: m.ServiceHistory })))
const ClientPortalDashboard = lazy(() => import('./features/client_portal/pages/ClientPortalDashboard').then(m => ({ default: m.ClientPortalDashboard })))
const ClientPortalProfile = lazy(() => import('./features/client_portal/pages/ClientPortalProfile').then(m => ({ default: m.ClientPortalProfile })))
const ClientPortalServices = lazy(() => import('./features/client_portal/pages/ClientPortalServices').then(m => ({ default: m.ClientPortalServices })))
const ClientPortalMedicines = lazy(() => import('./features/client_portal/pages/ClientPortalMedicines').then(m => ({ default: m.ClientPortalMedicines })))
const ClientPortalComplaints = lazy(() => import('./features/client_portal/pages/ClientPortalComplaints').then(m => ({ default: m.ClientPortalComplaints })))
const ClientPortalNotifications = lazy(() => import('./features/client_portal/pages/ClientPortalNotifications').then(m => ({ default: m.ClientPortalNotifications })))
const ClientPortalAccess = lazy(() => import('./features/client_portal/pages/ClientPortalAccess').then(m => ({ default: m.ClientPortalAccess })))

// In-House & Accounts
const Revenue = lazy(() => import('./features/inhouse_care/pages/Revenue').then(m => ({ default: m.Revenue })))
const Vitals = lazy(() => import('./features/inhouse_care/pages/Vitals').then(m => ({ default: m.Vitals })))
const Cashbox = lazy(() => import('./features/accounts/pages/Cashbox').then(m => ({ default: m.Cashbox })))
const CashboxPending = lazy(() => import('./features/accounts/pages/CashboxPending').then(m => ({ default: m.CashboxPending })))
const Income = lazy(() => import('./features/accounts/pages/Income').then(m => ({ default: m.Income })))
const Expense = lazy(() => import('./features/accounts/pages/Expense').then(m => ({ default: m.Expense })))
const InHouseExpense = lazy(() => import('./features/accounts/pages/InHouseExpense').then(m => ({ default: m.InHouseExpense })))

// HR, CMS, Tasks, Profile
const HRDashboard = lazy(() => import('./features/hr/pages/HRDashboard').then(m => ({ default: m.HRDashboard })))
const StaffManagement = lazy(() => import('./features/hr/pages/StaffManagement').then(m => ({ default: m.StaffManagement })))
const StaffPrivilege = lazy(() => import('./features/hr/pages/StaffPrivilege').then(m => ({ default: m.StaffPrivilege })))
const StaffMenuPrivilege = lazy(() => import('./features/hr/pages/StaffMenuPrivilege').then(m => ({ default: m.StaffMenuPrivilege })))
const RolesPermissions = lazy(() => import('./features/hr/pages/RolesPermissions').then(m => ({ default: m.RolesPermissions })))
const FieldDuty = lazy(() => import('./features/hr/pages/FieldDuty').then(m => ({ default: m.FieldDuty })))
const LeaveManagement = lazy(() => import('./features/hr/pages/LeaveManagement').then(m => ({ default: m.LeaveManagement })))
const ShiftRoster = lazy(() => import('./features/hr/pages/ShiftRoster').then(m => ({ default: m.ShiftRoster })))
const DocumentTracker = lazy(() => import('./features/hr/pages/DocumentTracker').then(m => ({ default: m.DocumentTracker })))
const TrainingCompliance = lazy(() => import('./features/hr/pages/TrainingCompliance').then(m => ({ default: m.TrainingCompliance })))
const LabourManagement = lazy(() => import('./features/hr/pages/LabourManagement').then(m => ({ default: m.LabourManagement })))
const Attendance = lazy(() => import('./features/hr/pages/Attendance').then(m => ({ default: m.Attendance })))
const Payroll = lazy(() => import('./features/hr/pages/Payroll').then(m => ({ default: m.Payroll })))
const HRReports = lazy(() => import('./features/hr/pages/HRReports').then(m => ({ default: m.HRReports })))
const JobEnquiry = lazy(() => import('./features/hr/pages/JobEnquiry').then(m => ({ default: m.JobEnquiry })))
const HolidayMapping = lazy(() => import('./features/hr/pages/HolidayMapping').then(m => ({ default: m.HolidayMapping })))
const Blogs = lazy(() => import('./features/cms/pages/Blogs').then(m => ({ default: m.Blogs })))
const FAQPage = lazy(() => import('./features/cms/pages/FAQ').then(m => ({ default: m.FAQPage })))
const Events = lazy(() => import('./features/cms/pages/Events').then(m => ({ default: m.Events })))
const Notifications = lazy(() => import('./features/profile/pages/Notifications').then(m => ({ default: m.Notifications })))
const AssignDailyTask = lazy(() => import('./features/task_log/pages/AssignDailyTask').then(m => ({ default: m.AssignDailyTask })))
const AssignScheduleTask = lazy(() => import('./features/task_log/pages/AssignScheduleTask').then(m => ({ default: m.AssignScheduleTask })))
const DailyTaskApproval = lazy(() => import('./features/task_log/pages/DailyTaskApproval').then(m => ({ default: m.DailyTaskApproval })))
const ScheduleTaskApproval = lazy(() => import('./features/task_log/pages/ScheduleTaskApproval').then(m => ({ default: m.ScheduleTaskApproval })))
const MyProfile = lazy(() => import('./features/profile/pages/MyProfile').then(m => ({ default: m.MyProfile })))
const MyTasks = lazy(() => import('./features/profile/pages/MyTasks').then(m => ({ default: m.MyTasks })))
const MyLeave = lazy(() => import('./features/profile/pages/MyLeave').then(m => ({ default: m.MyLeave })))
const MyAttendance = lazy(() => import('./features/profile/pages/MyAttendance').then(m => ({ default: m.MyAttendance })))
const AutomationDashboard = lazy(() => import('./features/automation/pages/AutomationDashboard').then(m => ({ default: m.AutomationDashboard })))
const EnterpriseIntelligence = lazy(() => import('./features/automation/pages/EnterpriseIntelligence').then(m => ({ default: m.EnterpriseIntelligence })))
const RuleBuilder = lazy(() => import('./features/automation/pages/RuleBuilder').then(m => ({ default: m.RuleBuilder })))
const WorkflowTimeline = lazy(() => import('./features/workflow/pages/WorkflowTimeline').then(m => ({ default: m.WorkflowTimeline })))

// CRM New Modules
const EnquiryDeskDashboard = lazy(() => import('./features/crm/pages/EnquiryDeskDashboard').then(m => ({ default: m.EnquiryDeskDashboard })))
const ActiveEnquiries = lazy(() => import('./features/crm/pages/ActiveEnquiries').then(m => ({ default: m.ActiveEnquiries })))
const AdmissionTracking = lazy(() => import('./features/crm/pages/AdmissionTracking').then(m => ({ default: m.AdmissionTracking })))
const CustomerCare = lazy(() => import('./features/crm/pages/CustomerCare').then(m => ({ default: m.CustomerCare })))
const Feedback = lazy(() => import('./features/crm/pages/Feedback').then(m => ({ default: m.Feedback })))
const AdmissionForms = lazy(() => import('./features/crm/pages/AdmissionForms').then(m => ({ default: m.AdmissionForms })))

// Healthcare New Modules
const CriticalPatients = lazy(() => import('./features/healthcare/pages/CriticalPatients').then(m => ({ default: m.CriticalPatients })))
const PatientDashboard = lazy(() => import('./features/healthcare/pages/PatientDashboard').then(m => ({ default: m.PatientDashboard })))
const MedicationManagement = lazy(() => import('./features/healthcare/pages/MedicationManagement').then(m => ({ default: m.MedicationManagement })))
const MedicineRequests = lazy(() => import('./features/healthcare/pages/MedicineRequests').then(m => ({ default: m.MedicineRequests })))
const MedicineIssueLog = lazy(() => import('./features/healthcare/pages/MedicineIssueLog').then(m => ({ default: m.MedicineIssueLog })))
const MedicationSchedule = lazy(() => import('./features/healthcare/pages/MedicationSchedule').then(m => ({ default: m.MedicationSchedule })))
const NutritionDiet = lazy(() => import('./features/healthcare/pages/NutritionDiet').then(m => ({ default: m.NutritionDiet })))
const ADL = lazy(() => import('./features/healthcare/pages/ADL').then(m => ({ default: m.ADLDailyLiving })))
const MedicalMonitor = lazy(() => import('./features/medical/pages/MedicalMonitor').then(m => ({ default: m.MedicalMonitor })))

// Operations New Modules
const FoodPreparation = lazy(() => import('./features/operations/pages/FoodPreparation').then(m => ({ default: m.FoodPreparation })))
const NutritionPlanning = lazy(() => import('./features/operations/pages/NutritionPlanning').then(m => ({ default: m.NutritionPlanning })))
const LaundryManagement = lazy(() => import('./features/operations/pages/LaundryManagement').then(m => ({ default: m.LaundryManagement })))
const Maintenance = lazy(() => import('./features/operations/pages/Maintenance').then(m => ({ default: m.Maintenance })))
const WasteManagement = lazy(() => import('./features/operations/pages/WasteManagement').then(m => ({ default: m.WasteManagement })))

// Inventory New Modules
const LowStockAlerts = lazy(() => import('./features/inventory/pages/LowStockAlerts').then(m => ({ default: m.LowStockAlerts })))
const ProductsRation = lazy(() => import('./features/inventory/pages/ProductsRation').then(m => ({ default: m.RationProducts })))
const ProductsStationary = lazy(() => import('./features/inventory/pages/ProductsStationary').then(m => ({ default: m.StationaryProducts })))
const ProductsElectrical = lazy(() => import('./features/inventory/pages/ProductsElectrical').then(m => ({ default: m.ElectricalPlumbingProducts })))
const ProductsAssets = lazy(() => import('./features/inventory/pages/ProductsAssets').then(m => ({ default: m.AssetProducts })))
const Stock = lazy(() => import('./features/inventory/pages/Stock').then(m => ({ default: m.StockManagement })))
const PurchaseOrders = lazy(() => import('./features/inventory/pages/PurchaseOrders').then(m => ({ default: m.PurchaseOrders })))
const StockMovementHistory = lazy(() => import('./features/inventory/pages/StockMovementHistory').then(m => ({ default: m.StockMovementHistory })))
const StockIssue = lazy(() => import('./features/inventory/pages/StockIssue').then(m => ({ default: m.StockIssue })))

// Finance New Modules
const PendingPayments = lazy(() => import('./features/finance/pages/PendingPayments').then(m => ({ default: m.PendingPayments })))
const AllowanceTracking = lazy(() => import('./features/finance/pages/AllowanceTracking').then(m => ({ default: m.AllowanceTracking })))
const Invoice = lazy(() => import('./features/finance/pages/Invoice').then(m => ({ default: m.Invoice })))
const Renewals = lazy(() => import('./features/finance/pages/Renewals').then(m => ({ default: m.Renewals })))

// Security New Modules
const GateManagement = lazy(() => import('./features/security/pages/GateManagement').then(m => ({ default: m.GateManagement })))
const VisitorManagement = lazy(() => import('./features/security/pages/VisitorManagement').then(m => ({ default: m.VisitorManagement })))
const StaffRegister = lazy(() => import('./features/security/pages/StaffRegister').then(m => ({ default: m.StaffRegister })))
const VehicleRegister = lazy(() => import('./features/security/pages/VehicleRegister').then(m => ({ default: m.VehicleRegister })))
const EntryLogs = lazy(() => import('./features/security/pages/EntryLogs').then(m => ({ default: m.EntryLogs })))
const SecurityReports = lazy(() => import('./features/security/pages/SecurityReports').then(m => ({ default: m.SecurityReports })))
const OTPLogs = lazy(() => import('./features/security/pages/OTPLogs').then(m => ({ default: m.OTPLogs })))

// Omnichannel New Modules
const UnifiedInbox = lazy(() => import('./features/omnichannel/pages/UnifiedInbox').then(m => ({ default: m.UnifiedInbox })))
const Email = lazy(() => import('./features/omnichannel/pages/Email').then(m => ({ default: m.Email })))
const WhatsApp = lazy(() => import('./features/omnichannel/pages/WhatsApp').then(m => ({ default: m.WhatsApp })))
const SMS = lazy(() => import('./features/omnichannel/pages/SMS').then(m => ({ default: m.SMS })))
const Calls = lazy(() => import('./features/omnichannel/pages/Calls').then(m => ({ default: m.Calls })))
const MissedCalls = lazy(() => import('./features/omnichannel/pages/MissedCalls').then(m => ({ default: m.MissedCalls })))

// Ambulance Services
const AmbulanceBookings = lazy(() => import('./features/ambulance/pages/AmbulanceBookings').then(m => ({ default: m.AmbulanceBookings })))
const DispatchManagement = lazy(() => import('./features/ambulance/pages/DispatchManagement').then(m => ({ default: m.DispatchManagement })))
const VehicleFleet = lazy(() => import('./features/ambulance/pages/VehicleFleet').then(m => ({ default: m.VehicleFleet })))
const AmbulanceStaffAssignment = lazy(() => import('./features/ambulance/pages/AmbulanceStaffAssignment').then(m => ({ default: m.AmbulanceStaffAssignment })))
const TripSheets = lazy(() => import('./features/ambulance/pages/TripSheets').then(m => ({ default: m.TripSheets })))
const AmbulanceMaintenance = lazy(() => import('./features/ambulance/pages/AmbulanceMaintenance').then(m => ({ default: m.AmbulanceMaintenance })))
const AmbulanceBilling = lazy(() => import('./features/ambulance/pages/AmbulanceBilling').then(m => ({ default: m.AmbulanceBilling })))
const EmergencyCallLogs = lazy(() => import('./features/ambulance/pages/EmergencyCallLogs').then(m => ({ default: m.EmergencyCallLogs })))

// App Routing
function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<GlobalSpinner />}>
            <Routes>
              {/* Public Route */}
              <Route path="/auth/login" element={<Login />} />

              {/* Protected Routes Wrapper */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />

                  <Route path="dashboard" element={
                    <Suspense fallback={<SkeletonLoader />}><Dashboard /></Suspense>
                  } />
                  <Route path="reports/dashboard" element={
                    <Suspense fallback={<SkeletonLoader />}><ReportsDashboard /></Suspense>
                  } />
                  <Route path="reports/generate" element={
                    <Suspense fallback={<SkeletonLoader />}><ReportsDashboard /></Suspense>
                  } />
                  <Route path=":org/dashboard" element={
                    <Suspense fallback={<SkeletonLoader />}><OrganizationDashboard /></Suspense>
                  } />
                  <Route path="finance/dashboard" element={
                    <Suspense fallback={<SkeletonLoader />}><FinanceManagerDashboard /></Suspense>
                  } />
                  <Route path="uec/elder-care-dashboard" element={
                    <Suspense fallback={<SkeletonLoader />}><ElderCareAdminDashboard /></Suspense>
                  } />
                  <Route path="healthcare/medical-monitor-dashboard" element={
                    <Suspense fallback={<SkeletonLoader />}><MedicalMonitorDashboard /></Suspense>
                  } />
                  <Route path="ambulance/emergency-dashboard" element={
                    <Suspense fallback={<SkeletonLoader />}><EmergencyCallDashboard /></Suspense>
                  } />
                  <Route path="master/dashboard" element={<Suspense fallback={<SkeletonLoader />}><MasterDataManagerDashboard /></Suspense>} />
                  <Route path="hr/manager-dashboard" element={<Suspense fallback={<SkeletonLoader />}><HRManagerDashboard /></Suspense>} />
                  <Route path="security/dashboard" element={<Suspense fallback={<SkeletonLoader />}><SecuritySupervisorDashboard /></Suspense>} />
                  <Route path="cms/dashboard" element={<Suspense fallback={<SkeletonLoader />}><CMSManagerDashboard /></Suspense>} />
                  <Route path="admin-files/dashboard" element={<Suspense fallback={<SkeletonLoader />}><AdminFilesManagerDashboard /></Suspense>} />
                  <Route path="task-user/dashboard" element={<Suspense fallback={<SkeletonLoader />}><ProfileTaskDashboard /></Suspense>} />
                  <Route path="inhouse-care/dashboard" element={<Suspense fallback={<SkeletonLoader />}><InHouseCareManagerDashboard /></Suspense>} />
                  <Route path="operations/dashboard" element={<Suspense fallback={<SkeletonLoader />}><ElderOperationsManagerDashboard /></Suspense>} />
                  <Route path="inventory/elder-dashboard" element={<Suspense fallback={<SkeletonLoader />}><ElderInventoryManagerDashboard /></Suspense>} />
                  <Route path="task-log/dashboard" element={<Suspense fallback={<SkeletonLoader />}><TaskLogCoordinatorDashboard /></Suspense>} />
                  <Route path="finance/elder-dashboard" element={<Suspense fallback={<SkeletonLoader />}><ElderFinanceManagerDashboard /></Suspense>} />
                  <Route path="healthcare/patient-care-dashboard" element={<Suspense fallback={<SkeletonLoader />}><PatientCareManagerDashboard /></Suspense>} />
                  <Route path="allocation/dashboard" element={<Suspense fallback={<SkeletonLoader />}><CareAllocationManagerDashboard /></Suspense>} />
                  <Route path="inventory/medical-dashboard" element={<Suspense fallback={<SkeletonLoader />}><MedicalInventoryManagerDashboard /></Suspense>} />
                  <Route path="ambulance/booking-dashboard" element={<Suspense fallback={<SkeletonLoader />}><AmbulanceBookingCoordinatorDashboard /></Suspense>} />
                  <Route path="ambulance/dispatch-dashboard" element={<Suspense fallback={<SkeletonLoader />}><DispatchManagerDashboard /></Suspense>} />
                  <Route path="ambulance/fleet-dashboard" element={<Suspense fallback={<SkeletonLoader />}><FleetManagerDashboard /></Suspense>} />
                  <Route path="ambulance/billing-dashboard" element={<Suspense fallback={<SkeletonLoader />}><AmbulanceBillingManagerDashboard /></Suspense>} />
                  <Route path="crm/follow-up-dashboard" element={<Suspense fallback={<SkeletonLoader />}><FollowUpCoordinatorDashboard /></Suspense>} />
                  <Route path="customer-care/dashboard" element={<Suspense fallback={<SkeletonLoader />}><CustomerRelationsManagerDashboard /></Suspense>} />
                  <Route path="omnichannel/dashboard" element={<Suspense fallback={<SkeletonLoader />}><OmnichannelCoordinatorDashboard /></Suspense>} />
                  <Route path="crm/admissions-dashboard" element={<Suspense fallback={<SkeletonLoader />}><AdmissionsCoordinatorDashboard /></Suspense>} />
                  <Route path="settings" element={
                    <Suspense fallback={<SkeletonLoader />}><Settings /></Suspense>
                  } />
                  <Route path="super-admin/users" element={
                    <Suspense fallback={<SkeletonLoader />}><UserManagement /></Suspense>
                  } />

                  {/* Master Module */}
                  <Route path="master/city" element={<Suspense fallback={<SkeletonLoader />}><CityMaster /></Suspense>} />
                  <Route path="master/unit" element={<Suspense fallback={<SkeletonLoader />}><UnitMaster /></Suspense>} />
                  <Route path="master/admin-files" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="uec/admin-files" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="admin-files" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="admin-files/uncf-documents" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="admin-files/uec-documents" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="admin-files/staff-files" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="admin-files/client-files" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="admin-files/finance-files" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="admin-files/uec-licence-files" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="admin-files/record-books" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="admin-files/nursing-files" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="admin-files/watchman-files" element={<Suspense fallback={<SkeletonLoader />}><AdminFileRegister /></Suspense>} />
                  <Route path="master/client-services" element={<Suspense fallback={<SkeletonLoader />}><ClientServicesMaster /></Suspense>} />
                  <Route path="master/department" element={<Suspense fallback={<SkeletonLoader />}><DepartmentMaster /></Suspense>} />
                  <Route path="master/designation" element={<Suspense fallback={<SkeletonLoader />}><DesignationMaster /></Suspense>} />

                  {/* Automation Module */}
                  <Route path="workflow/timeline" element={<Suspense fallback={<SkeletonLoader />}><WorkflowTimeline /></Suspense>} />
                  <Route path="automation/dashboard" element={<Suspense fallback={<SkeletonLoader />}><AutomationDashboard /></Suspense>} />
                  <Route path="automation/intelligence" element={<Suspense fallback={<SkeletonLoader />}><EnterpriseIntelligence /></Suspense>} />
                  <Route path="automation/rules" element={<Suspense fallback={<SkeletonLoader />}><RuleBuilder /></Suspense>} />
                  <Route path="master/labour-services" element={<Suspense fallback={<SkeletonLoader />}><LabourServicesMaster /></Suspense>} />
                  <Route path="master/payment-category" element={<Suspense fallback={<SkeletonLoader />}><PaymentCategoryMaster /></Suspense>} />
                  <Route path="master/vendor" element={<Suspense fallback={<SkeletonLoader />}><VendorMaster /></Suspense>} />
                  <Route path="master/room" element={<Suspense fallback={<SkeletonLoader />}><RoomManagementMaster /></Suspense>} />

                  {/* Enquiry Module */}
                  <Route path="enquiry/follow-up" element={<Suspense fallback={<SkeletonLoader />}><EnquiryFollowUp /></Suspense>} />
                  <Route path="enquiry/follow-up/:id" element={<Suspense fallback={<SkeletonLoader />}><FollowUpView /></Suspense>} />
                  <Route path="enquiry/new" element={<Suspense fallback={<SkeletonLoader />}><NewEnquiry /></Suspense>} />
                  <Route path="enquiry/clients" element={<Suspense fallback={<SkeletonLoader />}><AllClients /></Suspense>} />
                  <Route path="crm/enquiry-follow-up" element={<Suspense fallback={<SkeletonLoader />}><EnquiryFollowUp /></Suspense>} />
                  <Route path="crm/enquiry-follow-up/:id" element={<Suspense fallback={<SkeletonLoader />}><FollowUpView /></Suspense>} />
                  <Route path="crm/new-enquiry" element={<Suspense fallback={<SkeletonLoader />}><NewEnquiry /></Suspense>} />
                  <Route path="crm/clients" element={<Suspense fallback={<SkeletonLoader />}><AllClients /></Suspense>} />

                  {/* Allocation Module */}
                  <Route path="allocation/home-care" element={<Suspense fallback={<SkeletonLoader />}><HomeCare /></Suspense>} />
                  <Route path="allocation/clinical-care" element={<Suspense fallback={<SkeletonLoader />}><ClinicalCare /></Suspense>} />
                  <Route path="allocation/inhouse-care" element={<Suspense fallback={<SkeletonLoader />}><AllocInHouseCare /></Suspense>} />
                  <Route path="allocation/others" element={<Suspense fallback={<SkeletonLoader />}><OthersAllocation /></Suspense>} />

                  {/* Business Desk */}
                  <Route path="business/welcome-call" element={<Suspense fallback={<SkeletonLoader />}><WelcomeCall /></Suspense>} />

                  {/* Customer Care */}
                  <Route path="customer-care/pending-feedback" element={<Suspense fallback={<SkeletonLoader />}><PendingFeedback /></Suspense>} />
                  <Route path="customer-care/complaints" element={<Suspense fallback={<SkeletonLoader />}><Complaints /></Suspense>} />
                  <Route path="customer-care/service-history" element={<Suspense fallback={<SkeletonLoader />}><ServiceHistory /></Suspense>} />
                  <Route path="client-portal/access" element={<Suspense fallback={<SkeletonLoader />}><ClientPortalAccess /></Suspense>} />
                  <Route path="client-portal/dashboard" element={<Suspense fallback={<SkeletonLoader />}><ClientPortalDashboard /></Suspense>} />
                  <Route path="client-portal/profile" element={<Suspense fallback={<SkeletonLoader />}><ClientPortalProfile /></Suspense>} />
                  <Route path="client-portal/services" element={<Suspense fallback={<SkeletonLoader />}><ClientPortalServices /></Suspense>} />
                  <Route path="client-portal/medicines" element={<Suspense fallback={<SkeletonLoader />}><ClientPortalMedicines /></Suspense>} />
                  <Route path="client-portal/complaints" element={<Suspense fallback={<SkeletonLoader />}><ClientPortalComplaints /></Suspense>} />
                  <Route path="client-portal/notifications" element={<Suspense fallback={<SkeletonLoader />}><ClientPortalNotifications /></Suspense>} />

                  {/* In-House Care */}
                  <Route path="inhouse-care/revenue" element={<Suspense fallback={<SkeletonLoader />}><Revenue /></Suspense>} />
                  <Route path="inhouse-care/vitals" element={<Suspense fallback={<SkeletonLoader />}><Vitals /></Suspense>} />
                  <Route path="healthcare/vitals" element={<Suspense fallback={<SkeletonLoader />}><Vitals /></Suspense>} />

                  {/* Accounts Module */}
                  <Route path="accounts/cashbox" element={<Suspense fallback={<SkeletonLoader />}><Cashbox /></Suspense>} />
                  <Route path="accounts/pending" element={<Suspense fallback={<SkeletonLoader />}><CashboxPending /></Suspense>} />
                  <Route path="accounts/income" element={<Suspense fallback={<SkeletonLoader />}><Income /></Suspense>} />
                  <Route path="accounts/expense" element={<Suspense fallback={<SkeletonLoader />}><Expense /></Suspense>} />
                  <Route path="accounts/inhouse-expense" element={<Suspense fallback={<SkeletonLoader />}><InHouseExpense /></Suspense>} />
                  <Route path="finance/cashbox" element={<Suspense fallback={<SkeletonLoader />}><Cashbox /></Suspense>} />
                  <Route path="finance/income" element={<Suspense fallback={<SkeletonLoader />}><Income /></Suspense>} />
                  <Route path="finance/expense" element={<Suspense fallback={<SkeletonLoader />}><Expense /></Suspense>} />
                  <Route path="finance/inhouse-expense" element={<Suspense fallback={<SkeletonLoader />}><InHouseExpense /></Suspense>} />

                  {/* HR Module */}
                  <Route path="hr/dashboard" element={<Suspense fallback={<SkeletonLoader />}><HRDashboard /></Suspense>} />
                  <Route path="hr/staff" element={<Suspense fallback={<SkeletonLoader />}><StaffManagement /></Suspense>} />
                  <Route path="hr/staff-privilege" element={<Suspense fallback={<SkeletonLoader />}><StaffPrivilege /></Suspense>} />
                  <Route path="hr/staff-privilege/:id/edit" element={<Suspense fallback={<SkeletonLoader />}><StaffMenuPrivilege /></Suspense>} />
                  <Route path="hr/rbac" element={<Suspense fallback={<SkeletonLoader />}><RolesPermissions /></Suspense>} />
                  <Route path="hr/field-duty" element={<Suspense fallback={<SkeletonLoader />}><FieldDuty /></Suspense>} />
                  <Route path="hr/leave" element={<Suspense fallback={<SkeletonLoader />}><LeaveManagement /></Suspense>} />
                  <Route path="hr/roster" element={<Suspense fallback={<SkeletonLoader />}><ShiftRoster /></Suspense>} />
                  <Route path="hr/documents" element={<Suspense fallback={<SkeletonLoader />}><DocumentTracker /></Suspense>} />
                  <Route path="hr/training" element={<Suspense fallback={<SkeletonLoader />}><TrainingCompliance /></Suspense>} />
                  <Route path="hr/labour" element={<Suspense fallback={<SkeletonLoader />}><LabourManagement /></Suspense>} />
                  <Route path="hr/recruitment" element={<Suspense fallback={<SkeletonLoader />}><JobEnquiry /></Suspense>} />
                  <Route path="hr/attendance" element={<Suspense fallback={<SkeletonLoader />}><Attendance /></Suspense>} />
                  <Route path="hr/holiday" element={<Suspense fallback={<SkeletonLoader />}><HolidayMapping /></Suspense>} />
                  <Route path="hr/payroll" element={<Suspense fallback={<SkeletonLoader />}><Payroll /></Suspense>} />
                  <Route path="hr/reports" element={<Suspense fallback={<SkeletonLoader />}><HRReports /></Suspense>} />

                  {/* CMS Module */}
                  <Route path="cms/blogs" element={<Suspense fallback={<SkeletonLoader />}><Blogs /></Suspense>} />
                  <Route path="cms/faq" element={<Suspense fallback={<SkeletonLoader />}><FAQPage /></Suspense>} />
                  <Route path="cms/events" element={<Suspense fallback={<SkeletonLoader />}><Events /></Suspense>} />

                  {/* Profile Module */}
                  <Route path="profile/notifications" element={<Suspense fallback={<SkeletonLoader />}><Notifications /></Suspense>} />
                  <Route path="profile/me" element={<Suspense fallback={<SkeletonLoader />}><MyProfile /></Suspense>} />
                  <Route path="profile/tasks" element={<Suspense fallback={<SkeletonLoader />}><MyTasks /></Suspense>} />
                  <Route path="profile/leave" element={<Suspense fallback={<SkeletonLoader />}><MyLeave /></Suspense>} />
                  <Route path="profile/attendance" element={<Suspense fallback={<SkeletonLoader />}><MyAttendance /></Suspense>} />

                  {/* Task Log Module */}
                  <Route path="task-log/assign-daily" element={<Suspense fallback={<SkeletonLoader />}><AssignDailyTask /></Suspense>} />
                  <Route path="task-log/assign-schedule" element={<Suspense fallback={<SkeletonLoader />}><AssignScheduleTask /></Suspense>} />
                  <Route path="task-log/daily-approval" element={<Suspense fallback={<SkeletonLoader />}><DailyTaskApproval /></Suspense>} />
                  <Route path="task-log/schedule-approval" element={<Suspense fallback={<SkeletonLoader />}><ScheduleTaskApproval /></Suspense>} />

                  {/* CRM New Routes */}
                  <Route path="crm/dashboard" element={<Suspense fallback={<SkeletonLoader />}><EnquiryDeskDashboard /></Suspense>} />
                  <Route path="crm/active-enquiries" element={<Suspense fallback={<SkeletonLoader />}><ActiveEnquiries /></Suspense>} />
                  <Route path="crm/admission-tracking" element={<Suspense fallback={<SkeletonLoader />}><AdmissionTracking /></Suspense>} />
                  <Route path="crm/customer-care" element={<Suspense fallback={<SkeletonLoader />}><CustomerCare /></Suspense>} />
                  <Route path="crm/feedback" element={<Suspense fallback={<SkeletonLoader />}><Feedback /></Suspense>} />
                  <Route path="crm/admission-forms" element={<Suspense fallback={<SkeletonLoader />}><AdmissionForms /></Suspense>} />

                  {/* Healthcare New Routes */}
                  <Route path="healthcare/critical-patients" element={<Suspense fallback={<SkeletonLoader />}><CriticalPatients /></Suspense>} />
                  <Route path="healthcare/patient-dashboard" element={<Suspense fallback={<SkeletonLoader />}><PatientDashboard /></Suspense>} />
                  <Route path="healthcare/medication-management" element={<Suspense fallback={<SkeletonLoader />}><MedicationManagement /></Suspense>} />
                  <Route path="healthcare/medicine-requests" element={<Suspense fallback={<SkeletonLoader />}><MedicineRequests /></Suspense>} />
                  <Route path="healthcare/medicine-issue-log" element={<Suspense fallback={<SkeletonLoader />}><MedicineIssueLog /></Suspense>} />
                  <Route path="healthcare/medication-schedule" element={<Suspense fallback={<SkeletonLoader />}><MedicationSchedule /></Suspense>} />
                  <Route path="healthcare/nutrition-diet" element={<Suspense fallback={<SkeletonLoader />}><NutritionDiet /></Suspense>} />
                  <Route path="healthcare/adl" element={<Suspense fallback={<SkeletonLoader />}><ADL /></Suspense>} />
                  <Route path="healthcare/medical-monitor" element={<Suspense fallback={<SkeletonLoader />}><MedicalMonitor /></Suspense>} />

                  {/* Operations New Routes */}
                  <Route path="operations/food-preparation" element={<Suspense fallback={<SkeletonLoader />}><FoodPreparation /></Suspense>} />
                  <Route path="operations/nutrition-planning" element={<Suspense fallback={<SkeletonLoader />}><NutritionPlanning /></Suspense>} />
                  <Route path="operations/laundry-management" element={<Suspense fallback={<SkeletonLoader />}><LaundryManagement /></Suspense>} />
                  <Route path="operations/maintenance" element={<Suspense fallback={<SkeletonLoader />}><Maintenance /></Suspense>} />
                  <Route path="operations/waste-management" element={<Suspense fallback={<SkeletonLoader />}><WasteManagement /></Suspense>} />

                  {/* Inventory New Routes */}
                  <Route path="inventory/low-stock-alerts" element={<Suspense fallback={<SkeletonLoader />}><LowStockAlerts /></Suspense>} />
                  <Route path="inventory/products/ration" element={<Suspense fallback={<SkeletonLoader />}><ProductsRation /></Suspense>} />
                  <Route path="inventory/products/stationary" element={<Suspense fallback={<SkeletonLoader />}><ProductsStationary /></Suspense>} />
                  <Route path="inventory/products/electrical-plumbing" element={<Suspense fallback={<SkeletonLoader />}><ProductsElectrical /></Suspense>} />
                  <Route path="inventory/products/assets" element={<Suspense fallback={<SkeletonLoader />}><ProductsAssets /></Suspense>} />
                  <Route path="inventory/stock" element={<Suspense fallback={<SkeletonLoader />}><Stock /></Suspense>} />
                  <Route path="inventory/stock-issue" element={<Suspense fallback={<SkeletonLoader />}><StockIssue /></Suspense>} />
                  <Route path="inventory/stock-movements" element={<Suspense fallback={<SkeletonLoader />}><StockMovementHistory /></Suspense>} />
                  <Route path="inventory/purchase-orders" element={<Suspense fallback={<SkeletonLoader />}><PurchaseOrders /></Suspense>} />
                  <Route path="inventory/vendors" element={<Suspense fallback={<SkeletonLoader />}><VendorMaster /></Suspense>} />

                  {/* Finance New Routes */}
                  <Route path="finance/pending-payments" element={<Suspense fallback={<SkeletonLoader />}><PendingPayments /></Suspense>} />
                  <Route path="finance/allowance-tracking" element={<Suspense fallback={<SkeletonLoader />}><AllowanceTracking /></Suspense>} />
                  <Route path="finance/invoice" element={<Suspense fallback={<SkeletonLoader />}><Invoice /></Suspense>} />
                  <Route path="finance/renewals" element={<Suspense fallback={<SkeletonLoader />}><Renewals /></Suspense>} />

                  {/* Security New Routes */}
                  <Route path="security/gate-management" element={<Suspense fallback={<SkeletonLoader />}><GateManagement /></Suspense>} />
                  <Route path="security/visitor-management" element={<Suspense fallback={<SkeletonLoader />}><VisitorManagement /></Suspense>} />
                  <Route path="security/staff-register" element={<Suspense fallback={<SkeletonLoader />}><StaffRegister /></Suspense>} />
                  <Route path="security/vehicle-register" element={<Suspense fallback={<SkeletonLoader />}><VehicleRegister /></Suspense>} />
                  <Route path="security/entry-logs" element={<Suspense fallback={<SkeletonLoader />}><EntryLogs /></Suspense>} />
                  <Route path="security/reports" element={<Suspense fallback={<SkeletonLoader />}><SecurityReports /></Suspense>} />
                  <Route path="security/otp-logs" element={<Suspense fallback={<SkeletonLoader />}><OTPLogs /></Suspense>} />

                  {/* Omnichannel New Routes */}
                  <Route path="omnichannel/conversations" element={<Suspense fallback={<SkeletonLoader />}><UnifiedInbox /></Suspense>} />
                  <Route path="omnichannel/email" element={<Suspense fallback={<SkeletonLoader />}><Email /></Suspense>} />
                  <Route path="omnichannel/whatsapp" element={<Suspense fallback={<SkeletonLoader />}><WhatsApp /></Suspense>} />
                  <Route path="omnichannel/sms" element={<Suspense fallback={<SkeletonLoader />}><SMS /></Suspense>} />
                  <Route path="omnichannel/missed-calls" element={<Suspense fallback={<SkeletonLoader />}><MissedCalls /></Suspense>} />
                  <Route path="omnichannel/calls" element={<Suspense fallback={<SkeletonLoader />}><Calls /></Suspense>} />

                  {/* Ambulance Services Routes */}
                  <Route path="ambulance/bookings" element={<Suspense fallback={<SkeletonLoader />}><AmbulanceBookings /></Suspense>} />
                  <Route path="ambulance/dispatch" element={<Suspense fallback={<SkeletonLoader />}><DispatchManagement /></Suspense>} />
                  <Route path="ambulance/fleet" element={<Suspense fallback={<SkeletonLoader />}><VehicleFleet /></Suspense>} />
                  <Route path="ambulance/staff-assignment" element={<Suspense fallback={<SkeletonLoader />}><AmbulanceStaffAssignment /></Suspense>} />
                  <Route path="ambulance/trip-sheets" element={<Suspense fallback={<SkeletonLoader />}><TripSheets /></Suspense>} />
                  <Route path="ambulance/maintenance" element={<Suspense fallback={<SkeletonLoader />}><AmbulanceMaintenance /></Suspense>} />
                  <Route path="ambulance/billing" element={<Suspense fallback={<SkeletonLoader />}><AmbulanceBilling /></Suspense>} />
                  <Route path="ambulance/call-logs" element={<Suspense fallback={<SkeletonLoader />}><EmergencyCallLogs /></Suspense>} />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
