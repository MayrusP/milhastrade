export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  credits: number;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Airline {
  id: string;
  name: string;
  code: string;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  milesAmount: number;
  price: number;
  type: 'SALE' | 'PURCHASE';
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  createdAt: string;
  user: User;
  airline?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface Transaction {
  id: string;
  transactionHash: string;
  status: string;
  amount: number;
  createdAt: string;
  offer: Offer;
  buyer: User;
  seller: User;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  assignedTo?: User;
  responses: SupportTicketResponse[];
}

export interface SupportTicketResponse {
  id: string;
  message: string;
  isFromAdmin: boolean;
  createdAt: string;
  user: User;
}