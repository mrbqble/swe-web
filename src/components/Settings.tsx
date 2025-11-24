import React, { useState, useEffect, useCallback } from 'react'
import { Manager, Supplier } from '../types'
import { dataService } from '../services/dataService'
import { usePermissions } from '../hooks/usePermissions'
import { useLanguage } from '../hooks/useLanguage'
import { t } from '../utils/i18n'

const Settings: React.FC = () => {
	const permissions = usePermissions()
	const { language, changeLanguage } = useLanguage()
	const [activeTab, setActiveTab] = useState<'profile' | 'managers' | 'account' | 'localization'>('profile')
	const [managers, setManagers] = useState<Manager[]>([])
	const [suppliers, setSuppliers] = useState<Supplier[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const [newManager, setNewManager] = useState({
		name: '',
		email: '',
		role: 'sales' as 'manager' | 'sales'
	})

	const [newSupplier, setNewSupplier] = useState({
		name: '',
		companyName: '',
		email: '',
		isActive: true
	})

	const [supplierProfile, setSupplierProfile] = useState({
		company_name: '',
		is_active: true
	})

	const [userProfile, setUserProfile] = useState({
		email: '',
		first_name: '',
		last_name: ''
	})

	const [passwordData, setPasswordData] = useState({
		current_password: '',
		new_password: '',
		confirm_password: ''
	})

	const [isEditingProfile, setIsEditingProfile] = useState(false)
	const [isEditingUserProfile, setIsEditingUserProfile] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [profileError, setProfileError] = useState<string | null>(null)
	const [passwordError, setPasswordError] = useState<string | null>(null)
	const [passwordSuccess, setPasswordSuccess] = useState(false)

	const isOwner = permissions.canManageTeam

	const loadData = useCallback(async () => {
		try {
			setIsLoading(true)
			if (isOwner) {
				const [managersData, supplierData, userData] = await Promise.all([
					dataService.getManagers(),
					dataService.getSupplierProfile().catch(() => null),
					dataService.getUserProfile().catch(() => null)
				])
				setManagers(managersData)
				if (supplierData) {
					setSupplierProfile({
						company_name: supplierData.company_name || '',
						is_active: supplierData.is_active ?? true
					})
				}
				if (userData) {
					setUserProfile({
						email: userData.email || '',
						first_name: userData.first_name || '',
						last_name: userData.last_name || ''
					})
				}
			} else {
				const managersData = await dataService.getManagers()
				setManagers(managersData)
				const userData = await dataService.getUserProfile().catch(() => null)
				if (userData) {
					setUserProfile({
						email: userData.email || '',
						first_name: userData.first_name || '',
						last_name: userData.last_name || ''
					})
				}
			}
		} catch (error) {
			console.error('Failed to load data:', error)
		} finally {
			setIsLoading(false)
		}
	}, [isOwner])

	useEffect(() => {
		loadData()
	}, [loadData])

	const handleAddManager = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!permissions.canManageTeam) {
			alert('You do not have permission to manage team members')
			return
		}

		try {
			await dataService.addManager(newManager)
			alert('Staff member creation should be done via user registration. Please contact support to add new team members.')
			setNewManager({ name: '', email: '', role: 'sales' })
		} catch (error: any) {
			console.error('Failed to add manager:', error)
			alert(error.message || 'Failed to add team member. Staff creation should be done via user registration.')
		}
	}

	const handleUpdateSupplierProfile = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			setProfileError(null)
			await dataService.updateSupplierProfile(supplierProfile)
			setIsEditingProfile(false)
			alert('Supplier profile updated successfully')
			loadData()
		} catch (error: any) {
			console.error('Failed to update supplier profile:', error)
			setProfileError(error.response?.data?.detail || 'Failed to update supplier profile')
		}
	}

	const handleUpdateUserProfile = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			setProfileError(null)
			await dataService.updateUserProfile(userProfile)
			setIsEditingUserProfile(false)
			alert('Profile updated successfully')
			loadData()
		} catch (error: any) {
			console.error('Failed to update user profile:', error)
			setProfileError(error.response?.data?.detail || 'Failed to update profile')
		}
	}

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault()
		if (passwordData.new_password !== passwordData.confirm_password) {
			setPasswordError('New passwords do not match')
			return
		}
		if (passwordData.new_password.length < 8) {
			setPasswordError('Password must be at least 8 characters long')
			return
		}

		try {
			setPasswordError(null)
			await dataService.changePassword(passwordData.current_password, passwordData.new_password)
			setPasswordSuccess(true)
			setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
			setTimeout(() => setPasswordSuccess(false), 3000)
		} catch (error: any) {
			console.error('Failed to change password:', error)
			setPasswordError(error.response?.data?.detail || 'Failed to change password')
		}
	}

	const handleDeleteManager = async (id: string) => {
		if (!permissions.canManageTeam) {
			alert('You do not have permission to delete team members')
			return
		}

		if (window.confirm('Are you sure you want to delete this team member?')) {
			try {
				await dataService.deleteManager(id)
				setManagers(managers.filter((m) => m.id !== id))
			} catch (error) {
				console.error('Failed to delete manager:', error)
				alert('Failed to delete team member')
			}
		}
	}

	const handleAddSupplier = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!permissions.canManageSuppliers) {
			alert('You do not have permission to manage suppliers')
			return
		}

		try {
			const supplier = await dataService.createSupplier(newSupplier)
			setSuppliers([...suppliers, supplier])
			setNewSupplier({ name: '', companyName: '', email: '', isActive: true })
		} catch (error) {
			console.error('Failed to add supplier:', error)
			alert('Failed to add supplier')
		}
	}

	if (isLoading) {
		return (
			<div>
				<div className="header">
					<h1>Settings</h1>
					<p>Manage your team and settings</p>
				</div>
				<div className="loading">Loading...</div>
			</div>
		)
	}

	return (
		<div>
			<div className="header">
				<h1>Settings</h1>
				<p>Manage your team and settings</p>
			</div>

			{/* Tab Navigation */}
			{isOwner && (
				<div
					className="tab-navigation"
					style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}
				>
					<button
						className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
						onClick={() => setActiveTab('profile')}
						style={{
							padding: '10px 20px',
							border: '1px solid #ddd',
							backgroundColor: activeTab === 'profile' ? '#007bff' : 'white',
							color: activeTab === 'profile' ? 'white' : '#333',
							cursor: 'pointer',
							borderRadius: '4px'
						}}
					>
						Supplier Profile
					</button>
					<button
						className={`tab-button ${activeTab === 'managers' ? 'active' : ''}`}
						onClick={() => setActiveTab('managers')}
						style={{
							padding: '10px 20px',
							border: '1px solid #ddd',
							backgroundColor: activeTab === 'managers' ? '#007bff' : 'white',
							color: activeTab === 'managers' ? 'white' : '#333',
							cursor: 'pointer',
							borderRadius: '4px'
						}}
					>
						Team Management
					</button>
					<button
						className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
						onClick={() => setActiveTab('account')}
						style={{
							padding: '10px 20px',
							border: '1px solid #ddd',
							backgroundColor: activeTab === 'account' ? '#007bff' : 'white',
							color: activeTab === 'account' ? 'white' : '#333',
							cursor: 'pointer',
							borderRadius: '4px'
						}}
					>
						Account Settings
					</button>
				</div>
			)}

			{/* Supplier Profile Tab */}
			{activeTab === 'profile' && isOwner && (
				<div className="profile-section">
					<div className="section-header">
						<h2>Supplier Profile</h2>
						<div style={{ color: '#666' }}>Manage your supplier company information</div>
					</div>

					{profileError && (
						<div
							style={{
								backgroundColor: '#f8d7da',
								border: '1px solid #f5c6cb',
								color: '#721c24',
								padding: '12px',
								borderRadius: '4px',
								marginBottom: '20px'
							}}
						>
							{profileError}
						</div>
					)}

					{!isEditingProfile ? (
						<div
							style={{
								backgroundColor: 'white',
								padding: '20px',
								borderRadius: '8px',
								border: '1px solid #ddd'
							}}
						>
							<div style={{ marginBottom: '15px' }}>
								<strong>Company Name:</strong> {supplierProfile.company_name || 'Not set'}
							</div>
							<div style={{ marginBottom: '15px' }}>
								<strong>Status:</strong>{' '}
								<span className={`status-badge ${supplierProfile.is_active ? 'status-completed' : 'status-rejected'}`}>
									{supplierProfile.is_active ? 'Active' : 'Inactive'}
								</span>
							</div>
							<button
								className="btn btn-primary"
								onClick={() => setIsEditingProfile(true)}
							>
								Edit Profile
							</button>
						</div>
					) : (
						<form onSubmit={handleUpdateSupplierProfile}>
							<div
								style={{
									backgroundColor: 'white',
									padding: '20px',
									borderRadius: '8px',
									border: '1px solid #ddd'
								}}
							>
								<div
									className="form-group"
									style={{ marginBottom: '15px' }}
								>
									<label>Company Name *</label>
									<input
										type="text"
										value={supplierProfile.company_name}
										onChange={(e) =>
											setSupplierProfile({
												...supplierProfile,
												company_name: e.target.value
											})
										}
										required
										style={{ width: '100%', padding: '8px' }}
									/>
								</div>
								<div
									className="form-group"
									style={{ marginBottom: '15px' }}
								>
									<label>Status</label>
									<select
										value={supplierProfile.is_active.toString()}
										onChange={(e) =>
											setSupplierProfile({
												...supplierProfile,
												is_active: e.target.value === 'true'
											})
										}
										style={{ width: '100%', padding: '8px' }}
									>
										<option value="true">Active</option>
										<option value="false">Inactive</option>
									</select>
								</div>
								<div style={{ display: 'flex', gap: '10px' }}>
									<button
										type="submit"
										className="btn btn-primary"
									>
										Save Changes
									</button>
									<button
										type="button"
										className="btn btn-outline"
										onClick={() => {
											setIsEditingProfile(false)
											setProfileError(null)
											loadData()
										}}
									>
										Cancel
									</button>
								</div>
							</div>
						</form>
					)}
				</div>
			)}

			{/* Team Management Tab */}
			{activeTab === 'managers' && (
				<div className="managers-section">
					<div className="section-header">
						<h2>Team Management</h2>
						<div style={{ color: '#666' }}>{isOwner ? 'Add and remove team members from your organization' : 'View organization team members'}</div>
					</div>

					<div style={{ marginBottom: '20px' }}>
						<h3 style={{ marginBottom: '10px' }}>Sales Representatives</h3>
					</div>

					{/* Add Manager Form - Only for Owner */}
					{permissions.canManageTeam && (
						<form
							onSubmit={handleAddManager}
							className="add-manager-form"
						>
							<h4>Add New Team Member</h4>
							<div
								style={{
									display: 'flex',
									gap: '15px',
									alignItems: 'flex-end',
									marginBottom: '20px'
								}}
							>
								<div
									className="form-group"
									style={{ flex: 1 }}
								>
									<label>Name</label>
									<input
										type="text"
										value={newManager.name}
										onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
										required
										style={{ width: '100%' }}
									/>
								</div>
								<div
									className="form-group"
									style={{ flex: 1 }}
								>
									<label>Email</label>
									<input
										type="email"
										value={newManager.email}
										onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
										required
										style={{ width: '100%' }}
									/>
								</div>
								<div className="form-group">
									<label>Role</label>
									<select
										value={newManager.role}
										onChange={(e) =>
											setNewManager({
												...newManager,
												role: e.target.value as 'manager' | 'sales'
											})
										}
										style={{ width: '120px' }}
									>
										<option value="sales">Sales</option>
										<option value="manager">Manager</option>
									</select>
								</div>
								<button
									type="submit"
									className="btn btn-primary"
								>
									Add Member
								</button>
							</div>
						</form>
					)}

					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Role</th>
								<th>Created</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{managers.map((manager) => (
								<tr key={manager.id}>
									<td style={{ fontWeight: '500' }}>{manager.name}</td>
									<td>{manager.email}</td>
									<td>
										<span className={`role-badge ${manager.role === 'manager' ? 'role-manager' : 'role-sales'}`}>
											{manager.role.charAt(0).toUpperCase() + manager.role.slice(1)}
										</span>
									</td>
									<td>{manager.created}</td>
									<td>
										<div style={{ display: 'flex', gap: '5px' }}>
											{permissions.canManageTeam && (
												<>
													<button
														className="btn btn-outline"
														onClick={async () => {
															if (window.confirm(`Are you sure you want to deactivate ${manager.name}?`)) {
																try {
																	await dataService.deactivateStaffMember(manager.id)
																	alert('Staff member deactivated successfully')
																	loadData()
																} catch (error) {
																	console.error('Failed to deactivate staff:', error)
																	alert('Failed to deactivate staff member')
																}
															}
														}}
														style={{
															color: '#ff9800',
															borderColor: '#ff9800'
														}}
													>
														Deactivate
													</button>
													<button
														className="btn btn-outline"
														onClick={() => handleDeleteManager(manager.id)}
														style={{
															color: '#ef4444',
															borderColor: '#ef4444'
														}}
													>
														Delete
													</button>
												</>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{!permissions.canManageTeam && (
						<div
							style={{
								marginTop: '20px',
								padding: '15px',
								backgroundColor: '#f8f9fa',
								borderRadius: '6px',
								color: '#666',
								textAlign: 'center'
							}}
						>
							Only owners can add or remove team members.
						</div>
					)}
				</div>
			)}

			{/* Account Settings Tab */}
			{activeTab === 'account' && (
				<div className="account-section">
					<div className="section-header">
						<h2>Account Settings</h2>
						<div style={{ color: '#666' }}>Manage your account information and security</div>
					</div>

					{/* User Profile Section */}
					<div
						style={{
							backgroundColor: 'white',
							padding: '20px',
							borderRadius: '8px',
							border: '1px solid #ddd',
							marginBottom: '30px'
						}}
					>
						<h3 style={{ marginTop: 0, marginBottom: '15px' }}>Profile Information</h3>
						{profileError && (
							<div
								style={{
									backgroundColor: '#f8d7da',
									border: '1px solid #f5c6cb',
									color: '#721c24',
									padding: '12px',
									borderRadius: '4px',
									marginBottom: '15px'
								}}
							>
								{profileError}
							</div>
						)}
						{!isEditingUserProfile ? (
							<div>
								<div style={{ marginBottom: '10px' }}>
									<strong>Email:</strong> {userProfile.email}
								</div>
								<div style={{ marginBottom: '10px' }}>
									<strong>First Name:</strong> {userProfile.first_name}
								</div>
								<div style={{ marginBottom: '15px' }}>
									<strong>Last Name:</strong> {userProfile.last_name}
								</div>
								<button
									className="btn btn-primary"
									onClick={() => setIsEditingUserProfile(true)}
								>
									Edit Profile
								</button>
							</div>
						) : (
							<form onSubmit={handleUpdateUserProfile}>
								<div
									className="form-group"
									style={{ marginBottom: '15px' }}
								>
									<label>Email *</label>
									<input
										type="email"
										value={userProfile.email}
										onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
										required
										style={{ width: '100%', padding: '8px' }}
									/>
								</div>
								<div
									className="form-group"
									style={{ marginBottom: '15px' }}
								>
									<label>First Name *</label>
									<input
										type="text"
										value={userProfile.first_name}
										onChange={(e) => setUserProfile({ ...userProfile, first_name: e.target.value })}
										required
										style={{ width: '100%', padding: '8px' }}
									/>
								</div>
								<div
									className="form-group"
									style={{ marginBottom: '15px' }}
								>
									<label>Last Name *</label>
									<input
										type="text"
										value={userProfile.last_name}
										onChange={(e) => setUserProfile({ ...userProfile, last_name: e.target.value })}
										required
										style={{ width: '100%', padding: '8px' }}
									/>
								</div>
								<div style={{ display: 'flex', gap: '10px' }}>
									<button
										type="submit"
										className="btn btn-primary"
									>
										Save Changes
									</button>
									<button
										type="button"
										className="btn btn-outline"
										onClick={() => {
											setIsEditingUserProfile(false)
											setProfileError(null)
											loadData()
										}}
									>
										Cancel
									</button>
								</div>
							</form>
						)}
					</div>

					{/* Password Change Section */}
					<div
						style={{
							backgroundColor: 'white',
							padding: '20px',
							borderRadius: '8px',
							border: '1px solid #ddd',
							marginBottom: '30px'
						}}
					>
						<h3 style={{ marginTop: 0, marginBottom: '15px' }}>Change Password</h3>
						{passwordError && (
							<div
								style={{
									backgroundColor: '#f8d7da',
									border: '1px solid #f5c6cb',
									color: '#721c24',
									padding: '12px',
									borderRadius: '4px',
									marginBottom: '15px'
								}}
							>
								{passwordError}
							</div>
						)}
						{passwordSuccess && (
							<div
								style={{
									backgroundColor: '#d4edda',
									border: '1px solid #c3e6cb',
									color: '#155724',
									padding: '12px',
									borderRadius: '4px',
									marginBottom: '15px'
								}}
							>
								Password changed successfully!
							</div>
						)}
						<form onSubmit={handleChangePassword}>
							<div
								className="form-group"
								style={{ marginBottom: '15px' }}
							>
								<label>Current Password *</label>
								<input
									type="password"
									value={passwordData.current_password}
									onChange={(e) =>
										setPasswordData({
											...passwordData,
											current_password: e.target.value
										})
									}
									required
									style={{ width: '100%', padding: '8px' }}
								/>
							</div>
							<div
								className="form-group"
								style={{ marginBottom: '15px' }}
							>
								<label>New Password *</label>
								<input
									type="password"
									value={passwordData.new_password}
									onChange={(e) =>
										setPasswordData({
											...passwordData,
											new_password: e.target.value
										})
									}
									required
									minLength={8}
									style={{ width: '100%', padding: '8px' }}
								/>
								<small style={{ color: '#666' }}>Password must be at least 8 characters long</small>
							</div>
							<div
								className="form-group"
								style={{ marginBottom: '15px' }}
							>
								<label>Confirm New Password *</label>
								<input
									type="password"
									value={passwordData.confirm_password}
									onChange={(e) =>
										setPasswordData({
											...passwordData,
											confirm_password: e.target.value
										})
									}
									required
									minLength={8}
									style={{ width: '100%', padding: '8px' }}
								/>
							</div>
							<button
								type="submit"
								className="btn btn-primary"
							>
								Change Password
							</button>
						</form>
					</div>

					{/* Account Management Section - Only for Owners */}
					{isOwner && (
						<>
							<div
								style={{
									backgroundColor: '#fff3cd',
									border: '1px solid #ffc107',
									padding: '20px',
									borderRadius: '8px',
									marginTop: '20px',
									marginBottom: '20px'
								}}
							>
								<h3 style={{ marginTop: 0, color: '#856404' }}>⚠️ Account Management</h3>
								<p style={{ color: '#856404', marginBottom: '15px' }}>
									These actions will affect your supplier account. Please proceed with caution.
								</p>

								<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
									<button
										className="btn btn-outline"
										onClick={async () => {
											if (window.confirm('Are you sure you want to deactivate your supplier account? You can reactivate it later.')) {
												try {
													await dataService.deactivateSupplierAccount()
													alert('Supplier account deactivated successfully')
													loadData()
												} catch (error) {
													console.error('Failed to deactivate account:', error)
													alert('Failed to deactivate account')
												}
											}
										}}
										style={{
											color: '#ff9800',
											borderColor: '#ff9800'
										}}
									>
										Deactivate Account
									</button>
									<button
										className="btn btn-outline"
										onClick={() => setShowDeleteConfirm(true)}
										style={{
											color: '#ef4444',
											borderColor: '#ef4444'
										}}
									>
										Delete Account
									</button>
								</div>
							</div>

							{showDeleteConfirm && (
								<div
									style={{
										backgroundColor: '#f8d7da',
										border: '1px solid #f5c6cb',
										padding: '20px',
										borderRadius: '8px',
										marginTop: '20px'
									}}
								>
									<h3 style={{ marginTop: 0, color: '#721c24' }}>⚠️ Delete Account Confirmation</h3>
									<p style={{ color: '#721c24', marginBottom: '15px' }}>
										<strong>This action cannot be undone. Deleting your account will:</strong>
									</p>
									<ul style={{ color: '#721c24', marginBottom: '15px' }}>
										<li>Permanently delete your supplier account</li>
										<li>Remove all associated data</li>
										<li>Cancel all active orders and links</li>
									</ul>
									<p style={{ color: '#721c24', marginBottom: '15px' }}>
										<strong>Please type "DELETE" in the field below to confirm:</strong>
									</p>
									<input
										type="text"
										id="delete-confirm-input"
										placeholder="Type DELETE to confirm"
										style={{
											width: '100%',
											padding: '10px',
											marginBottom: '15px',
											border: '1px solid #f5c6cb',
											borderRadius: '4px'
										}}
									/>
									<div style={{ display: 'flex', gap: '10px' }}>
										<button
											className="btn"
											onClick={async () => {
												const confirmInput = (document.getElementById('delete-confirm-input') as HTMLInputElement)?.value
												if (confirmInput === 'DELETE') {
													try {
														await dataService.deleteSupplierAccount()
														alert('Supplier account deleted successfully')
														// Redirect to login or home page
														window.location.href = '/'
													} catch (error) {
														console.error('Failed to delete account:', error)
														alert('Failed to delete account')
													}
												} else {
													alert('Please type "DELETE" to confirm')
												}
											}}
											style={{
												backgroundColor: '#ef4444',
												color: 'white',
												border: 'none'
											}}
										>
											Confirm Delete
										</button>
										<button
											className="btn btn-outline"
											onClick={() => {
												setShowDeleteConfirm(false)
												const input = document.getElementById('delete-confirm-input') as HTMLInputElement
												if (input) input.value = ''
											}}
										>
											Cancel
										</button>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			)}

			{/* Supplier Management Tab - Removed, functionality moved to Profile tab */}
			{false && (
				<div className="suppliers-section">
					<div className="section-header">
						<h2>Supplier Management</h2>
						<div style={{ color: '#666' }}>Manage your supplier accounts and information</div>
					</div>

					{/* Add Supplier Form */}
					<form
						onSubmit={handleAddSupplier}
						className="add-supplier-form"
					>
						<h4>Add New Supplier</h4>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: '15px',
								marginBottom: '20px'
							}}
						>
							<div className="form-group">
								<label>Supplier Name</label>
								<input
									type="text"
									value={newSupplier.name}
									onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
									required
									style={{ width: '100%' }}
								/>
							</div>
							<div className="form-group">
								<label>Company Name</label>
								<input
									type="text"
									value={newSupplier.companyName}
									onChange={(e) =>
										setNewSupplier({
											...newSupplier,
											companyName: e.target.value
										})
									}
									required
									style={{ width: '100%' }}
								/>
							</div>
							<div className="form-group">
								<label>Email</label>
								<input
									type="email"
									value={newSupplier.email}
									onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
									required
									style={{ width: '100%' }}
								/>
							</div>
							<div className="form-group">
								<label>Status</label>
								<select
									value={newSupplier.isActive.toString()}
									onChange={(e) =>
										setNewSupplier({
											...newSupplier,
											isActive: e.target.value === 'true'
										})
									}
									style={{ width: '100%' }}
								>
									<option value="true">Active</option>
									<option value="false">Inactive</option>
								</select>
							</div>
						</div>
						<button
							type="submit"
							className="btn btn-primary"
						>
							Add Supplier
						</button>
					</form>

					<table>
						<thead>
							<tr>
								<th>Supplier Name</th>
								<th>Company</th>
								<th>Email</th>
								<th>Status</th>
								<th>Created</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{suppliers.map((supplier) => (
								<tr key={supplier.id}>
									<td style={{ fontWeight: '500' }}>{supplier.name}</td>
									<td>{supplier.companyName}</td>
									<td>{supplier.email}</td>
									<td>
										<span className={`status-badge ${supplier.isActive ? 'status-completed' : 'status-rejected'}`}>
											{supplier.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td>{supplier.created}</td>
									<td>
										<button className="btn btn-outline">Edit</button>
										<button
											className="btn btn-outline"
											style={{
												color: '#ef4444',
												borderColor: '#ef4444',
												marginLeft: '5px'
											}}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

export default Settings
