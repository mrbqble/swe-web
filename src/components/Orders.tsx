import React, { useState, useEffect, useCallback } from 'react'
import { Order } from '../types'
import { dataService } from '../services/dataService'
import { usePermissions } from '../hooks/usePermissions'
import { useLanguage } from '../hooks/useLanguage'
import { t, formatCurrency } from '../utils/i18n'
import OrderDetail from './OrderDetail'

const Orders: React.FC = () => {
	const [orders, setOrders] = useState<Order[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [statusFilter, setStatusFilter] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [consumerFilter, setConsumerFilter] = useState('')
	const [dateFilter, setDateFilter] = useState('')
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const permissions = usePermissions()
	const { language } = useLanguage()

	const loadOrders = useCallback(async () => {
		try {
			setIsLoading(true)
			const response = await dataService.getOrders(currentPage, 20)

			setOrders(response.items || [])
			setTotalPages(response.pages || 1)
		} catch (error) {
			console.error('Failed to load orders:', error)
			setOrders([])
		} finally {
			setIsLoading(false)
		}
	}, [currentPage, statusFilter])

	useEffect(() => {
		loadOrders()
	}, [loadOrders])

	const handleStatusUpdate = async (orderId: string, newStatus: string) => {
		try {
			await dataService.updateOrderStatus(parseInt(orderId), newStatus)
			loadOrders() // Reload to reflect changes
			if (selectedOrderId === orderId) {
				setSelectedOrderId(null) // Close detail if open
			}
		} catch (error: any) {
			console.error('Failed to update order status:', error)
		}
	}

	const getStatusClass = (status: string) => {
		switch (status) {
			case 'pending':
				return 'status-pending'
			case 'accepted':
				return 'status-in-progress'
			case 'in_progress':
				return 'status-in-progress'
			case 'completed':
				return 'status-completed'
			case 'rejected':
				return 'status-rejected'
			default:
				return ''
		}
	}

	const getStatusText = (status: string) => {
		const statusMap: { [key: string]: string } = {
			pending: 'Pending',
			accepted: 'Accepted',
			in_progress: 'In Progress',
			completed: 'Completed',
			rejected: 'Rejected'
		}
		return (
			statusMap[status] ||
			status
				.split('_')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ')
		)
	}

	const filteredOrders = orders.filter((order) => {
		const matchesSearch =
			order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.organization.toLowerCase().includes(searchTerm.toLowerCase())

		const matchesConsumer =
			!consumerFilter ||
			order.customer.toLowerCase().includes(consumerFilter.toLowerCase()) ||
			order.organization.toLowerCase().includes(consumerFilter.toLowerCase())

		const matchesDate = !dateFilter || order.date.includes(dateFilter)

		return matchesSearch && matchesConsumer && matchesDate
	})

	if (isLoading) {
		return (
			<div>
				<div className="header">
					<h1>Orders</h1>
					<p>Manage customer orders and track fulfillment status.</p>
				</div>
				<div className="loading">Loading orders...</div>
			</div>
		)
	}

	return (
		<div>
			<div className="header">
				<h1>{t('orders.title')}</h1>
				<p>Manage customer orders and track fulfillment status.</p>
			</div>

			<div className="table-container">
				<div className="table-header">
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center'
						}}
					>
						<h2>
							{t('orders.title')} ({filteredOrders.length})
						</h2>
						<div
							className="filters"
							style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
						>
							<select
								className="status-filter"
								value={statusFilter}
								onChange={(e) => {
									setStatusFilter(e.target.value)
									setCurrentPage(1)
								}}
								aria-label={t('orders.allStatus')}
							>
								<option value="">{t('orders.allStatus')}</option>
								<option value="pending">{t('orders.pending')}</option>
								<option value="accepted">{t('orders.accepted')}</option>
								<option value="in_progress">{t('orders.inProgress')}</option>
								<option value="completed">{t('orders.completed')}</option>
								<option value="rejected">{t('orders.rejected')}</option>
							</select>
							<input
								type="text"
								placeholder={t('common.search')}
								className="search-input"
								style={{ width: '200px' }}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								aria-label={t('common.search')}
							/>
							<input
								type="text"
								placeholder={t('orders.filterByConsumer')}
								className="search-input"
								style={{ width: '180px' }}
								value={consumerFilter}
								onChange={(e) => setConsumerFilter(e.target.value)}
								aria-label={t('orders.filterByConsumer')}
							/>
							<input
								type="date"
								className="search-input"
								style={{ width: '150px' }}
								value={dateFilter}
								onChange={(e) => setDateFilter(e.target.value)}
								title={t('orders.filterByDate')}
								aria-label={t('orders.filterByDate')}
							/>
						</div>
					</div>
				</div>

				<table>
					<thead>
						<tr>
							<th>{t('orders.orderNumber')}</th>
							<th>{t('orders.customer')}</th>
							<th>{t('common.date')}</th>
							<th>{t('orders.amount')}</th>
							<th>{t('common.status')}</th>
							<th>{t('common.actions')}</th>
						</tr>
					</thead>
					<tbody>
						{filteredOrders.map((order) => (
							<tr key={order.id}>
								<td>
									<div style={{ fontWeight: '500' }}>{order.orderNumber}</div>
									<div style={{ color: '#666', fontSize: '14px' }}>
										{order.items} {t('orders.items')}
									</div>
								</td>
								<td>
									<div style={{ fontWeight: '500' }}>{order.customer}</div>
									<div style={{ color: '#666', fontSize: '14px' }}>{order.organization}</div>
								</td>
								<td>{order.date}</td>
								<td style={{ fontWeight: '500' }}>{order.amount}</td>
								<td className={getStatusClass(order.status)}>{getStatusText(order.status)}</td>
								<td>
									<div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
										<button
											className="btn btn-outline"
											onClick={() => setSelectedOrderId(order.id)}
											style={{ fontSize: '12px', padding: '4px 8px' }}
											aria-label={t('orders.viewDetails')}
										>
											{t('orders.viewDetails')}
										</button>
										{order.status === 'pending' && permissions.canAcceptOrders && (
											<button
												className="btn btn-primary"
												onClick={() => handleStatusUpdate(order.id, 'accepted')}
												style={{ fontSize: '12px', padding: '4px 8px' }}
												aria-label={t('orders.accept')}
											>
												{t('orders.accept')}
											</button>
										)}
										{order.status === 'pending' && permissions.canRejectOrders && (
											<button
												className="btn btn-outline"
												onClick={() => handleStatusUpdate(order.id, 'rejected')}
												style={{
													fontSize: '12px',
													padding: '4px 8px',
													color: '#ef4444',
													borderColor: '#ef4444'
												}}
												aria-label={t('orders.reject')}
											>
												{t('orders.reject')}
											</button>
										)}
										{order.status === 'accepted' && permissions.canUpdateOrderStatus && (
											<button
												className="btn btn-primary"
												onClick={() => handleStatusUpdate(order.id, 'in_progress')}
												style={{ fontSize: '12px', padding: '4px 8px' }}
												aria-label={t('orders.startProcessing')}
											>
												{t('orders.startProcessing')}
											</button>
										)}
										{order.status === 'in_progress' && permissions.canUpdateOrderStatus && (
											<button
												className="btn btn-primary"
												onClick={() => handleStatusUpdate(order.id, 'completed')}
												style={{ fontSize: '12px', padding: '4px 8px' }}
												aria-label={t('orders.complete')}
											>
												{t('orders.complete')}
											</button>
										)}
										{order.status === 'rejected' && permissions.canAcceptOrders && (
											<button
												className="btn btn-primary"
												onClick={() => handleStatusUpdate(order.id, 'accepted')}
												style={{ fontSize: '12px', padding: '4px 8px' }}
												aria-label={t('orders.accept')}
											>
												{t('orders.accept')}
											</button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{/* Pagination */}
				{totalPages > 1 && (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							gap: '10px',
							marginTop: '20px'
						}}
					>
						<button
							className="btn btn-outline"
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
						>
							Previous
						</button>
						<span style={{ padding: '8px 16px', alignSelf: 'center' }}>
							Page {currentPage} of {totalPages}
						</span>
						<button
							className="btn btn-outline"
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
						>
							Next
						</button>
					</div>
				)}
			</div>

			{/* Order Detail Modal */}
			{selectedOrderId && (
				<OrderDetail
					orderId={selectedOrderId}
					onClose={() => setSelectedOrderId(null)}
					onStatusUpdate={loadOrders}
				/>
			)}
		</div>
	)
}

export default Orders
