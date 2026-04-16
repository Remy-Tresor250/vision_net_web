export interface MetricCard {
  id: string;
  label: string;
  value: string;
  caption: string;
  trend?: string;
  tone: "brand" | "danger" | "default";
}

export interface RevenuePoint {
  month: string;
  value: number;
  fill: string;
}

export interface Transaction {
  id: string;
  date: string;
  clientId?: string;
  clientName: string;
  agentName: string;
  billingCycle: string;
  amount: string;
  status: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  registeredDate: string;
  status: "Active" | "Inactive";
  subscription: string;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  registeredDate: string;
  status: "Active" | "Inactive";
  performance: string;
  clientsServed: number;
  region: string;
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  agentId: string;
  agentName: string;
  months: string;
  billingMonth: string;
  receiptId?: string;
  receiptNumber: string;
  date: string;
  amount: string;
  status: string;
  qrCodeUrl?: string;
  verificationUrl?: string;
}
