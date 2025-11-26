import React, { useState, useEffect } from 'react'
import { dataService } from '../services/dataService'
import { usePermissions } from '../hooks/usePermissions'
import { useAuth } from './AuthContext'
import { useLanguage } from '../hooks/useLanguage'
import { t, formatDateTime } from '../utils/i18n'

interface ComplaintDetail {
	id: number
	order_id: number
	consumer_id: number
	sales_rep_id: number
	manager_id: number
	status: string
	description: string
	resolution: string | null
	consumer_feedback: boolean | null
	created_at: string
	order?: {
		id: number
		orderNumber?: string
	}
	consumer?: {
		id: number
		organization_name: string
		user?: {
			first_name: string
			last_name: string
			email: string
		}
	}
}

interface ComplaintDetailProps {
	complaintId: string
	onClose: () => void
	onStatusUpdate?: () => void
}

const ComplaintDetail: React.FC<ComplaintDetailProps> = ({ complaintId, onClose, onStatusUpdate }) => {
	const [complaint, setComplaint] = useState<ComplaintDetail | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isUpdating, setIsUpdating] = useState(false)
	const [resolutionText, setResolutionText] = useState('')
	const [showResolutionInput, setShowResolutionInput] = useState(false)
	const permissions = usePermissions()
	const { user } = useAuth()
	const { language } = useLanguage()

	useEffect(() => {
		loadComplaint()
	}, [complaintId])

	const loadComplaint = async () => {
		try {
			setIsLoading(true)
			const complaintData = await dataService.getComplaint(parseInt(complaintId))
			if (complaintData) {
				setComplaint(complaintData)
				if (complaintData.resolution) {
					setResolutionText(complaintData.resolution)
				}
			}
		} catch (error) {
			console.error('Failed to load complaint:', error)
			alert('Failed to load complaint details')
		} finally {
			setIsLoading(false)
		}
	}

	const handleResolve = async () => {
		if (!resolutionText.trim()) {
			alert('Please enter a resolution text')
			return
		}

		try {
			setIsUpdating(true)
			await dataService.updateComplaintStatus(parseInt(complaintId), 'resolved', resolutionText)
			alert('Complaint resolved successfully')
			await loadComplaint()
			if (onStatusUpdate) {
				onStatusUpdate()
			}
			setShowResolutionInput(false)
		} catch (error: any) {
			console.error('Failed to resolve complaint:', error)
			alert(error?.response?.data?.detail || 'Failed to resolve complaint')
		} finally {
			setIsUpdating(false)
		}
	}

	const handleEscalate = async () => {
		if (!window.confirm('Are you sure you want to escalate this complaint to the manager?')) {
			return
		}

		try {
			setIsUpdating(true)
			await dataService.updateComplaintStatus(parseInt(complaintId), 'escalated')
			alert('Complaint escalated to manager successfully')
			await loadComplaint()
			if (onStatusUpdate) {
				onStatusUpdate()
			}
		} catch (error: any) {
			console.error('Failed to escalate complaint:', error)
			alert(error?.response?.data?.detail || 'Failed to escalate complaint')
		} finally {
			setIsUpdating(false)
		}
	}

	const getStatusClass = (status: string) => {
		switch (status) {
			case 'open':
				return 'status-pending'
			case 'escalated':
				return 'status-in-progress'
			case 'resolved':
				return 'status-completed'
			default:
				return ''
		}
	}

	const getStatusText = (status: string) => {
		return status.charAt(0).toUpperCase() + status.slice(1)
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
					<div className="loading">Loading complaint details...</div>
				</div>
			</div>
		)
	}

	if (!complaint) {
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
					<h2>Complaint Not Found</h2>
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

	const consumer = (complaint.consumer as any) || {}
	const consumerName = consumer.user
		? `${consumer.user.first_name || ''} ${consumer.user.last_name || ''}`.trim()
		: consumer.organization_name || `Consumer ${complaint.consumer_id}`
	const consumerEmail = consumer.user?.email || 'N/A'
	const organization = consumer.organization_name || 'N/A'

	const isSalesRep = user?.role === 'supplier_sales'
	console.log(user)

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
					maxWidth: '800px',
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
						{t('complaintDetail.title')} #{complaint.id}
					</h2>
					<button
						className="btn btn-outline"
						onClick={onClose}
						aria-label={t('common.close')}
					>
						✕ {t('common.close')}
					</button>
				</div>

				{/* Complaint Info */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '20px',
						marginBottom: '30px'
					}}
				>
					<div>
						<h3 style={{ marginTop: 0, marginBottom: '10px' }}>{t('complaintDetail.consumerInfo')}</h3>
						<div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
							<div style={{ marginBottom: '8px' }}>
								<strong>{t('orderDetail.name')}:</strong> {consumerName}
							</div>
							<div style={{ marginBottom: '8px' }}>
								<strong>{t('orderDetail.organization')}:</strong> {organization}
							</div>
							<div style={{ marginBottom: '8px' }}>
								<strong>{t('orderDetail.email')}:</strong> {consumerEmail}
							</div>
						</div>
					</div>
					<div>
						<h3 style={{ marginTop: 0, marginBottom: '10px' }}>{t('complaintDetail.complaintInfo')}</h3>
						<div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
							<div style={{ marginBottom: '8px' }}>
								<strong>{t('common.status')}:</strong> <span className={getStatusClass(complaint.status)}>{getStatusText(complaint.status)}</span>
							</div>
							<div style={{ marginBottom: '8px' }}>
								<strong>{t('orderDetail.created')}:</strong> {formatDateTime(complaint.created_at, language)}
							</div>
							<div style={{ marginBottom: '8px' }}>
								<strong>{t('orders.orderNumber')} ID:</strong> {complaint.order_id}
							</div>
							{complaint.status === 'resolved' && complaint.consumer_feedback !== null && (
								<div>
									<strong>{t('complaintDetail.consumerFeedback')}:</strong>{' '}
									<span
										style={{
											color: complaint.consumer_feedback ? '#28a745' : '#dc3545',
											fontWeight: 'bold'
										}}
									>
										{complaint.consumer_feedback ? t('complaintDetail.satisfied') : t('complaintDetail.notSatisfied')}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Description */}
				<div style={{ marginBottom: '30px' }}>
					<h3 style={{ marginBottom: '15px' }}>{t('complaintDetail.description')}</h3>
					<div
						style={{
							backgroundColor: '#f8f9fa',
							padding: '15px',
							borderRadius: '6px',
							whiteSpace: 'pre-wrap'
						}}
					>
						{complaint.description || t('common.error')}
					</div>
				</div>

				{/* Resolution */}
				{complaint.resolution && (
					<div style={{ marginBottom: '30px' }}>
						<h3 style={{ marginBottom: '15px' }}>{t('complaintDetail.resolution')}</h3>
						<div
							style={{
								backgroundColor: '#e7f3ff',
								padding: '15px',
								borderRadius: '6px',
								whiteSpace: 'pre-wrap'
							}}
						>
							{complaint.resolution}
						</div>
					</div>
				)}

				{/* Resolution Input */}
				{showResolutionInput && (
					<div style={{ marginBottom: '30px' }}>
						<h3 style={{ marginBottom: '15px' }}>{t('complaintDetail.enterResolution')}</h3>
						<textarea
							value={resolutionText}
							onChange={(e) => setResolutionText(e.target.value)}
							placeholder={t('complaintDetail.resolutionPlaceholder')}
							style={{
								width: '100%',
								minHeight: '120px',
								padding: '12px',
								border: '1px solid #ddd',
								borderRadius: '6px',
								fontSize: '14px',
								fontFamily: 'inherit'
							}}
							aria-label={t('complaintDetail.enterResolution')}
						/>
						<div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
							<button
								className="btn btn-primary"
								onClick={handleResolve}
								disabled={isUpdating || !resolutionText.trim()}
								aria-label={t('complaintDetail.saveResolution')}
							>
								{isUpdating ? t('common.loading') : t('complaintDetail.saveResolution')}
							</button>
							<button
								className="btn btn-outline"
								onClick={() => {
									setShowResolutionInput(false)
									setResolutionText(complaint.resolution || '')
								}}
								aria-label={t('common.cancel')}
							>
								{t('common.cancel')}
							</button>
						</div>
					</div>
				)}

				{/* Actions */}
				<div
					style={{
						display: 'flex',
						gap: '10px',
						flexWrap: 'wrap',
						justifyContent: 'flex-end'
					}}
				>
					{complaint.status === 'escalated' && complaint.consumer_id && (
						<button
							className="btn btn-outline"
							onClick={() => {
								if ((window as any).navigateToChat) {
									;(window as any).navigateToChat(Number(complaint.consumer_id))
									onClose() // Close the detail modal
								} else {
									alert('Unable to open chat. Please try again.')
								}
							}}
							style={{ color: '#007bff', borderColor: '#007bff' }}
							aria-label="Open Chat"
						>
							💬 Open Chat
						</button>
					)}
					{complaint.status === 'open' && !isSalesRep && (
						<button
							className="btn btn-outline"
							onClick={handleEscalate}
							disabled={isUpdating}
							style={{ color: '#ff9800', borderColor: '#ff9800' }}
							aria-label={t('complaintDetail.escalateToManager')}
						>
							{isUpdating ? t('common.loading') : `⚠ ${t('complaintDetail.escalateToManager')}`}
						</button>
					)}
					{complaint.status === 'escalated' && !isSalesRep && (
						<button
							className="btn btn-primary"
							onClick={() => setShowResolutionInput(true)}
							disabled={isUpdating}
							aria-label={t('complaintDetail.resolveComplaint')}
						>
							{t('complaintDetail.resolveComplaint')}
						</button>
					)}
					{complaint.status === 'open' && !isSalesRep && (
						<button
							className="btn btn-primary"
							onClick={() => setShowResolutionInput(true)}
							disabled={isUpdating}
							aria-label={t('complaintDetail.markAsResolved')}
						>
							{t('complaintDetail.markAsResolved')}
						</button>
					)}
					{complaint.status !== 'resolved' && isSalesRep && (
						<div
							style={{
								backgroundColor: '#fff3cd',
								border: '1px solid #ffc107',
								padding: '15px',
								borderRadius: '6px',
								color: '#856404',
								width: '100%'
							}}
							role="alert"
						>
							{t('complaintDetail.noPermission')}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default ComplaintDetail
