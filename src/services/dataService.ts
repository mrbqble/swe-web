import { api } from './api'
import { Order, Complaint, ChatSession, ChatMessage, Manager, Supplier, LinkRequest, Product } from '../types'

export interface PaginatedResponse<T> {
	items: T[]
	page: number
	size: number
	total: number
	pages: number
}

class DataService {
	// Link Requests
	async getIncomingLinks(page: number = 1, size: number = 20, status?: string): Promise<PaginatedResponse<LinkRequest>> {
		try {
			const response = await api.get('/links/incoming', {
				params: { page, size, status }
			})

			const transformedRequests: LinkRequest[] = response.data.items.map((item: any) => {
				const consumer = item.consumer || {}
				// ConsumerResponse schema only has: id, organization_name, created_at
				// It does NOT include user relationship, so we can only use organization_name
				const consumerName = consumer.organization_name || `Consumer ${item.consumer_id || 'Unknown'}`

				return {
					id: item.id.toString(),
					requester: consumerName,
					email: 'N/A', // User email not available in ConsumerResponse schema
					organization: consumer.organization_name || 'N/A',
					message: 'Requesting to connect with your supplier account', // Link model has no message field
					date: new Date(item.created_at).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					}),
					status: item.status,
					backendData: item
				}
			})

			return {
				items: transformedRequests,
				page: response.data.page,
				size: response.data.size,
				total: response.data.total,
				pages: response.data.pages
			}
		} catch (error) {
			console.error('Failed to fetch link requests:', error)
			throw error
		}
	}

	async getActiveLinks(page: number = 1, size: number = 20): Promise<PaginatedResponse<LinkRequest>> {
		try {
			const response = await api.get('/links/incoming', {
				params: { page, size, status: 'accepted' }
			})

			const transformedRequests: LinkRequest[] = response.data.items.map((item: any) => {
				const consumer = item.consumer || {}
				const consumerName = consumer.user
					? `${consumer.user.first_name || ''} ${consumer.user.last_name || ''}`.trim()
					: consumer.organization_name || `Consumer ${item.consumer_id}`

				return {
					id: item.id.toString(),
					requester: consumerName,
					email: consumer.user?.email || 'N/A',
					organization: consumer.organization_name || 'N/A',
					message: item.message || 'Active link',
					date: new Date(item.created_at).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					}),
					status: item.status,
					backendData: item
				}
			})

			return {
				items: transformedRequests,
				page: response.data.page,
				size: response.data.size,
				total: response.data.total,
				pages: response.data.pages
			}
		} catch (error) {
			console.error('Failed to fetch active links:', error)
			throw error
		}
	}

	async updateLinkStatus(linkId: number, status: string) {
		const response = await api.patch(`/links/${linkId}/status`, { status })
		return response.data
	}

	async blockLink(linkId: number) {
		const response = await api.patch(`/links/${linkId}/status`, { status: 'blocked' })
		return response.data
	}

	async unblockLink(linkId: number) {
		// Unblock by changing status from blocked back to accepted
		const response = await api.patch(`/links/${linkId}/status`, { status: 'accepted' })
		return response.data
	}

	async unlinkConsumer(linkId: number) {
		// Unlink by returning the link status to pending (instead of blocking)
		const response = await api.patch(`/links/${linkId}/status`, { status: 'pending' })
		return response.data
	}

	// Orders
	async getOrders(page: number = 1, size: number = 20, status?: string): Promise<PaginatedResponse<Order>> {
		try {
			const params: any = { page, size }
			if (status) {
				params.status = status
			}
			const response = await api.get('/orders', { params })

			// Transform backend data to frontend format
			const transformedOrders: Order[] = (response.data.items || []).map((item: any) => {
				const consumer = item.consumer || {}
				const consumerName = consumer.user
					? `${consumer.user.first_name || ''} ${consumer.user.last_name || ''}`.trim()
					: consumer.organization_name || `Consumer ${item.consumer_id}`

				return {
					id: item.id.toString(),
					orderNumber: `ORD-${item.id}`,
					customer: consumerName,
					organization: consumer.organization_name || 'N/A',
					date: new Date(item.created_at).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					}),
					amount: `₸${parseFloat(item.total_kzt.toString()).toLocaleString()}`,
					status: item.status,
					items: item.items?.length || 0,
					backendData: item,
					consumer: {
						id: consumer.id?.toString() || '',
						name: consumerName,
						email: consumer.user?.email || 'N/A',
						organization_name: consumer.organization_name || 'N/A'
					},
					supplier: {
						id: item.supplier?.id?.toString() || '',
						company_name: item.supplier?.company_name || 'N/A'
					},
					total_kzt: item.total_kzt,
					created_at: item.created_at,
					order_items: item.order_items || []
				}
			})

			return {
				items: transformedOrders,
				page: response.data.page || page,
				size: response.data.size || size,
				total: response.data.total || 0,
				pages: response.data.pages || 1
			}
		} catch (error) {
			console.error('Failed to fetch orders:', error)
			throw error
		}
	}

	async updateOrderStatus(orderId: number, status: string) {
		const response = await api.patch(`/orders/${orderId}/status`, { status })
		return response.data
	}

	async getOrder(orderId: number): Promise<any> {
		try {
			const response = await api.get(`/orders/${orderId}`)
			return response.data
		} catch (error) {
			console.error('Failed to fetch order:', error)
			throw error
		}
	}

	// Complaints
	async getComplaints(page: number = 1, size: number = 20, status?: string): Promise<PaginatedResponse<Complaint>> {
		try {
			const params: any = { page, size }
			if (status) {
				params.status = status
			}
			const response = await api.get('/complaints', { params })

			// Transform backend data to frontend format
			const transformedComplaints: Complaint[] = (response.data.items || []).map((item: any) => {
				const consumer = item.consumer || {}
				const consumerName = consumer.user
					? `${consumer.user.first_name || ''} ${consumer.user.last_name || ''}`.trim()
					: consumer.organization_name || `Consumer ${item.consumer_id}`

				return {
					id: item.id.toString(),
					complaintNumber: `CMP-${item.id}`,
					customer: consumerName,
					organization: consumer.organization_name || 'N/A',
					subject: item.description?.substring(0, 50) || 'No description',
					priority: 'medium', // Backend doesn't have priority yet
					status: item.status,
					updated: new Date(item.created_at).toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric'
					}),
					orderNumber: item.order_id ? `ORD-${item.order_id}` : 'N/A',
					issueType: 'General Issue',
					backendData: item,
					order: item.order
						? {
								id: item.order.id,
								orderNumber: `ORD-${item.order.id}`
						  }
						: undefined,
					consumer: item.consumer
						? {
								id: item.consumer.id,
								name: consumerName,
								email: consumer.user?.email || 'N/A',
								organization_name: consumer.organization_name || 'N/A'
						  }
						: undefined,
					consumerFeedback: item.consumer_feedback
				}
			})

			return {
				items: transformedComplaints,
				page: response.data.page || page,
				size: response.data.size || size,
				total: response.data.total || 0,
				pages: response.data.pages || 1
			}
		} catch (error) {
			console.error('Failed to fetch complaints:', error)
			throw error
		}
	}

	async getComplaint(complaintId: number): Promise<any> {
		try {
			const response = await api.get(`/complaints/${complaintId}`)
			return response.data
		} catch (error) {
			console.error('Failed to fetch complaint:', error)
			throw error
		}
	}

	async updateComplaintStatus(complaintId: number, status: string, resolution?: string) {
		const response = await api.patch(`/complaints/${complaintId}/status`, {
			status,
			resolution
		})
		return response.data
	}

	async createComplaint(complaintData: any) {
		const response = await api.post('/complaints', complaintData)
		return response.data
	}

	// Chat
	async getChatSessions(page: number = 1, size: number = 20): Promise<PaginatedResponse<ChatSession>> {
		try {
			const response = await api.get('/chats/sessions', { params: { page, size } })

			// Transform backend data to frontend format
			const transformedSessions: ChatSession[] = (response.data.items || []).map((item: any) => {
				const consumer = item.consumer || {}
				const consumerName = consumer.user
					? `${consumer.user.first_name || ''} ${consumer.user.last_name || ''}`.trim()
					: consumer.organization_name || `Consumer ${item.consumer_id}`

				const salesRep = item.sales_rep || {}
				const salesRepName =
					salesRep.first_name && salesRep.last_name ? `${salesRep.first_name} ${salesRep.last_name}`.trim() : salesRep.email || 'Sales Rep'

				return {
					id: item.id.toString(),
					consumerName: consumerName,
					salesRepName: salesRepName,
					lastMessage: item.last_message || 'No messages yet',
					timestamp: new Date(item.created_at).toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					}),
					unread: false, // Backend doesn't track unread yet
					orderId: item.order_id?.toString(),
					backendData: item
				}
			})

			return {
				items: transformedSessions,
				page: response.data.page || page,
				size: response.data.size || size,
				total: response.data.total || 0,
				pages: response.data.pages || 1
			}
		} catch (error) {
			console.error('Failed to fetch chat sessions:', error)
			throw error
		}
	}

	async getChatMessages(sessionId: number, page: number = 1, size: number = 50): Promise<PaginatedResponse<ChatMessage>> {
		try {
			const response = await api.get(`/chats/sessions/${sessionId}/messages`, {
				params: { page, size }
			})

			// Transform backend data to frontend format
			const transformedMessages: ChatMessage[] = (response.data.items || []).map((item: any) => {
				// Determine if message is from current user
				const userStr = localStorage.getItem('user')
				const user = userStr ? JSON.parse(userStr) : null
				const isOwn = item.sender_id === parseInt(user?.id || '0')

				const sender = item.sender || {}
				const senderName = sender.first_name && sender.last_name ? `${sender.first_name} ${sender.last_name}`.trim() : sender.email || 'User'

				return {
					id: item.id.toString(),
					sessionId: sessionId.toString(),
					senderId: item.sender_id.toString(),
					senderName: senderName,
					text: item.text || '',
					timestamp: new Date(item.created_at).toLocaleTimeString('en-US', {
						hour: '2-digit',
						minute: '2-digit'
					}),
					isOwn: isOwn,
					fileUrl: item.file_url
				}
			})

			return {
				items: transformedMessages,
				page: response.data.page || page,
				size: response.data.size || size,
				total: response.data.total || 0,
				pages: response.data.pages || 1
			}
		} catch (error) {
			console.error('Failed to fetch chat messages:', error)
			throw error
		}
	}

	async sendMessage(sessionId: number, text: string, fileUrl?: string) {
		const response = await api.post(`/chats/sessions/${sessionId}/messages`, {
			text,
			file_url: fileUrl
		})
		return response.data
	}

	async createChatSession(salesRepId: number, orderId?: number) {
		const response = await api.post('/chats/sessions', {
			sales_rep_id: salesRepId,
			order_id: orderId
		})
		return response.data
	}

	// Supplier Management
	async getManagers(): Promise<Manager[]> {
		try {
			const response = await api.get('/suppliers/staff')
			// Backend returns a list directly, not paginated
			const staffList = Array.isArray(response.data) ? response.data : []
			return staffList.map((staff: any) => ({
				id: staff.id.toString(),
				name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || 'Unknown',
				email: staff.email || '',
				role: (staff.role === 'manager' || staff.role === 'owner' ? 'manager' : 'sales') as 'manager' | 'sales',
				created: staff.created_at
					? new Date(staff.created_at).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'short',
							day: 'numeric'
					  })
					: 'N/A'
			}))
		} catch (error) {
			console.error('Failed to fetch managers:', error)
			throw error
		}
	}

	async addManager(managerData: Omit<Manager, 'id' | 'created'>): Promise<Manager> {
		// Note: Staff creation should be done via user registration endpoint
		// This is a placeholder that will show an error
		throw new Error('Staff member creation should be done via user registration. Please contact support.')
	}

	async deleteManager(managerId: string): Promise<void> {
		await api.delete(`/suppliers/staff/${managerId}`)
	}

	async getSuppliers(): Promise<Supplier[]> {
		// This endpoint may not exist in the backend
		// Returning empty array for now
		return []
	}

	async createSupplier(supplierData: Omit<Supplier, 'id' | 'created'>): Promise<Supplier> {
		// This endpoint may not exist in the backend
		throw new Error('Creating suppliers is not supported via this endpoint')
	}

	// Supplier Profile Management
	async getSupplierProfile(): Promise<any> {
		try {
			const response = await api.get('/suppliers/me')
			return response.data
		} catch (error) {
			console.error('Failed to fetch supplier profile:', error)
			throw error
		}
	}

	async updateSupplierProfile(profileData: any): Promise<any> {
		try {
			const response = await api.put('/suppliers/me', profileData)
			return response.data
		} catch (error) {
			console.error('Failed to update supplier profile:', error)
			throw error
		}
	}

	async deactivateSupplierAccount(): Promise<void> {
		try {
			await api.patch('/suppliers/me/deactivate')
		} catch (error) {
			console.error('Failed to deactivate supplier account:', error)
			throw error
		}
	}

	async deleteSupplierAccount(): Promise<void> {
		try {
			await api.delete('/suppliers/me')
		} catch (error) {
			console.error('Failed to delete supplier account:', error)
			throw error
		}
	}

	// User Account Management
	async getUserProfile(): Promise<any> {
		try {
			const response = await api.get('/users/me')
			return response.data
		} catch (error) {
			console.error('Failed to fetch user profile:', error)
			throw error
		}
	}

	async updateUserProfile(profileData: { email?: string; first_name?: string; last_name?: string }): Promise<any> {
		try {
			const response = await api.put('/users/me', profileData)
			return response.data
		} catch (error) {
			console.error('Failed to update user profile:', error)
			throw error
		}
	}

	async changePassword(currentPassword: string, newPassword: string): Promise<void> {
		try {
			await api.patch('/users/me/password', {
				current_password: currentPassword,
				new_password: newPassword
			})
		} catch (error) {
			console.error('Failed to change password:', error)
			throw error
		}
	}

	async deactivateStaffMember(staffId: string): Promise<void> {
		try {
			await api.patch(`/suppliers/staff/${staffId}/deactivate`)
		} catch (error) {
			console.error('Failed to deactivate staff member:', error)
			throw error
		}
	}

	// Products - Catalog Management
	async getMyProducts(page: number = 1, size: number = 20, isActive?: boolean): Promise<PaginatedResponse<Product>> {
		try {
			const params: any = { page, size }
			if (isActive !== undefined) {
				params.is_active = isActive
			}
			const response = await api.get('/products/me', { params })
			return response.data
		} catch (error) {
			console.error('Failed to fetch my products:', error)
			throw error
		}
	}

	async createProduct(productData: any): Promise<Product> {
		try {
			const response = await api.post('/products', productData)
			return response.data
		} catch (error) {
			console.error('Failed to create product:', error)
			throw error
		}
	}

	async updateProduct(productId: number, productData: any): Promise<Product> {
		try {
			const response = await api.put(`/products/${productId}`, productData)
			return response.data
		} catch (error) {
			console.error('Failed to update product:', error)
			throw error
		}
	}

	async deleteProduct(productId: number): Promise<void> {
		try {
			await api.delete(`/products/${productId}`)
		} catch (error) {
			console.error('Failed to delete product:', error)
			throw error
		}
	}
}

export const dataService = new DataService()
