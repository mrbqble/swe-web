import React, { useState, useEffect } from 'react'
import { dataService } from '../services/dataService'
import { usePermissions } from '../hooks/usePermissions'
import { useAuth } from './AuthContext'
import { useLanguage } from '../hooks/useLanguage'
import { t, formatCurrency, formatDateTime } from '../utils/i18n'

interface OrderItem {
	id: number
	product_id: number
	qty: number
	unit_price_kzt: string | number
	product?: {
		id: number
		name: string
		sku: string
	}
}

interface OrderDetail {
	id: number
	supplier_id: number
	consumer_id: number
	status: string
	total_kzt: string | number
	created_at: string
	items: OrderItem[]
	consumer?: {
		id: number
		organization_name: string
		user?: {
			first_name: string
			last_name: string
			email: string
		}
	}
	supplier?: {
		id: number
		company_name: string
	}
}

interface OrderDetailProps {
	orderId: string
	onClose: () => void
	onStatusUpdate?: () => void
}

const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onClose, onStatusUpdate }) => {
	const [order, setOrder] = useState<OrderDetail | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isUpdating, setIsUpdating] = useState(false)
	const permissions = usePermissions()
	const { user } = useAuth()
	const { language } = useLanguage()

	useEffect(() => {
		loadOrder()
	}, [orderId])

	const loadOrder = async () => {
		try {
			setIsLoading(true)
			const response = await dataService.getOrder(parseInt(orderId))

			setOrder(response)
		} catch (error) {
			console.error('Failed to load order:', error)
			alert('Failed to load order details')
		} finally {
			setIsLoading(false)
		}
	}

	const handleStatusUpdate = async (newStatus: string) => {
		if (newStatus === 'rejected' && !window.confirm('Are you sure you want to reject this order? This action cannot be undone.')) {
			return
		}

		try {
			setIsUpdating(true)
			await dataService.updateOrderStatus(parseInt(orderId), newStatus)
			alert(`Order ${newStatus === 'rejected' ? 'rejected' : 'status updated'} successfully`)
			await loadOrder()
			if (onStatusUpdate) {
				onStatusUpdate()
			}
		} catch (error: any) {
			console.error('Failed to update order status:', error)
			alert(
				error?.response?.data?.detail ||
					'Failed to update order status. ' + (error?.response?.data?.detail?.includes('stock') ? error.response.data.detail : '')
			)
		} finally {
			setIsUpdating(false)
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

	if (isLoading) {
		return (
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 1000
				}}
			>
				<div
					style={{
						backgroundColor: 'white',
						padding: '30px',
						borderRadius: '8px',
						minWidth: '400px'
					}}
				>
					<div className="loading">Loading order details...</div>
				</div>
			</div>
		)
	}

	if (!order) {
		return (
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 1000
				}}
			>
				<div
					style={{
						backgroundColor: 'white',
						padding: '30px',
						borderRadius: '8px',
						minWidth: '400px'
					}}
				>
					<h2>Order Not Found</h2>
					<button
						className="btn btn-primary"
						onClick={onClose}
					>
						Close
					</button>
				</div>
			</div>
		)
	}

	const consumer = (order.consumer as any) || {}
	const consumerName = consumer.user
		? `${consumer.user.first_name || ''} ${consumer.user.last_name || ''}`.trim()
		: consumer.organization_name || `Consumer ${order.consumer_id}`
	const organization = consumer.organization_name || 'N/A'

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 1000,
				padding: '20px'
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					onClose()
				}
			}}
		>
			<div
				style={{
					backgroundColor: 'white',
					padding: '30px',
					borderRadius: '8px',
					width: '90%',
					maxWidth: '900px',
					maxHeight: '90vh',
					overflow: 'auto'
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '20px'
					}}
				>
					<h2 style={{ margin: 0 }}>
						{t('orderDetail.title')} #{order.id}
					</h2>
					<button
						className="btn btn-outline"
						onClick={onClose}
						aria-label={t('common.close')}
					>
						✕ {t('common.close')}
					</button>
				</div>

				{/* Order Info */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '20px',
						marginBottom: '30px'
					}}
				>
					<div>
						<h3 style={{ marginTop: 0, marginBottom: '10px' }}>{t('orderDetail.consumerInfo')}</h3>
						<div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
							<div style={{ marginBottom: '8px' }}>
								<strong>{t('orderDetail.name')}:</strong> {consumerName}
							</div>
							<div style={{ marginBottom: '8px' }}>
								<strong>{t('orderDetail.organization')}:</strong> {organization}
							</div>
						</div>
					</div>
					<div>
						<h3 style={{ marginTop: 0, marginBottom: '10px' }}>{t('orderDetail.orderInfo')}</h3>
						<div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
							<div style={{ marginBottom: '8px' }}>
								<strong>{t('common.status')}:</strong> <span className={getStatusClass(order.status)}>{getStatusText(order.status)}</span>
							</div>
							<div style={{ marginBottom: '8px' }}>
								<strong>{t('orderDetail.created')}:</strong> {formatDateTime(order.created_at, language)}
							</div>
							<div style={{ marginBottom: '8px' }}>
								<strong>{t('common.total')}:</strong> {formatCurrency(order.total_kzt, language)}
							</div>
							<div>
								<strong>{t('orders.items')}:</strong> {order.items.length}
							</div>
						</div>
					</div>
				</div>

				{/* Order Items */}
				<div style={{ marginBottom: '30px' }}>
					<h3 style={{ marginBottom: '15px' }}>{t('orderDetail.orderItems')}</h3>
					<table style={{ width: '100%' }}>
						<thead>
							<tr>
								<th style={{ textAlign: 'left' }}>{t('orderDetail.product')}</th>
								<th style={{ textAlign: 'left' }}>{t('orderDetail.sku')}</th>
								<th style={{ textAlign: 'right' }}>{t('orderDetail.quantity')}</th>
								<th style={{ textAlign: 'right' }}>{t('orderDetail.unitPrice')}</th>
								<th style={{ textAlign: 'right' }}>{t('orderDetail.subtotal')}</th>
							</tr>
						</thead>
						<tbody>
							{order.items.map((item) => (
								<tr key={item.id}>
									<td>{item.product?.name || `Product ${item.product_id}`}</td>
									<td style={{ color: '#666' }}>{item.product?.sku || 'N/A'}</td>
									<td style={{ textAlign: 'right' }}>{item.qty}</td>
									<td style={{ textAlign: 'right' }}>{formatCurrency(item.unit_price_kzt)}</td>
									<td style={{ textAlign: 'right', fontWeight: '500' }}>
										{formatCurrency((typeof item.unit_price_kzt === 'string' ? parseFloat(item.unit_price_kzt) : item.unit_price_kzt) * item.qty)}
									</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr>
								<td
									colSpan={4}
									style={{ textAlign: 'right', fontWeight: 'bold' }}
								>
									{t('common.total')}:
								</td>
								<td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>{formatCurrency(order.total_kzt, language)}</td>
							</tr>
						</tfoot>
					</table>
				</div>

				{/* Actions */}
				{!permissions.canUpdateOrderStatus && (
					<div
						style={{
							backgroundColor: '#fff3cd',
							border: '1px solid #ffc107',
							padding: '15px',
							borderRadius: '6px',
							marginBottom: '20px',
							color: '#856404'
						}}
						role="alert"
					>
						{t('orderDetail.readOnly')}
					</div>
				)}

				{permissions.canUpdateOrderStatus && (
					<div
						style={{
							display: 'flex',
							gap: '10px',
							flexWrap: 'wrap',
							justifyContent: 'flex-end'
						}}
					>
						{order.status === 'pending' && (
							<>
								{permissions.canAcceptOrders && (
									<button
										className="btn btn-primary"
										onClick={() => handleStatusUpdate('accepted')}
										disabled={isUpdating}
										aria-label={t('orderDetail.acceptOrder')}
									>
										{isUpdating ? t('common.loading') : `✓ ${t('orderDetail.acceptOrder')}`}
									</button>
								)}
								{permissions.canRejectOrders && (
									<button
										className="btn btn-outline"
										onClick={() => handleStatusUpdate('rejected')}
										disabled={isUpdating}
										style={{ color: '#ef4444', borderColor: '#ef4444' }}
										aria-label={t('orderDetail.rejectOrder')}
									>
										{isUpdating ? t('common.loading') : `✗ ${t('orderDetail.rejectOrder')}`}
									</button>
								)}
							</>
						)}
						{order.status === 'accepted' && permissions.canUpdateOrderStatus && (
							<button
								className="btn btn-primary"
								onClick={() => handleStatusUpdate('in_progress')}
								disabled={isUpdating}
								aria-label={t('orderDetail.startProcessing')}
							>
								{isUpdating ? t('common.loading') : t('orderDetail.startProcessing')}
							</button>
						)}
						{order.status === 'in_progress' && permissions.canUpdateOrderStatus && (
							<button
								className="btn btn-primary"
								onClick={() => handleStatusUpdate('completed')}
								disabled={isUpdating}
								aria-label={t('orderDetail.markAsCompleted')}
							>
								{isUpdating ? t('common.loading') : t('orderDetail.markAsCompleted')}
							</button>
						)}
						<button
							className="btn btn-outline"
							onClick={() => {
								// Navigate to chat for this order's consumer
								const consumerId = order.consumer_id || order.consumer?.id
								if (consumerId) {
									const navigateToChat = (window as any).navigateToChat
									if (navigateToChat && typeof navigateToChat === 'function') {
										navigateToChat(consumerId)
										onClose() // Close order detail when navigating to chat
									} else {
										alert('Unable to open chat. Please navigate to the Chat page manually.')
									}
								} else {
									alert('Consumer information not available for this order.')
								}
							}}
							aria-label={t('orderDetail.openChat')}
						>
							💬 {t('orderDetail.openChat')}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default OrderDetail
