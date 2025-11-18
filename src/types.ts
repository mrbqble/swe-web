export interface LinkRequest {
  id: string;
  requester: string;
  email: string;
  organization: string;
  message: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  organization: string;
  date: string;
  amount: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  items: number;
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  customer: string;
  organization: string;
  subject: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'resolved';
  updated: string;
  orderNumber: string;
  issueType: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'sales';
  created: string;
}

export interface Activity {
  id: string;
  initials: string;
  content: string;
  time: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'sales';
  avatar?: string;
}
