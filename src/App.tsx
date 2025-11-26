import React, { useState, useEffect } from 'react'
import LinkRequests from './components/LinkRequests'
import LinkManagement from './components/LinkManagement'
import Orders from './components/Orders'
import Complaints from './components/Complaints'
import Chat from './components/Chat'
import Settings from './components/Settings'
import CatalogManagement from './components/CatalogManagement'
import Login from './components/Login'
import ToastHost from './components/ToastHost'
import { useAuth } from './components/AuthContext'
import { isSupplierStaff, getRoleDisplayName } from './utils/permissions'
import { usePermissions } from './hooks/usePermissions'
import { useLanguage } from './hooks/useLanguage'
import { t } from './utils/i18n'

type Page = 'link-requests' | 'orders' | 'complaints' | 'chat' | 'settings' | 'catalog'

// Access Denied component
const AccessDenied: React.FC<{ message: string }> = ({ message }) => (
	<div style={{ padding: '40px', textAlign: 'center' }}>
		<h2>{t('common.accessDenied')}</h2>
		<p style={{ color: '#666', marginTop: '10px' }}>{message}</p>
	</div>
)

function AppContent() {
	const { user, logout, isLoading } = useAuth()
	const permissions = usePermissions()
	const { language, changeLanguage } = useLanguage()
	const [currentPage, setCurrentPage] = useState<Page>('orders')
	const [chatContext, setChatContext] = useState<{ consumerId?: number } | null>(null)

	// Set document language on mount and language change
	useEffect(() => {
		document.documentElement.lang = language
	}, [language])

	if (isLoading) {
		return (
			<div className="loading-container">
				<div className="loading-spinner">{t('common.loading', language)}</div>
			</div>
		)
	}

	if (!user) {
		return <Login />
	}

	// Enforce supplier staff only access
	if (!isSupplierStaff(user.role)) {
		return (
			<div className="loading-container">
				<div style={{ textAlign: 'center', padding: '40px' }}>
					<h2>{t('common.accessDenied', language)}</h2>
					<p>{t('common.supplierOnly', language)}</p>
					<button
						onClick={logout}
						className="btn btn-primary"
						style={{ marginTop: '20px' }}
					>
						{t('auth.logout', language)}
					</button>
				</div>
			</div>
		)
	}

	const renderPage = () => {
		// Enforce page-level access control
		switch (currentPage) {
			case 'link-requests':
				if (!permissions.canAccessLinkRequests) {
					return <AccessDenied message={t('linkManagement.title') + ' - ' + t('common.accessDenied')} />
				}
				return <LinkManagement />
			case 'orders':
				if (!permissions.canAccessOrders) {
					return <AccessDenied message={t('orders.title') + ' - ' + t('common.accessDenied')} />
				}
				return <Orders />
			case 'complaints':
				if (!permissions.canAccessComplaints) {
					return <AccessDenied message={t('complaints.title') + ' - ' + t('common.accessDenied')} />
				}
				return <Complaints />
			case 'chat':
				if (!permissions.canAccessChat) {
					return <AccessDenied message={t('chat.title') + ' - ' + t('common.accessDenied')} />
				}
				return <Chat consumerId={chatContext?.consumerId} onContextClear={() => setChatContext(null)} />
			case 'settings':
				if (!permissions.canAccessSettings) {
					return <AccessDenied message={t('settings.title') + ' - ' + t('common.accessDenied')} />
				}
				return <Settings />
			case 'catalog':
				if (!permissions.canManageProducts) {
					return <AccessDenied message={t('catalog.title') + ' - ' + t('common.accessDenied')} />
				}
				return <CatalogManagement />
			default:
				return <Orders />
		}
	}

	// Navigate to chat with consumer context
	const navigateToChat = (consumerId: number) => {
		if (permissions.canAccessChat) {
			setChatContext({ consumerId })
			setCurrentPage('chat')
		}
	}

	// Expose navigateToChat globally for OrderDetail to use
	;(window as any).navigateToChat = navigateToChat

	// Redirect to orders if trying to access unauthorized page
	const handlePageChange = (page: Page) => {
		let targetPage = page

		// Check permissions before allowing navigation
		switch (page) {
			case 'link-requests':
				if (!permissions.canAccessLinkRequests) {
					targetPage = 'orders'
				}
				break
			case 'orders':
				if (!permissions.canAccessOrders) {
					targetPage = 'orders'
				}
				break
			case 'complaints':
				if (!permissions.canAccessComplaints) {
					targetPage = 'orders'
				}
				break
			case 'chat':
				if (!permissions.canAccessChat) {
					targetPage = 'orders'
				}
				break
			case 'settings':
				if (!permissions.canAccessSettings) {
					targetPage = 'orders'
				}
				break
			case 'catalog':
				if (!permissions.canManageProducts) {
					targetPage = 'orders'
				}
				break
		}

		setCurrentPage(targetPage)
		// Clear chat context when navigating away from chat
		if (targetPage !== 'chat') {
			setChatContext(null)
		}
	}

	return (
		<div className="container">
			{/* Sidebar */}
			<div className="sidebar">
				<div className="sidebar-header">
					<h1>SupplyKZ</h1>
					<div className="user-info">
						<div className="user-avatar">
							{user.companyLogo ? (
								<img
									src={`data:image/png;base64,${user.companyLogo}`}
									alt={user.name}
									style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
								/>
							) : (
								user.avatar
							)}
						</div>
						<div className="user-details">
							<div className="user-name">{user.name}</div>
							<div className="user-role">{getRoleDisplayName(user.role)}</div>
						</div>
					</div>
					<div style={{ marginTop: '12px' }}>
						<label
							style={{
								fontSize: '12px',
								color: '#ccc',
								display: 'block',
								marginBottom: '4px'
							}}
						>
							{t('settings.language', language)}
						</label>
						<select
							value={language}
							onChange={(e) => changeLanguage(e.target.value as any)}
							style={{
								width: '100%',
								padding: '6px 8px',
								borderRadius: '4px',
								border: '1px solid #444',
								backgroundColor: '#1a1a1a',
								color: '#fff',
								fontSize: '12px'
							}}
						>
							<option value="en">{t('settings.english', language)}</option>
							<option value="ru">{t('settings.russian', language)}</option>
						</select>
					</div>
				</div>
				<ul className="sidebar-nav">
					{permissions.canAccessLinkRequests && (
						<li
							className={currentPage === 'link-requests' ? 'active' : ''}
							onClick={() => handlePageChange('link-requests')}
						>
							{t('linkManagement.title', language)}
						</li>
					)}
					{permissions.canAccessOrders && (
						<li
							className={currentPage === 'orders' ? 'active' : ''}
							onClick={() => handlePageChange('orders')}
						>
							{t('orders.title', language)}
						</li>
					)}
					{permissions.canAccessComplaints && (
						<li
							className={currentPage === 'complaints' ? 'active' : ''}
							onClick={() => handlePageChange('complaints')}
						>
							{t('complaints.title', language)}
						</li>
					)}
					{permissions.canAccessChat && (
						<li
							className={currentPage === 'chat' ? 'active' : ''}
							onClick={() => handlePageChange('chat')}
						>
							{t('chat.title', language)}
						</li>
					)}
					{permissions.canManageProducts && (
						<li
							className={currentPage === 'catalog' ? 'active' : ''}
							onClick={() => handlePageChange('catalog')}
						>
							{t('catalog.title', language)}
						</li>
					)}
					{permissions.canAccessSettings && (
						<li
							className={currentPage === 'settings' ? 'active' : ''}
							onClick={() => handlePageChange('settings')}
						>
							{t('settings.title', language)}
						</li>
					)}
					<li
						onClick={logout}
						className="logout-button"
					>
						{t('auth.logout', language)}
					</li>
				</ul>
			</div>

			{/* Main Content */}
			<div className="main-content">{renderPage()}</div>
		</div>
	)
}

// Main App component that doesn't use hooks directly
function App() {
	return (
		<>
			<AppContent />
			<ToastHost />
		</>
	)
}

export default App
