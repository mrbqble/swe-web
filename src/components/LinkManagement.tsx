import React, { useState, useEffect, useCallback } from 'react'
import { dataService } from '../services/dataService'
import { LinkRequest } from '../types'
import { usePermissions } from '../hooks/usePermissions'

interface Link {
	id: string
	consumer_id: number
	supplier_id: number
	status: string
	created_at: string
	updated_at: string
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

const LinkManagement: React.FC = () => {
	const permissions = usePermissions()
	const [activeTab, setActiveTab] = useState<'requests' | 'active'>('requests')
	const [linkRequests, setLinkRequests] = useState<LinkRequest[]>([])
	const [activeLinks, setActiveLinks] = useState<Link[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'denied' | 'blocked'>('all')
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)

	const loadLinkRequests = useCallback(async () => {
		try {
			setIsLoading(true)
			const statusParam = statusFilter === 'all' ? undefined : statusFilter
			const response = await dataService.getIncomingLinks(currentPage, 20, statusParam)

			console.log(response.items)

			setLinkRequests(response.items)
			setTotalPages(response.pages || 1)
		} catch (error) {
			console.error('Failed to load link requests:', error)
			alert('Failed to load link requests')
		} finally {
			setIsLoading(false)
		}
	}, [currentPage, statusFilter])

	const loadActiveLinks = useCallback(async () => {
		try {
			setIsLoading(true)
			const response = await dataService.getActiveLinks(1, 100)

			const transformedLinks: Link[] = (response.items || []).map((item: any) => {
				// Use backendData if available, otherwise use the item itself
				const backendData = item.backendData || item
				return {
					id: item.id.toString(),
					consumer_id: backendData.consumer_id || backendData.consumer?.id,
					supplier_id: backendData.supplier_id || backendData.supplier?.id,
					status: item.status || backendData.status || 'accepted',
					created_at: backendData.created_at || new Date().toISOString(),
					updated_at: backendData.updated_at || backendData.created_at || new Date().toISOString(),
					consumer: backendData.consumer,
					supplier: backendData.supplier
				}
			})
			setActiveLinks(transformedLinks)
		} catch (error) {
			console.error('Failed to load active links:', error)
			setActiveLinks([])
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		if (activeTab === 'requests') {
			loadLinkRequests()
		} else {
			loadActiveLinks()
		}
	}, [activeTab, loadLinkRequests, loadActiveLinks])

	const handleApprove = async (linkId: string) => {
		if (!permissions.canApproveLinkRequests) {
			alert('You do not have permission to approve link requests')
			return
		}
		try {
			await dataService.updateLinkStatus(parseInt(linkId), 'accepted')
			alert('Link request approved successfully')
			// Refresh both lists since an approved request becomes an active link
			loadLinkRequests()
			loadActiveLinks()
		} catch (error: any) {
			console.error('Failed to approve link request:', error)
			alert(error?.response?.data?.detail || 'Failed to approve link request')
		}
	}

	const handleReject = async (linkId: string) => {
		if (!permissions.canRejectLinkRequests) {
			alert('You do not have permission to reject link requests')
			return
		}
		if (!window.confirm('Are you sure you want to reject this link request?')) {
			return
		}
		try {
			await dataService.updateLinkStatus(parseInt(linkId), 'denied')
			alert('Link request rejected successfully')
			loadLinkRequests()
		} catch (error: any) {
			console.error('Failed to reject link request:', error)
			alert(error?.response?.data?.detail || 'Failed to reject link request')
		}
	}

	const handleBlock = async (linkId: string) => {
		if (!permissions.canBlockLinks) {
			alert('You do not have permission to block links. Only owners and managers can block links.')
			return
		}
		if (!window.confirm('Are you sure you want to block this consumer? They will no longer be able to place orders with you.')) {
			return
		}
		try {
			await dataService.blockLink(parseInt(linkId))
			alert('Consumer blocked successfully')
			// Refresh both lists since a blocked link should be removed from active links
			loadLinkRequests()
			loadActiveLinks()
		} catch (error: any) {
			console.error('Failed to block link:', error)
			alert(error?.response?.data?.detail || 'Failed to block link')
		}
	}

	const handleUnblock = async (linkId: string) => {
		if (!permissions.canBlockLinks) {
			alert('You do not have permission to unblock consumers. Only owners and managers can unblock.')
			return
		}
		if (!window.confirm('Are you sure you want to unblock this consumer? They will be able to place orders with you again.')) {
			return
		}
		try {
			await dataService.unblockLink(parseInt(linkId))
			alert('Consumer unblocked successfully')
			// Refresh both lists since an unblocked consumer becomes an active link
			loadLinkRequests()
			loadActiveLinks()
		} catch (error: any) {
			console.error('Failed to unblock:', error)
			alert(error?.response?.data?.detail || 'Failed to unblock consumer')
		}
	}

	const handleUnlink = async (linkId: string) => {
		if (!permissions.canBlockLinks) {
			alert('You do not have permission to unlink consumers. Only owners and managers can unlink.')
			return
		}
		if (!window.confirm('Are you sure you want to unlink this consumer? The link will be returned to pending status.')) {
			return
		}
		try {
			// Unlink by returning the link status to pending
			await dataService.unlinkConsumer(parseInt(linkId))
			alert('Consumer unlinked successfully. Link status returned to pending.')
			// Refresh both lists since an unlinked consumer should be removed from active links
			loadLinkRequests()
			loadActiveLinks()
		} catch (error: any) {
			console.error('Failed to unlink:', error)
			alert(error?.response?.data?.detail || 'Failed to unlink consumer')
		}
	}

	const getStatusClass = (status: string) => {
		switch (status.toLowerCase()) {
			case 'pending':
				return 'status-pending'
			case 'accepted':
				return 'status-approved'
			case 'denied':
				return 'status-rejected'
			case 'blocked':
				return 'status-rejected'
			default:
				return ''
		}
	}

	const getStatusDisplay = (status: string) => {
		return status.charAt(0).toUpperCase() + status.slice(1)
	}

	return (
		<div>
			<div className="header">
				<h1>Link Management</h1>
				<p>Manage consumer connection requests and active business relationships</p>
			</div>

			{/* Tab Navigation */}
			<div
				className="tab-navigation"
				style={{ marginBottom: '20px' }}
			>
				<button
					className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
					onClick={() => {
						setActiveTab('requests')
						setCurrentPage(1)
						setStatusFilter('all')
					}}
					style={{
						padding: '10px 20px',
						border: '1px solid #ddd',
						backgroundColor: activeTab === 'requests' ? '#007bff' : 'white',
						color: activeTab === 'requests' ? 'white' : '#333',
						cursor: 'pointer'
					}}
				>
					Incoming Requests
				</button>
				<button
					className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
					onClick={() => {
						setActiveTab('active')
						setCurrentPage(1)
					}}
					style={{
						padding: '10px 20px',
						border: '1px solid #ddd',
						backgroundColor: activeTab === 'active' ? '#007bff' : 'white',
						color: activeTab === 'active' ? 'white' : '#333',
						cursor: 'pointer'
					}}
				>
					Active Links ({activeLinks.length})
				</button>
			</div>

			{/* Incoming Requests Tab */}
			{activeTab === 'requests' && (
				<div>
					{/* Filters */}
					<div
						style={{
							display: 'flex',
							gap: '15px',
							marginBottom: '20px',
							alignItems: 'center'
						}}
					>
						<select
							value={statusFilter}
							onChange={(e) => {
								setStatusFilter(e.target.value as typeof statusFilter)
								setCurrentPage(1)
							}}
							className="status-filter"
						>
							<option value="all">All Status</option>
							<option value="pending">Pending</option>
							<option value="accepted">Accepted</option>
							<option value="denied">Denied</option>
							<option value="blocked">Blocked</option>
						</select>
					</div>

					{isLoading ? (
						<div className="loading">Loading link requests...</div>
					) : (
						<div className="table-container">
							<div className="table-header">
								<h2>
									Connection Requests ({linkRequests.length}){statusFilter !== 'all' && ` - ${getStatusDisplay(statusFilter)}`}
								</h2>
							</div>

							<table>
								<thead>
									<tr>
										<th>Consumer</th>
										<th>Organization</th>
										<th>Date</th>
										<th>Status</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{linkRequests.length === 0 ? (
										<tr>
											<td
												colSpan={5}
												style={{ textAlign: 'center', padding: '40px' }}
											>
												{statusFilter === 'all' ? 'No link requests found' : `No ${statusFilter} link requests found`}
											</td>
										</tr>
									) : (
										linkRequests.map((request) => (
											<React.Fragment key={request.id}>
												<tr>
													<td>
														<div style={{ fontWeight: '500' }}>{request.requester}</div>
													</td>
													<td>{request.organization}</td>
													<td>{request.date}</td>
													<td className={getStatusClass(request.status)}>{getStatusDisplay(request.status)}</td>
													<td>
														{request.status === 'pending' ? (
															<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
																<button
																	className="btn btn-primary"
																	onClick={() => handleApprove(request.id)}
																	style={{ fontSize: '12px', padding: '6px 12px' }}
																>
																	✓ Approve
																</button>
																<button
																	className="btn btn-outline"
																	onClick={() => handleReject(request.id)}
																	style={{
																		fontSize: '12px',
																		padding: '6px 12px',
																		color: '#ef4444',
																		borderColor: '#ef4444'
																	}}
																>
																	✗ Reject
																</button>
															</div>
														) : request.status === 'accepted' && permissions.canBlockLinks ? (
															<button
																className="btn btn-outline"
																onClick={() => handleBlock(request.id)}
																style={{
																	fontSize: '12px',
																	padding: '6px 12px',
																	color: '#ff9800',
																	borderColor: '#ff9800'
																}}
															>
																Block
															</button>
														) : request.status === 'blocked' && permissions.canBlockLinks ? (
															<button
																className="btn btn-primary"
																onClick={() => handleUnblock(request.id)}
																style={{
																	fontSize: '12px',
																	padding: '6px 12px'
																}}
															>
																Unblock
															</button>
														) : (
															<span style={{ color: '#666' }}>{getStatusDisplay(request.status)}</span>
														)}
													</td>
												</tr>
											</React.Fragment>
										))
									)}
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
					)}
				</div>
			)}

			{/* Active Links Tab */}
			{activeTab === 'active' && (
				<div>
					{isLoading ? (
						<div className="loading">Loading active links...</div>
					) : (
						<div className="table-container">
							<div className="table-header">
								<h2>Active Business Relationships ({activeLinks.length})</h2>
								<p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
									These are consumers with accepted link requests who can place orders with you.
								</p>
							</div>

							<table>
								<thead>
									<tr>
										<th>Consumer</th>
										<th>Organization</th>
										<th>Email</th>
										<th>Linked Since</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{activeLinks.length === 0 ? (
										<tr>
											<td
												colSpan={5}
												style={{ textAlign: 'center', padding: '40px' }}
											>
												No active links found. Approved link requests will appear here.
											</td>
										</tr>
									) : (
										activeLinks.map((link) => {
											const consumer = (link.consumer as any) || {}
											const consumerName = consumer.user
												? `${consumer.user.first_name || ''} ${consumer.user.last_name || ''}`.trim()
												: consumer.organization_name || `Consumer ${link.consumer_id}`
											const consumerEmail = consumer.user?.email || 'N/A'
											const organization = consumer.organization_name || 'N/A'
											const linkedDate = new Date(link.created_at).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
												day: 'numeric'
											})

											return (
												<tr key={link.id}>
													<td style={{ fontWeight: '500' }}>{consumerName}</td>
													<td>{organization}</td>
													<td>{consumerEmail}</td>
													<td>{linkedDate}</td>
													<td>
														{permissions.canBlockLinks && (
															<div style={{ display: 'flex', gap: '8px' }}>
																<button
																	className="btn btn-outline"
																	onClick={() => handleBlock(link.id)}
																	style={{
																		fontSize: '12px',
																		padding: '6px 12px',
																		color: '#ff9800',
																		borderColor: '#ff9800'
																	}}
																>
																	Block
																</button>
																<button
																	className="btn btn-outline"
																	onClick={() => handleUnlink(link.id)}
																	style={{
																		fontSize: '12px',
																		padding: '6px 12px',
																		color: '#ef4444',
																		borderColor: '#ef4444'
																	}}
																>
																	Unlink
																</button>
															</div>
														)}
														{!permissions.canBlockLinks && <span style={{ color: '#666', fontSize: '14px' }}>View only</span>}
													</td>
												</tr>
											)
										})
									)}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default LinkManagement
