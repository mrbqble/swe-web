import React, { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { dataService } from '../services/dataService'

const Dashboard: React.FC = () => {
	const { user } = useAuth()
	const [pendingLinkRequests, setPendingLinkRequests] = useState<number>(0)
	const [openOrders, setOpenOrders] = useState<number>(0)
	const [openComplaints, setOpenComplaints] = useState<number>(0)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const loadStats = async () => {
			try {
				setIsLoading(true)

				// Fetch pending link requests
				const linkRequestsResponse = await dataService.getIncomingLinks(1, 1, 'pending')
				setPendingLinkRequests(linkRequestsResponse.total || 0)

				// Fetch open orders (pending, accepted, in_progress)
				const pendingOrdersResponse = await dataService.getOrders(1, 1, 'pending')
				const acceptedOrdersResponse = await dataService.getOrders(1, 1, 'accepted')
				const inProgressOrdersResponse = await dataService.getOrders(1, 1, 'in_progress')
				setOpenOrders((pendingOrdersResponse.total || 0) + (acceptedOrdersResponse.total || 0) + (inProgressOrdersResponse.total || 0))

				// Fetch open complaints (open, escalated)
				const openComplaintsResponse = await dataService.getComplaints(1, 1, 'open')
				const escalatedComplaintsResponse = await dataService.getComplaints(1, 1, 'escalated')
				setOpenComplaints((openComplaintsResponse.total || 0) + (escalatedComplaintsResponse.total || 0))
			} catch (error) {
				console.error('Failed to load dashboard stats:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadStats()
	}, [])

	const welcomeMessage = user
		? `Welcome back, ${user.firstName}! Here's what's happening with your business today.`
		: "Welcome back! Here's what's happening with your business today."

	return (
		<div>
			<div className="header">
				<h1>Dashboard</h1>
				<p>{welcomeMessage}</p>
			</div>

			{/* Stats Grid */}
			<div className="stats-grid">
				<div className="stat-card">
					<div>Pending Link Requests</div>
					<div className="stat-number">{isLoading ? '...' : pendingLinkRequests}</div>
				</div>
				<div className="stat-card">
					<div>Open Orders</div>
					<div className="stat-number">{isLoading ? '...' : openOrders}</div>
				</div>
				<div className="stat-card">
					<div>Open Complaints</div>
					<div className="stat-number">{isLoading ? '...' : openComplaints}</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard
