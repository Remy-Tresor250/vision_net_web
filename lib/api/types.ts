export type UserRole = "ADMIN" | "AGENT" | "CLIENT";
export type Language = "en" | "fr";
export type SortDir = "asc" | "desc";
export type ClientType = "NORMAL" | "POTENTIEL";

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
}

export interface AuthTokenPayload {
  accessToken: string;
  expiresInSeconds: number;
  tokenType: "Bearer";
  user: AuthUser;
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
  address: string;
  type: ClientType;
  registeredDate: string;
  subscriptionAmount: string;
  dueMonths: number;
  totalDue: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminClientDetail extends AdminClientListItem {
  language?: Language;
  daysSinceFirstDueDate?: number;
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
}

export interface AdminAgentDetail extends AdminAgentListItem {
  language?: Language;
}

export type PaymentStatus = "DUE" | "CONFIRMED" | "PENDING" | "READY" | string;

export interface AdminPaymentListItem {
  paymentId: string;
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
  kpis: Record<string, unknown>;
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
      fullNames: string;
      amount: string;
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
}

export type CreateAgentPayload = CreateAdminUserPayload;

export interface UpdateAgentPayload {
  fullNames?: string;
  phone?: string;
  language?: Language;
  isActive?: boolean;
}

export interface CreateClientPayload extends CreateAdminUserPayload {
  address: string;
  type: ClientType;
  subscriptionAmount: string;
  registeredDate?: string;
}

export interface UpdateClientPayload extends UpdateAgentPayload {
  address?: string;
  type?: ClientType;
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
  isActive?: boolean;
  type?: ClientType;
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
