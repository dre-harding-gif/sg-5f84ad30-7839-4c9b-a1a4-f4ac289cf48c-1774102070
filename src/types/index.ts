export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  postcode?: string;
  companyName?: string;
  portalAccess?: boolean;
  createdAt?: Date;
  totalJobs?: number;
  activeJobs?: number;
}

export interface Job {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName?: string;
  title: string;
  description?: string;
  address: string;
  postcode?: string;
  status: "lead" | "quoted" | "scheduled" | "in-progress" | "completed" | "on-hold";
  priority?: "low" | "medium" | "high" | "urgent";
  startDate?: Date;
  endDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  estimatedValue?: number;
  actualValue?: number;
  assignedTeam?: TeamMember[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  skills?: string[];
  availability: "available" | "on-job" | "off";
  currentJobId?: string;
}

export interface Lead {
  id: string;
  source: string;
  customerName: string;
  email: string;
  phone: string;
  address?: string;
  postcode?: string;
  projectType?: string;
  description?: string;
  estimatedValue?: number;
  status: "new" | "contacted" | "quoted" | "converted" | "lost";
  priority?: "low" | "medium" | "high";
  createdAt: Date;
  followUpDate?: Date;
  notes?: string;
}

export interface Material {
  id: string;
  jobId: string;
  name: string;
  quantity: number;
  unit: string;
  supplier?: string;
  cost?: number;
  ordered?: boolean;
  received?: boolean;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  jobId: string;
  supplier: string;
  items: Material[];
  totalAmount: number;
  dateOrdered: Date;
  expectedDelivery?: Date;
  status: "ordered" | "received" | "cancelled";
  invoiceNumber?: string;
}

export interface Document {
  id: string;
  jobId: string;
  name: string;
  type: "plan" | "specification" | "certificate" | "photo" | "invoice" | "other";
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  size?: number;
}

export interface TimeLog {
  id: string;
  jobId: string;
  teamMemberId: string;
  teamMemberName?: string;
  date: Date;
  hours: number;
  task?: string;
  notes?: string;
}

export interface CustomerPortalUser {
  id: string;
  customerId: string;
  email: string;
  hashedPassword: string;
  lastLogin?: Date;
  activeJobIds: string[];
}

export interface ProgressUpdate {
  id: string;
  jobId: string;
  date: Date;
  percentage: number;
  message: string;
  photos?: string[];
  createdBy: string;
}

export interface CustomerConcern {
  id: string;
  jobId: string;
  customerId: string;
  subject: string;
  description: string;
  createdAt: Date;
  status: "open" | "resolved";
  resolvedAt?: Date;
  response?: string;
}