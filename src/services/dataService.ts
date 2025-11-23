import { api } from './api';
import {
  Order,
  Complaint,
  ChatSession,
  ChatMessage,
  Manager,
  Supplier,
  LinkRequest,
  Product,
} from '../types';

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  pages: number;
}

class DataService {
  // Mock data
  private mockLinkRequests: LinkRequest[] = [
    {
      id: '1',
      requester: 'Dmitry Volkov',
      email: 'dmitry@almatytech.kz',
      organization: 'AlmatyTech Solutions',
      message:
        'Interested in your bearing components for our industrial equipment',
      date: 'Dec 25, 2024',
      status: 'pending',
    },
    {
      id: '2',
      requester: 'Elena Kuznetsova',
      email: 'elena@astanaengineering.kz',
      organization: 'Astana Engineering Ltd',
      message: 'Looking to establish partnership for regular supplies',
      date: 'Dec 24, 2024',
      status: 'pending',
    },
    {
      id: '3',
      requester: 'Bakyt Serikbayev',
      email: 'bakyt@kazmetal.kz',
      organization: 'Kazakhstan Metal Works',
      message: 'Request access to your premium product catalog',
      date: 'Dec 23, 2024',
      status: 'accepted',
    },
  ];

  private mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customer: 'Dmitry Volkov',
      organization: 'AlmatyTech Solutions',
      date: 'Dec 25, 2024',
      amount: '₸62,500',
      status: 'pending',
      items: 3,
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customer: 'Elena Kuznetsova',
      organization: 'Astana Engineering Ltd',
      date: 'Dec 24, 2024',
      amount: '₸26,250',
      status: 'accepted',
      items: 2,
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customer: 'Bakyt Serikbayev',
      organization: 'Kazakhstan Metal Works',
      date: 'Dec 23, 2024',
      amount: '₸45,000',
      status: 'in_progress',
      items: 1,
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      customer: 'Olga Petrova',
      organization: 'Shymkent Industrial Group',
      date: 'Dec 22, 2024',
      amount: '₸9,600',
      status: 'completed',
      items: 1,
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      customer: 'Sergei Ivanov',
      organization: 'Aktobe Machinery Corp',
      date: 'Dec 21, 2024',
      amount: '₸120,800',
      status: 'rejected',
      items: 5,
    },
  ];

  private mockComplaints: Complaint[] = [
    {
      id: '1',
      complaintNumber: 'CMP-2024-001',
      customer: 'Dmitry Volkov',
      organization: 'AlmatyTech Solutions',
      subject: 'Defective bearing components in recent delivery',
      priority: 'high',
      status: 'open',
      updated: 'Dec 25',
      orderNumber: 'ORD-2024-001',
      issueType: 'Quality Issue',
    },
    {
      id: '2',
      complaintNumber: 'CMP-2024-002',
      customer: 'Elena Kuznetsova',
      organization: 'Astana Engineering Ltd',
      subject: 'Delayed delivery affecting project timeline',
      priority: 'medium',
      status: 'open',
      updated: 'Dec 23',
      orderNumber: 'ORD-2024-002',
      issueType: 'Delivery Issue',
    },
    {
      id: '3',
      complaintNumber: 'CMP-2024-003',
      customer: 'Bakyt Serikbayev',
      organization: 'Kazakhstan Metal Works',
      subject: 'Incorrect product specifications provided',
      priority: 'medium',
      status: 'escalated',
      updated: 'Dec 22',
      orderNumber: 'ORD-2024-003',
      issueType: 'Product Mismatch',
    },
    {
      id: '4',
      complaintNumber: 'CMP-2024-004',
      customer: 'Olga Petrova',
      organization: 'Shymkent Industrial Group',
      subject: 'Damaged packaging upon arrival',
      priority: 'low',
      status: 'resolved',
      updated: 'Dec 20',
      orderNumber: 'ORD-2024-004',
      issueType: 'Packaging Issue',
    },
  ];

  private mockChatSessions: ChatSession[] = [
    {
      id: '1',
      consumerName: 'Dmitry Volkov',
      salesRepName: 'Aida Sultanova',
      lastMessage: 'Hello, I have a question about my order #ORD-2024-001',
      timestamp: 'Dec 25, 10:30 AM',
      unread: true,
    },
    {
      id: '2',
      consumerName: 'Elena Kuznetsova',
      salesRepName: 'Nursultan Bekov',
      lastMessage: 'Thanks for your help with the delivery issue!',
      timestamp: 'Dec 24, 2:15 PM',
      unread: false,
    },
    {
      id: '3',
      consumerName: 'Bakyt Serikbayev',
      salesRepName: 'Aida Sultanova',
      lastMessage: 'Can you send me the technical specifications?',
      timestamp: 'Dec 23, 9:45 AM',
      unread: false,
    },
    {
      id: '4',
      consumerName: 'Olga Petrova',
      salesRepName: 'Nursultan Bekov',
      lastMessage: 'Looking forward to our next order',
      timestamp: 'Dec 22, 4:20 PM',
      unread: true,
    },
  ];

  private mockChatMessages: { [sessionId: string]: ChatMessage[] } = {
    '1': [
      {
        id: '1',
        sessionId: '1',
        senderId: '1',
        senderName: 'Dmitry Volkov',
        text: 'Hello, I have a question about my order #ORD-2024-001',
        timestamp: '10:30 AM',
        isOwn: false,
      },
      {
        id: '2',
        sessionId: '1',
        senderId: '2',
        senderName: 'Aida Sultanova',
        text: 'Hello Dmitry! How can I help you with your order?',
        timestamp: '10:32 AM',
        isOwn: true,
      },
      {
        id: '3',
        sessionId: '1',
        senderId: '1',
        senderName: 'Dmitry Volkov',
        text: 'I wanted to know the expected delivery date for the bearing components.',
        timestamp: '10:33 AM',
        isOwn: false,
      },
      {
        id: '4',
        sessionId: '1',
        senderId: '2',
        senderName: 'Aida Sultanova',
        text: "Your order is scheduled for delivery on December 28th. I'll send you the tracking details once it ships.",
        timestamp: '10:35 AM',
        isOwn: true,
      },
    ],
    '2': [
      {
        id: '1',
        sessionId: '2',
        senderId: '3',
        senderName: 'Elena Kuznetsova',
        text: 'Hi, I need to discuss the delayed delivery from last week.',
        timestamp: '2:15 PM',
        isOwn: false,
      },
      {
        id: '2',
        sessionId: '2',
        senderId: '4',
        senderName: 'Nursultan Bekov',
        text: 'Hello Elena, I apologize for the delay. The issue has been resolved and your order is now on track.',
        timestamp: '2:20 PM',
        isOwn: true,
      },
    ],
  };

  private mockManagers: Manager[] = [
    {
      id: '1',
      name: 'Aida Sultanova',
      email: 'aida.sultanova@kazsupply.kz',
      role: 'sales',
      created: 'Jan 15, 2024',
    },
    {
      id: '2',
      name: 'Nursultan Bekov',
      email: 'nursultan.bekov@kazsupply.kz',
      role: 'manager',
      created: 'Feb 20, 2024',
    },
    {
      id: '3',
      name: 'Alina Zhumabayeva',
      email: 'alina.zhumabayeva@kazsupply.kz',
      role: 'sales',
      created: 'Mar 10, 2024',
    },
  ];

  private mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'KazSupply',
      companyName: 'KazSupply Industrial Equipment',
      email: 'info@kazsupply.kz',
      isActive: true,
      created: 'Jan 1, 2024',
    },
    {
      id: '2',
      name: 'SteelTech',
      companyName: 'SteelTech Manufacturing',
      email: 'orders@steeltech.kz',
      isActive: true,
      created: 'Feb 15, 2024',
    },
    {
      id: '3',
      name: 'BearingsPro',
      companyName: 'Professional Bearings Ltd',
      email: 'contact@bearingspro.kz',
      isActive: false,
      created: 'Mar 5, 2024',
    },
  ];

  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'Industrial Bearing Set',
      description: 'High-quality industrial bearings for heavy machinery',
      price: '₸15,000',
      currency: 'KZT',
      sku: 'BRG-INDUSTRIAL-001',
      stockQty: 150,
      isActive: true,
      supplierId: '1',
      created: 'Dec 1, 2024',
    },
    {
      id: '2',
      name: 'Precision Ball Bearings',
      description: 'Precision ball bearings for automotive applications',
      price: '₸8,750',
      currency: 'KZT',
      sku: 'BRG-PRECISION-002',
      stockQty: 300,
      isActive: true,
      supplierId: '1',
      created: 'Dec 5, 2024',
    },
    {
      id: '3',
      name: 'Heavy Duty Roller Bearings',
      description: 'Heavy duty roller bearings for construction equipment',
      price: '₸22,500',
      currency: 'KZT',
      sku: 'BRG-HEAVY-003',
      stockQty: 75,
      isActive: true,
      supplierId: '1',
      created: 'Dec 10, 2024',
    },
    {
      id: '4',
      name: 'Ceramic Hybrid Bearings',
      description:
        'Advanced ceramic hybrid bearings for high-speed applications',
      price: '₸45,000',
      currency: 'KZT',
      sku: 'BRG-CERAMIC-004',
      stockQty: 25,
      isActive: true,
      supplierId: '1',
      created: 'Dec 15, 2024',
    },
  ];

  private useMockData = true; // Set to false to use real API when backend is ready

  // Link Requests
  // In dataService.ts - replace the getIncomingLinks method
  async getIncomingLinks(
    page: number = 1,
    size: number = 20,
    status?: string,
  ): Promise<PaginatedResponse<LinkRequest>> {
    if (!this.useMockData) {
      try {
        const response = await api.get('/links/incoming', {
          params: { page, size, status },
        });

        const transformedRequests: LinkRequest[] = response.data.items.map(
          (item: any) => ({
            id: item.id.toString(),
            requester: `User ${item.consumer_id}`,
            email: 'user@example.com',
            organization: `Organization ${item.consumer_id}`,
            message: 'Requesting to connect with your supplier account...',
            date: new Date(item.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            status: item.status,
          }),
        );

        return {
          items: transformedRequests,
          page: response.data.page,
          size: response.data.size,
          total: response.data.total,
          pages: response.data.pages,
        };
      } catch (error) {
        console.error('Failed to fetch link requests:', error);
      }
    }

    // Use mock data directly without transformation
    let filteredRequests = this.mockLinkRequests;
    if (status) {
      filteredRequests = filteredRequests.filter(
        (req) => req.status === status,
      );
    }

    const startIndex = (page - 1) * size;
    const paginatedItems = filteredRequests.slice(
      startIndex,
      startIndex + size,
    );

    return {
      items: paginatedItems,
      page,
      size,
      total: filteredRequests.length,
      pages: Math.ceil(filteredRequests.length / size),
    };
  }
  async updateLinkStatus(linkId: number, status: string) {
    if (!this.useMockData) {
      const response = await api.patch(`/links/${linkId}/status`, { status });
      return response.data;
    }

    // Mock implementation
    const request = this.mockLinkRequests.find(
      (req) => req.id === linkId.toString(),
    );
    if (request) {
      request.status = status;
    }
    return { success: true };
  }

  // Orders
  async getOrders(
    page: number = 1,
    size: number = 20,
    status?: string,
  ): Promise<PaginatedResponse<Order>> {
    if (!this.useMockData) {
      try {
        // ... existing API code
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    }

    let filteredOrders = this.mockOrders;
    if (status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === status,
      );
    }

    const startIndex = (page - 1) * size;
    const paginatedItems = filteredOrders.slice(startIndex, startIndex + size);

    return {
      items: paginatedItems,
      page,
      size,
      total: filteredOrders.length,
      pages: Math.ceil(filteredOrders.length / size),
    };
  }

  async updateOrderStatus(orderId: number, status: string) {
    if (!this.useMockData) {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    }

    // Mock implementation
    const order = this.mockOrders.find(
      (order) => order.id === orderId.toString(),
    );
    if (order) {
      order.status = status;
    }
    return { success: true };
  }

  async getOrder(orderId: number) {
    if (!this.useMockData) {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    }

    return this.mockOrders.find((order) => order.id === orderId.toString());
  }

  // Complaints
  async getComplaints(
    page: number = 1,
    size: number = 20,
    status?: string,
  ): Promise<PaginatedResponse<Complaint>> {
    if (!this.useMockData) {
      try {
        // ... existing API code
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
      }
    }

    let filteredComplaints = this.mockComplaints;
    if (status) {
      filteredComplaints = filteredComplaints.filter(
        (complaint) => complaint.status === status,
      );
    }

    const startIndex = (page - 1) * size;
    const paginatedItems = filteredComplaints.slice(
      startIndex,
      startIndex + size,
    );

    return {
      items: paginatedItems,
      page,
      size,
      total: filteredComplaints.length,
      pages: Math.ceil(filteredComplaints.length / size),
    };
  }

  async updateComplaintStatus(
    complaintId: number,
    status: string,
    resolution?: string,
  ) {
    if (!this.useMockData) {
      const response = await api.patch(`/complaints/${complaintId}/status`, {
        status,
        resolution,
      });
      return response.data;
    }

    // Mock implementation
    const complaint = this.mockComplaints.find(
      (c) => c.id === complaintId.toString(),
    );
    if (complaint) {
      complaint.status = status;
    }
    return { success: true };
  }

  async createComplaint(complaintData: any) {
    if (!this.useMockData) {
      const response = await api.post('/complaints', complaintData);
      return response.data;
    }

    // Mock implementation
    const newComplaint: Complaint = {
      id: (this.mockComplaints.length + 1).toString(),
      complaintNumber: `CMP-2024-${String(this.mockComplaints.length + 1).padStart(3, '0')}`,
      customer: complaintData.customer || 'New Customer',
      organization: complaintData.organization || 'New Organization',
      subject: complaintData.subject || 'New complaint',
      priority: 'medium',
      status: 'open',
      updated: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      orderNumber: complaintData.orderNumber || 'N/A',
      issueType: 'General Issue',
    };

    this.mockComplaints.unshift(newComplaint);
    return newComplaint;
  }

  // Chat
  async getChatSessions(
    page: number = 1,
    size: number = 20,
  ): Promise<PaginatedResponse<ChatSession>> {
    if (!this.useMockData) {
      try {
        // ... existing API code
      } catch (error) {
        console.error('Failed to fetch chat sessions:', error);
      }
    }

    const startIndex = (page - 1) * size;
    const paginatedItems = this.mockChatSessions.slice(
      startIndex,
      startIndex + size,
    );

    return {
      items: paginatedItems,
      page,
      size,
      total: this.mockChatSessions.length,
      pages: Math.ceil(this.mockChatSessions.length / size),
    };
  }

  async getChatMessages(
    sessionId: number,
    page: number = 1,
    size: number = 50,
  ): Promise<PaginatedResponse<ChatMessage>> {
    if (!this.useMockData) {
      try {
        // ... existing API code
      } catch (error) {
        console.error('Failed to fetch chat messages:', error);
      }
    }

    const sessionMessages = this.mockChatMessages[sessionId.toString()] || [];
    const startIndex = (page - 1) * size;
    const paginatedItems = sessionMessages.slice(startIndex, startIndex + size);

    return {
      items: paginatedItems,
      page,
      size,
      total: sessionMessages.length,
      pages: Math.ceil(sessionMessages.length / size),
    };
  }

  async sendMessage(sessionId: number, text: string, fileUrl?: string) {
    if (!this.useMockData) {
      const response = await api.post(`/chats/sessions/${sessionId}/messages`, {
        text,
        file_url: fileUrl,
      });
      return response.data;
    }

    // Mock implementation
    const sessionKey = sessionId.toString();
    if (!this.mockChatMessages[sessionKey]) {
      this.mockChatMessages[sessionKey] = [];
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: sessionKey,
      senderId: 'current-user', // This would be the current user's ID
      senderName: 'You',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOwn: true,
    };

    this.mockChatMessages[sessionKey].push(newMessage);
    return newMessage;
  }

  async createChatSession(salesRepId: number, orderId?: number) {
    if (!this.useMockData) {
      const response = await api.post('/chats/sessions', {
        sales_rep_id: salesRepId,
        order_id: orderId,
      });
      return response.data;
    }

    // Mock implementation
    const newSession: ChatSession = {
      id: (this.mockChatSessions.length + 1).toString(),
      consumerName: 'New Customer',
      salesRepName: 'Sales Representative',
      lastMessage: 'Start conversation...',
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      unread: false,
    };

    this.mockChatSessions.unshift(newSession);
    return newSession;
  }

  // Supplier Management
  async getManagers(): Promise<Manager[]> {
    if (!this.useMockData) {
      try {
        await api.get('/users/me');
      } catch (error) {
        console.error('Failed to fetch managers:', error);
      }
    }
    return this.mockManagers;
  }

  async addManager(
    managerData: Omit<Manager, 'id' | 'created'>,
  ): Promise<Manager> {
    const newManager: Manager = {
      id: (this.mockManagers.length + 1).toString(),
      ...managerData,
      created: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };
    this.mockManagers.push(newManager);
    return newManager;
  }

  async deleteManager(managerId: string): Promise<void> {
    this.mockManagers = this.mockManagers.filter((m) => m.id !== managerId);
  }

  async getSuppliers(): Promise<Supplier[]> {
    if (!this.useMockData) {
      try {
        await api.get('/users/me');
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      }
    }
    return this.mockSuppliers;
  }

  async createSupplier(
    supplierData: Omit<Supplier, 'id' | 'created'>,
  ): Promise<Supplier> {
    const newSupplier: Supplier = {
      id: (this.mockSuppliers.length + 1).toString(),
      ...supplierData,
      created: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };
    this.mockSuppliers.push(newSupplier);
    return newSupplier;
  }

  // Products
  async getProducts(
    page: number = 1,
    size: number = 20,
    supplierId?: number,
  ): Promise<PaginatedResponse<Product>> {
    let filteredProducts = this.mockProducts;
    if (supplierId) {
      filteredProducts = filteredProducts.filter(
        (product) => product.supplierId === supplierId.toString(),
      );
    }

    const startIndex = (page - 1) * size;
    const paginatedItems = filteredProducts.slice(
      startIndex,
      startIndex + size,
    );

    return {
      items: paginatedItems,
      page,
      size,
      total: filteredProducts.length,
      pages: Math.ceil(filteredProducts.length / size),
    };
  }

  async createProduct(
    productData: Omit<Product, 'id' | 'created'>,
  ): Promise<Product> {
    const newProduct: Product = {
      id: (this.mockProducts.length + 1).toString(),
      ...productData,
      created: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };
    this.mockProducts.push(newProduct);
    return newProduct;
  }

  async updateProduct(
    productId: string,
    productData: Partial<Product>,
  ): Promise<Product> {
    const productIndex = this.mockProducts.findIndex((p) => p.id === productId);
    if (productIndex !== -1) {
      this.mockProducts[productIndex] = {
        ...this.mockProducts[productIndex],
        ...productData,
      };
      return this.mockProducts[productIndex];
    }
    throw new Error('Product not found');
  }

  async deleteProduct(productId: string): Promise<void> {
    this.mockProducts = this.mockProducts.filter((p) => p.id !== productId);
  }
}

export const dataService = new DataService();
