export type UserRole = "ADMIN" | "AGENT" | "CLIENT" | string;
export type Language = "en" | "fr";
export type SortDir = "asc" | "desc";
export type ClientType = "NORMAL" | "POTENTIAL";
export type ReportExportStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface PageParams {
  skip?: number;
  limit?: number;
  search?: string;
}

export interface PageResponse<T> {
  data: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApiSuccess {
  success: true;
  message?: string;
}

export interface AuthUser {
  id: string;
  fullNames: string;
  phone: string;
  role: UserRole;
  language: Language;
  firstLoginCompleted: boolean;
  isActive?: boolean;
  createdAt?: string;
  adminId?: string;
  adminRoleId?: string;
  profileType?: UserRole;
  permissions?: string[];
  roleName?: string;
  profile?: AuthProfile;
}

export interface AuthTokenPayload {
  accessToken: string;
  expiresInSeconds: number;
  tokenType: "Bearer";
  user: AuthUser;
}

export interface AuthProfile {
  type?: UserRole;
  adminId?: string;
  roleId?: string;
  roleName?: string;
  permissions?: string[];
  agentId?: string;
  clientId?: string;
  address?: string;
  registeredDate?: string;
  subscriptionAmount?: string;
  clientType?: ClientType;
  currentMonthCollected?: string;
  totalAmountCollected?: string;
  collectionsCount?: number;
  uniqueClientsCollectedFrom?: number;
  [key: string]: unknown;
}

export interface AuthMeResponse {
  user: AuthUser;
  profile?: AuthProfile;
}

export interface OtpStartResponse extends ApiSuccess {
  developmentOtp?: string;
}

export interface OtpVerifyResponse {
  otpSessionId: string;
}

export interface UserSummary {
  id: string;
  fullNames: string;
  phone: string;
  role: UserRole;
  language: Language;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminClientListItem {
  clientId: string;
  userId: string;
  fullNames: string;
  phone: string;
  language?: Language;
  code?: string | null;
  address?: string | null;
  clientType?: ClientType | null;
  type?: ClientType | null;
  quartierId?: string | null;
  quartierName?: string | null;
  serineId?: string | null;
  serineName?: string | null;
  avenueId?: string | null;
  avenueName?: string | null;
  serviceTypeId?: string | null;
  serviceTypeName?: string | null;
  registeredDate: string;
  subscriptionAmount?: string | null;
  subscriptionAmountMinor?: number | null;
  dueMonths?: number;
  totalDue?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminClientDetail extends AdminClientListItem {
  language?: Language;
  daysSinceFirstDueDate?: number;
  totalAmountDue?: string;
  totalMonthsDue?: number;
  duePayments?: Array<{
    month: string;
    amount: string;
    dueDate: string;
    daysPassedSinceDue?: number;
  }>;
}

export interface AdminAgentListItem {
  agentId: string;
  userId: string;
  fullNames: string;
  phone: string;
  isActive: boolean;
  currentMonthCollected: string;
  totalAmountCollected?: string;
  collectionsCount?: number;
  uniqueClientsCollectedFrom?: number;
  createdAt?: string;
  assignedAvenues?: AssignedAvenue[];
}

export interface AdminAgentDetail extends AdminAgentListItem {
  language?: Language;
}

export interface AssignedAvenue {
  avenueId: string;
  avenueName: string;
  quartierId?: string | null;
  quartierName?: string | null;
  serineName?: string | null;
}

export type PaymentStatus = "DUE" | "CONFIRMED" | "PENDING" | "READY" | string;

export interface AdminPaymentListItem {
  id?: string;
  paymentId?: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  agentId?: string | null;
  agentName?: string | null;
  amount: string;
  months?: string[];
  month?: string;
  dueDate?: string;
  daysPassedSinceDue?: number;
  status?: PaymentStatus;
  paymentDate?: string;
  createdAt?: string;
  receiptId: string | null;
  receiptNumber: string | null;
  setByAdmin: boolean;
}

export interface AdminPaymentDetail extends AdminPaymentListItem {
  clientPhone?: string;
  receiptStatus?: "PENDING" | "READY";
}

export interface PaymentResponse {
  paymentId: string;
  receiptId: string | null;
  receiptNumber: string | null;
  receiptStatus: "PENDING" | "READY";
  amount: string;
  months: string[];
  paymentDate: string;
}

export interface DashboardResponse {
  timezone: string;
  year: number;
  kpis: {
    currentMonthRevenue?: {
      amount: string;
      contributingClients?: number;
      percentIncreaseVsLastMonth?: number;
      currentAmount?: string;
      previousAmount?: string;
    };
    totalPendingDue?: {
      amount: string;
      clients?: number;
    };
    totalClientsActive?: {
      count: number;
      previousCount?: number;
      percentIncreaseVsLastMonth?: number;
    };
    totalAgentsActive?: {
      count: number;
      previousCount?: number;
      percentIncreaseVsLastMonth?: number;
    };
    [key: string]: unknown;
  };
  graphs: {
    revenuePerMonth: Array<{
      month: string;
      amount: string;
      value?: number;
    }>;
  };
  tables: {
    topAgents: Array<{
      agentId: string;
      userId?: string;
      fullNames: string;
      phone?: string;
      amountCollected: string;
      collectionsCount?: number;
    }>;
  };
}

export interface ImportReport {
  totalRows: number;
  successCount: number;
  failedCount: number;
  failures: Array<{
    row: number;
    reason: string;
  }>;
}

export interface ReceiptVerification {
  valid: boolean;
  receiptId: string | null;
  receiptNumber: string | null;
  paymentId: string | null;
}

export interface ReceiptData {
  paymentId: string;
  receiptId: string | null;
  receiptNumber: string | null;
  clientName: string;
  clientPhone?: string;
  agentName?: string | null;
  months: string[];
  amount: string;
  paymentDate: string;
  verificationUrl?: string;
  qrCodeUrl?: string;
}

export interface CreateAdminUserPayload {
  fullNames: string;
  phone: string;
  language: Language;
  roleId?: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminRoleListParams = PageParams;

export interface CreateAdminRolePayload {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateAdminRolePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface AdminUserListItem {
  adminId: string;
  userId: string;
  fullNames: string;
  phone: string;
  language: Language;
  isActive: boolean;
  firstLoginCompleted: boolean;
  createdAt: string;
  role?: AdminRole | null;
}

export interface AdminUsersParams extends PageParams {
  isActive?: boolean;
}

export interface UpdateAdminUserPayload {
  fullNames?: string;
  language?: Language;
}

export interface UpdateAdminRoleAssignmentPayload {
  roleId: string;
}

export type CreateAgentPayload = CreateAdminUserPayload;

export interface UpdateAgentPayload {
  fullNames?: string;
  phone?: string;
  language?: Language;
  isActive?: boolean;
}

export interface CreateClientPayload extends CreateAdminUserPayload {
  code?: string;
  quartierId: string;
  serineId: string;
  avenueId: string;
  clientType: ClientType;
  serviceTypeId?: string;
  subscriptionAmount?: string;
  registeredDate?: string;
}

export interface UpdateClientPayload extends UpdateAgentPayload {
  code?: string;
  quartierId?: string;
  serineId?: string;
  avenueId?: string;
  clientType?: ClientType;
  serviceTypeId?: string;
  subscriptionAmount?: string;
  registeredDate?: string;
}

export interface UpdateStatusPayload {
  isActive: boolean;
}

export interface MarkPaymentCompletePayload {
  months: string[];
}

export interface AdminClientsParams extends PageParams {
  clientType?: ClientType;
  isActive?: boolean;
  is_due?: boolean;
  hasDue?: boolean;
  minDueMonths?: number;
  maxDueMonths?: number;
  registeredDateFrom?: string;
  registeredDateTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  sortBy?: string;
  sortDir?: SortDir;
}

export interface AdminAgentsParams extends PageParams {
  isActive?: boolean;
  createdAtFrom?: string;
  createdAtTo?: string;
  minCurrentMonthCollected?: string;
  maxCurrentMonthCollected?: string;
  sortBy?: string;
  sortDir?: SortDir;
}

export interface AdminPaymentsParams extends PageParams {
  clientId?: string;
  agentId?: string;
  is_due?: boolean;
  setByAdmin?: boolean;
  month?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: string;
  amountMax?: string;
  receiptReady?: boolean;
  sortBy?: string;
  sortDir?: SortDir;
}

export interface AdminClientPaymentsParams extends PageParams {
  month?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: PaymentStatus;
  sortDir?: SortDir;
}

export type AdminServiceTypesParams = PageParams;

export interface AdminLocationsParams extends PageParams {
  quartierId?: string;
  serineId?: string;
}

export interface AdminServiceType {
  id: string;
  name: string;
  subscriptionAmountMinor?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceTypePayload {
  name: string;
  subscriptionAmount: string;
}

export interface UpdateServiceTypePayload {
  name?: string;
  subscriptionAmount?: string;
}

export interface Quartier {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Serine {
  id: string;
  name: string;
  quartierId: string;
  quartierName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Avenue {
  id: string;
  name: string;
  serineId: string;
  serineName?: string | null;
  quartierId?: string | null;
  quartierName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuartierPayload {
  name: string;
}

export interface UpdateQuartierPayload {
  name?: string;
}

export interface CreateSerinePayload {
  quartierId: string;
  name: string;
}

export interface UpdateSerinePayload {
  quartierId?: string;
  name?: string;
}

export interface CreateAvenuePayload {
  serineId: string;
  name: string;
}

export interface UpdateAvenuePayload {
  serineId?: string;
  name?: string;
}

export interface CommissionConfig {
  ratePercent: number;
}

export interface UpdateCommissionConfigPayload {
  ratePercent: number;
}

export interface CommissionSummaryItem {
  agentId: string;
  fullNames: string;
  phone: string;
  totalCollected: string;
  commissionRatePercent: number;
  totalCommission: string;
  paymentsCount: number;
}

export interface CommissionDetailItem {
  paymentId: string;
  paymentDate: string;
  agentId: string;
  agentName: string;
  clientId: string;
  clientName: string;
  amount: string;
  commissionRatePercent: number;
  commissionAmount: string;
}

export interface CommissionSummaryParams extends PageParams {
  dateFrom?: string;
  dateTo?: string;
  agentId?: string;
}

export interface GenerateAvenueMonthlyReportPayload {
  month: string;
  avenueId: string;
}

export interface AvenueMonthlyReportJob {
  reportId: string;
  status: ReportExportStatus;
  progressPercent: number;
  createdAt: string;
}

export interface AvenueMonthlyReportStatus extends AvenueMonthlyReportJob {
  month: string;
  avenueId: string;
  quartierName?: string | null;
  avenueName?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
  fileReady: boolean;
}

export interface AssignAgentAvenuesPayload {
  avenueIds: string[];
}
