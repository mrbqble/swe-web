import React, { useState, useEffect, useCallback } from 'react'
import { dataService } from '../services/dataService'
import { LinkRequest } from '../types'
import { usePermissions } from '../hooks/usePermissions'

const LinkManagement: React.FC = () => {
	const permissions = usePermissions()
	const [allLinks, setAllLinks] = useState<LinkRequest[]>([])
	const [filteredLinks, setFilteredLinks] = useState<LinkRequest[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'denied' | 'blocked' | 'unlinked'>('all')
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const itemsPerPage = 20

	const loadAllLinks = useCallback(async () => {
		try {
			setIsLoading(true)
			// Fetch all links without status filter - we'll filter on frontend
			const response = await dataService.getIncomingLinks(1, 1000) // Fetch large number to get all

			setAllLinks(response.items)
		} catch (error) {
			console.error('Failed to load link requests:', error)
			alert('Failed to load link requests')
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Filter links by status on frontend
	useEffect(() => {
		let filtered = allLinks
		if (statusFilter !== 'all') {
			filtered = allLinks.filter((item) => item.status === statusFilter)
		}

		// Apply pagination
		const startIndex = (currentPage - 1) * itemsPerPage
		const endIndex = startIndex + itemsPerPage
		const paginated = filtered.slice(startIndex, endIndex)

		setFilteredLinks(paginated)
		setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)))
	}, [allLinks, statusFilter, currentPage, itemsPerPage])

	useEffect(() => {
		loadAllLinks()
	}, [loadAllLinks])

	const handleApprove = async (linkId: string) => {
		if (!permissions.canApproveLinkRequests) {
			alert('You do not have permission to approve link requests')
			return
		}
		try {
			await dataService.updateLinkStatus(parseInt(linkId), 'accepted')
			alert('Link request approved successfully')
			// Refresh the list
			loadAllLinks()
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
			loadAllLinks()
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
			// Refresh the list
			loadAllLinks()
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
			// Refresh the list
			loadAllLinks()
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
		if (!window.confirm('Are you sure you want to unlink this consumer? The link will be marked as unlinked.')) {
			return
		}
		try {
			// Unlink by setting the link status to unlinked
			await dataService.unlinkConsumer(parseInt(linkId))
			alert('Consumer unlinked successfully.')
			// Refresh the list
			loadAllLinks()
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
			case 'unlinked':
				return 'status-pending'
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
							setCurrentPage(1) // Reset to first page when filter changes
						}}
						className="status-filter"
					>
						<option value="all">All Status</option>
						<option value="pending">Pending</option>
						<option value="accepted">Accepted</option>
						<option value="denied">Denied</option>
						<option value="blocked">Blocked</option>
						<option value="unlinked">Unlinked</option>
					</select>
				</div>

				{isLoading ? (
					<div className="loading">Loading link requests...</div>
				) : (
					<div className="table-container">
						<div className="table-header">
							<h2>
								All Link Requests ({statusFilter === 'all' ? allLinks.length : filteredLinks.length})
								{statusFilter !== 'all' && ` - ${getStatusDisplay(statusFilter)}`}
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
								{filteredLinks.length === 0 ? (
									<tr>
										<td
											colSpan={5}
											style={{ textAlign: 'center', padding: '40px' }}
										>
											{statusFilter === 'all' ? 'No link requests found' : `No ${statusFilter} link requests found`}
										</td>
									</tr>
								) : (
									filteredLinks.map((request) => (
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
														<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
															<button
																className="btn btn-outline"
																onClick={() => handleUnlink(request.id)}
																style={{
																	fontSize: '12px',
																	padding: '6px 12px',
																	color: '#ef4444',
																	borderColor: '#ef4444'
																}}
															>
																Unlink
															</button>
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
														</div>
													) : request.status === 'accepted' ? (
														<span style={{ color: '#666' }}>{getStatusDisplay(request.status)}</span>
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
													) : (request.status === 'denied' || request.status === 'unlinked') && permissions.canApproveLinkRequests ? (
														<button
															className="btn btn-primary"
															onClick={() => handleApprove(request.id)}
															style={{
																fontSize: '12px',
																padding: '6px 12px'
															}}
														>
															✓ Accept
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
		</div>
	)
}

export default LinkManagement
