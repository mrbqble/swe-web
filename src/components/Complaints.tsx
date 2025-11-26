import React, { useState, useEffect, useCallback } from 'react'
import { Complaint } from '../types'
import { dataService } from '../services/dataService'
import { usePermissions } from '../hooks/usePermissions'
import { useAuth } from './AuthContext'
import ComplaintDetail from './ComplaintDetail'

const Complaints: React.FC = () => {
	const [complaints, setComplaints] = useState<Complaint[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [statusFilter, setStatusFilter] = useState('')
	const [priorityFilter, setPriorityFilter] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const permissions = usePermissions()
	const { user } = useAuth()

	const loadComplaints = useCallback(async () => {
		try {
			setIsLoading(true)
			// Fetch all complaints (backend doesn't support status filtering, so we fetch all and filter on frontend)
			const response = await dataService.getComplaints(1, 1000)
			setComplaints(response.items || [])
		} catch (error) {
			console.error('Failed to load complaints:', error)
			setComplaints([])
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		loadComplaints()
	}, [loadComplaints])

	const handleStatusUpdate = async (complaintId: string, newStatus: string, resolution?: string) => {
		try {
			await dataService.updateComplaintStatus(parseInt(complaintId), newStatus, resolution)
			loadComplaints() // Reload to reflect changes
			if (selectedComplaintId === complaintId) {
				setSelectedComplaintId(null) // Close detail if open
			}
		} catch (error: any) {
			console.error('Failed to update complaint status:', error)
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

	const getPriorityClass = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'priority-high'
			case 'medium':
				return 'priority-medium'
			case 'low':
				return 'priority-low'
			default:
				return ''
		}
	}

	const getStatusText = (status: string) => {
		return status.charAt(0).toUpperCase() + status.slice(1)
	}

	// Filter complaints based on search term, priority, and status
	// Backend structure: backendData contains the full backend response
	const allFilteredComplaints = complaints
		.filter((complaint) => {
			// Status filter
			if (statusFilter && complaint.status !== statusFilter) {
				return false
			}
			return true
		})
		.filter((complaint) => {
			const backendData = complaint.backendData || {}
			const searchLower = searchTerm.toLowerCase()
			return (
				complaint.complaintNumber.toLowerCase().includes(searchLower) ||
				complaint.customer.toLowerCase().includes(searchLower) ||
				complaint.subject.toLowerCase().includes(searchLower) ||
				(backendData.description || '').toLowerCase().includes(searchLower) ||
				(backendData.consumer?.organization_name || '').toLowerCase().includes(searchLower)
			)
		})
		.filter((complaint) => !priorityFilter || complaint.priority === priorityFilter)

	// Apply pagination
	const filteredComplaints = allFilteredComplaints.slice((currentPage - 1) * 20, currentPage * 20)
	const totalFilteredPages = Math.ceil(allFilteredComplaints.length / 20)

	if (isLoading) {
		return (
			<div>
				<div className="header">
					<h1>Complaints</h1>
					<p>Manage customer complaints and resolve issues.</p>
				</div>
				<div className="loading">Loading complaints...</div>
			</div>
		)
	}

	return (
		<div>
			<div className="header">
				<h1>Complaints</h1>
				<p>Manage customer complaints and resolve issues.</p>
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
						<h2>Complaints ({allFilteredComplaints.length})</h2>
						<div className="filters">
							<select
								className="status-filter"
								value={statusFilter}
								onChange={(e) => {
									setStatusFilter(e.target.value)
									setCurrentPage(1)
								}}
							>
								<option value="">All Status</option>
								<option value="open">Open</option>
								<option value="escalated">Escalated</option>
								<option value="resolved">Resolved</option>
							</select>
							<select
								className="status-filter"
								value={priorityFilter}
								onChange={(e) => {
									setPriorityFilter(e.target.value)
									setCurrentPage(1)
								}}
							>
								<option value="">All Priority</option>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
							<input
								type="text"
								placeholder="Search complaints..."
								className="search-input"
								style={{ width: '200px' }}
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value)
									setCurrentPage(1)
								}}
							/>
						</div>
					</div>
				</div>

				<table>
					<thead>
						<tr>
							<th>Complaint</th>
							<th>Customer</th>
							<th>Subject</th>
							<th>Priority</th>
							<th>Status</th>
							<th>Updated</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{filteredComplaints.map((complaint) => {
							// Access backend data structure directly
							const backendData = complaint.backendData || {}
							const consumerId = backendData.consumer_id || null
							const consumer = backendData.consumer || {}
							const isEscalated = complaint.status === 'escalated'

							// Get consumer name from backend structure
							const consumerName = consumer.user
								? `${consumer.user.first_name || ''} ${consumer.user.last_name || ''}`.trim()
								: consumer.organization_name || `Consumer ${consumerId || 'N/A'}`
							const consumerEmail = consumer.user?.email || 'N/A'
							const organizationName = consumer.organization_name || 'N/A'

							return (
								<React.Fragment key={complaint.id}>
									<tr>
										<td style={{ fontWeight: '500' }}>{complaint.complaintNumber}</td>
										<td style={{ fontWeight: '500' }}>{complaint.customer}</td>
										<td style={{ fontWeight: '500' }}>{complaint.subject}</td>
										<td className={getPriorityClass(complaint.priority)}>
											{complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
										</td>
										<td className={getStatusClass(complaint.status)}>{getStatusText(complaint.status)}</td>
										<td>{complaint.updated}</td>
										<td>
											<div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
												<button
													className="btn btn-outline"
													onClick={() => setSelectedComplaintId(complaint.id)}
													style={{ fontSize: '12px', padding: '4px 8px' }}
												>
													View Details
												</button>
												{isEscalated && consumerId && (
													<button
														className="btn btn-outline"
														onClick={() => {
															if ((window as any).navigateToChat) {
																;(window as any).navigateToChat(Number(consumerId))
															}
														}}
														style={{
															fontSize: '12px',
															padding: '4px 8px',
															color: '#007bff',
															borderColor: '#007bff'
														}}
													>
														Open Chat
													</button>
												)}
												{isEscalated && permissions.canResolveComplaints && (
													<button
														className="btn btn-primary"
														onClick={() => {
															const resolution = prompt('Enter resolution:')
															if (resolution) {
																handleStatusUpdate(complaint.id, 'resolved', resolution)
															}
														}}
														style={{ fontSize: '12px', padding: '4px 8px' }}
													>
														Resolve
													</button>
												)}
												{complaint.status !== 'resolved' && !isEscalated && (
													<>
														{complaint.status === 'open' && permissions.canEscalateComplaints && (
															<button
																className="btn btn-outline"
																onClick={() => handleStatusUpdate(complaint.id, 'escalated')}
																style={{
																	fontSize: '12px',
																	padding: '4px 8px',
																	color: '#ff9800',
																	borderColor: '#ff9800'
																}}
															>
																Escalate
															</button>
														)}
														{permissions.canResolveComplaints && (
															<button
																className="btn btn-primary"
																onClick={() => {
																	const resolution = prompt('Enter resolution:')
																	if (resolution) {
																		handleStatusUpdate(complaint.id, 'resolved', resolution)
																	}
																}}
																style={{ fontSize: '12px', padding: '4px 8px' }}
															>
																Resolve
															</button>
														)}
													</>
												)}
											</div>
										</td>
									</tr>

									{!isEscalated && (
										<tr>
											<td
												colSpan={7}
												style={{ color: '#666', fontSize: '14px', paddingTop: '0' }}
											>
												Order: {complaint.orderNumber} • {complaint.issueType}
											</td>
										</tr>
									)}
								</React.Fragment>
							)
						})}
					</tbody>
				</table>

				{/* Pagination */}
				{totalFilteredPages > 1 && (
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
							Page {currentPage} of {totalFilteredPages}
						</span>
						<button
							className="btn btn-outline"
							onClick={() => setCurrentPage((p) => Math.min(totalFilteredPages, p + 1))}
							disabled={currentPage >= totalFilteredPages}
						>
							Next
						</button>
					</div>
				)}
			</div>

			{/* Complaint Detail Modal */}
			{selectedComplaintId && (
				<ComplaintDetail
					complaintId={selectedComplaintId}
					onClose={() => setSelectedComplaintId(null)}
					onStatusUpdate={loadComplaints}
				/>
			)}
		</div>
	)
}

export default Complaints
