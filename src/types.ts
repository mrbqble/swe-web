// types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  organization: string;
  date: string;
  amount: string;
  status: string;
  items: number;
  backendData?: any;
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  customer: string;
  organization: string;
  subject: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  updated: string;
  orderNumber: string;
  issueType: string;
  backendData?: any;
}

export interface LinkRequest {
  id: string;
  requester: string;
  email: string;
  organization: string;
  message: string;
  date: string;
  status: string;
  backendData?: any;
}

export interface ChatSession {
  id: string;
  consumerName: string;
  salesRepName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  backendData?: any;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  backendData?: any;
}

export interface Activity {
  id: string;
  initials: string;
  content: string;
  time: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'sales';
  created: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  email: string;
  isActive: boolean;
  created: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  sku: string;
  stockQty: number;
  isActive: boolean;
  supplierId: string;
  created: string;
  backendData?: any;
}
