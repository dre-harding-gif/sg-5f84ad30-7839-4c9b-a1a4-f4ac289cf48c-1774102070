export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  source: "checkatrade" | "direct" | "referral" | "other";
  createdAt: Date;
  portalAccess?: {
    username: string;
    lastLogin?: Date;
  };
}

export interface Job {
  id: string;
  jobNumber: string;
  customerId: string;
  customer?: Customer;
  title: string;
  description: string;
  address: string;
  postcode: string;
  status: "lead" | "quoted" | "scheduled" | "in-progress" | "completed" | "on-hold";
  priority: "low" | "medium" | "high" | "urgent";
  startDate?: Date;
  endDate?: Date;
  estimatedHours: number;
  actualHours: number;
  assignedTeam: string[];
  materials: Material[];
  purchaseOrders: PurchaseOrder[];
  documents: Document[];
  photos: Photo[];
  createdAt: Date;
  updatedAt: Date;
  warranty?: {
    years: number;
    documents: string[];
  };
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  supplier?: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  jobId: string;
  supplier: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  dateOrdered: Date;
  dateReceived?: Date;
  status: "ordered" | "received" | "cancelled";
}

export interface Document {
  id: string;
  name: string;
  type: "job-sheet" | "plan" | "specification" | "warranty" | "other";
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  stage: "before" | "during" | "after";
  uploadedAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
  skills: string[];
  availability: "available" | "on-job" | "off";
}

export interface TimeEntry {
  id: string;
  jobId: string;
  teamMemberId: string;
  date: Date;
  hours: number;
  description?: string;
  approved: boolean;
}

export interface JobProgress {
  jobId: string;
  percentage: number;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  lastUpdate: Date;
}

export interface CustomerConcern {
  id: string;
  jobId: string;
  customerId: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  createdAt: Date;
  resolvedAt?: Date;
  response?: string;
}