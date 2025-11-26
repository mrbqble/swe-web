import React, { useState, useEffect, useCallback } from 'react'
import { Manager, Supplier } from '../types'
import { dataService } from '../services/dataService'
import { usePermissions } from '../hooks/usePermissions'
import { useLanguage } from '../hooks/useLanguage'
import { useAuth } from './AuthContext'
import { t } from '../utils/i18n'

const Settings: React.FC = () => {
	const permissions = usePermissions()
	const { logout } = useAuth()
	const { language, changeLanguage } = useLanguage()
	const [activeTab, setActiveTab] = useState<'profile' | 'managers' | 'account' | 'localization'>('profile')
	const [managers, setManagers] = useState<Manager[]>([])
	const [suppliers, setSuppliers] = useState<Supplier[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const [newManager, setNewManager] = useState({
		first_name: '',
		last_name: '',
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
		is_active: true,
		company_logo: ''
	})

	const [userProfile, setUserProfile] = useState({
		email: '',
		first_name: '',
		last_name: ''
	})

	const [isEditingProfile, setIsEditingProfile] = useState(false)
	const [isEditingUserProfile, setIsEditingUserProfile] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [profileError, setProfileError] = useState<string | null>(null)
	const [passwordError, setPasswordError] = useState<string | null>(null)
	const [passwordSuccess, setPasswordSuccess] = useState(false)

	const [editingManager, setEditingManager] = useState<{
		id: string
		first_name: string
		last_name: string
		email: string
		role: 'manager' | 'sales'
	} | null>(null)

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
						is_active: supplierData.is_active ?? true,
						company_logo: supplierData.company_logo || ''
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
			return
		}

		try {
			await dataService.addManager({
				name: `${newManager.first_name} ${newManager.last_name}`.trim(),
				email: newManager.email,
				role: newManager.role,
				isActive: true
			})
			setNewManager({ first_name: '', last_name: '', email: '', role: 'sales' })
			loadData()
		} catch (error: any) {
			console.error('Failed to add manager:', error)
		}
	}

	const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const reader = new FileReader()
		reader.onloadend = () => {
			const result = reader.result as string
			// result will be like "data:image/png;base64,AAAA..."
			const base64 = result.includes(',') ? result.split(',')[1] : result
			setSupplierProfile((prev) => ({
				...prev,
				company_logo: base64
			}))
		}
		reader.readAsDataURL(file)
	}

	const handleUpdateSupplierProfile = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			setProfileError(null)
			await dataService.updateSupplierProfile(supplierProfile)
			setIsEditingProfile(false)
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
			loadData()
		} catch (error: any) {
			console.error('Failed to update user profile:', error)
			setProfileError(error.response?.data?.detail || 'Failed to update profile')
		}
	}

	// Password change functionality moved to login (forgot password) flow

	const handleDeleteManager = async (id: string) => {
		if (!permissions.canManageTeam) {
			return
		}

		try {
			await dataService.deleteManager(id)
			setManagers(managers.filter((m) => m.id !== id))
		} catch (error) {
			console.error('Failed to delete manager:', error)
		}
	}

	const handleAddSupplier = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!permissions.canManageSuppliers) {
			return
		}

		try {
			const supplier = await dataService.createSupplier(newSupplier)
			setSuppliers([...suppliers, supplier])
			setNewSupplier({ name: '', companyName: '', email: '', isActive: true })
		} catch (error) {
			console.error('Failed to add supplier:', error)
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

					{!isEditingProfile && !isEditingUserProfile ? (
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
							{supplierProfile.company_logo && (
								<div style={{ marginBottom: '15px' }}>
									<strong>Company Logo:</strong>
									<div
										style={{
											marginTop: '8px',
											padding: '8px',
											border: '1px solid #eee',
											borderRadius: '4px',
											display: 'inline-block',
											backgroundColor: '#fafafa'
										}}
									>
										<img
											src={`data:image/png;base64,${supplierProfile.company_logo}`}
											alt="Company logo"
											style={{ maxWidth: '160px', maxHeight: '80px', display: 'block' }}
										/>
									</div>
								</div>
							)}
							<div style={{ marginBottom: '15px' }}>
								<strong>Status:</strong>{' '}
								<span className={`status-badge ${supplierProfile.is_active ? 'status-completed' : 'status-rejected'}`}>
									{supplierProfile.is_active ? 'Active' : 'Inactive'}
								</span>
							</div>
							<hr style={{ margin: '20px 0' }} />
							<div style={{ marginBottom: '10px' }}>
								<strong>Account Email:</strong> {userProfile.email}
							</div>
							<div style={{ marginBottom: '10px' }}>
								<strong>First Name:</strong> {userProfile.first_name}
							</div>
							<div style={{ marginBottom: '15px' }}>
								<strong>Last Name:</strong> {userProfile.last_name}
							</div>
							<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
								<button
									className="btn btn-primary"
									onClick={() => setIsEditingProfile(true)}
								>
									Edit Company Profile
								</button>
								<button
									className="btn btn-outline"
									onClick={() => setIsEditingUserProfile(true)}
								>
									Edit Account Profile
								</button>
							</div>
						</div>
					) : (
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: '20px',
								alignItems: 'flex-start'
							}}
						>
							<form onSubmit={handleUpdateSupplierProfile}>
								<div
									style={{
										backgroundColor: 'white',
										padding: '20px',
										borderRadius: '8px',
										border: '1px solid #ddd'
									}}
								>
									<h3 style={{ marginTop: 0, marginBottom: '15px' }}>Company Profile</h3>
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
									<div
										className="form-group"
										style={{ marginBottom: '15px' }}
									>
										<label>Company Logo</label>
										<input
											type="file"
											accept="image/*"
											onChange={handleCompanyLogoChange}
											style={{ width: '100%', padding: '8px' }}
										/>
										<small style={{ color: '#666', display: 'block', marginTop: '6px' }}>
											Select an image; it will be converted to a base64 string and stored in the database.
										</small>
										{supplierProfile.company_logo && (
											<div style={{ marginTop: '10px' }}>
												<strong>Preview:</strong>
												<div
													style={{
														marginTop: '8px',
														padding: '8px',
														border: '1px solid #eee',
														borderRadius: '4px',
														display: 'inline-block',
														backgroundColor: '#fafafa'
													}}
												>
													<img
														src={`data:image/png;base64,${supplierProfile.company_logo}`}
														alt="Company logo preview"
														style={{ maxWidth: '160px', maxHeight: '80px', display: 'block' }}
													/>
												</div>
											</div>
										)}
									</div>
									<div style={{ display: 'flex', gap: '10px' }}>
										<button
											type="submit"
											className="btn btn-primary"
										>
											Save Company
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

							<form onSubmit={handleUpdateUserProfile}>
								<div
									style={{
										backgroundColor: 'white',
										padding: '20px',
										borderRadius: '8px',
										border: '1px solid #ddd'
									}}
								>
									<h3 style={{ marginTop: 0, marginBottom: '15px' }}>Account Profile</h3>
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
											Save Account
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
								</div>
							</form>
						</div>
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
									<label>First Name</label>
									<input
										type="text"
										value={newManager.first_name}
										onChange={(e) => setNewManager({ ...newManager, first_name: e.target.value })}
										required
										style={{ width: '100%' }}
									/>
								</div>
								<div
									className="form-group"
									style={{ flex: 1 }}
								>
									<label>Last Name</label>
									<input
										type="text"
										value={newManager.last_name}
										onChange={(e) => setNewManager({ ...newManager, last_name: e.target.value })}
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

					{editingManager && (
						<form
							onSubmit={async (e) => {
								e.preventDefault()
								try {
									await dataService.updateManager(editingManager.id, {
										first_name: editingManager.first_name,
										last_name: editingManager.last_name,
										email: editingManager.email,
										role: editingManager.role
									})
									setEditingManager(null)
									loadData()
								} catch (error: any) {
									console.error('Failed to update staff member:', error)
								}
							}}
							style={{
								marginBottom: '20px',
								padding: '15px',
								border: '1px solid #ddd',
								borderRadius: '8px',
								backgroundColor: '#f9fafb'
							}}
						>
							<h4 style={{ marginTop: 0, marginBottom: '10px' }}>Edit Team Member</h4>
							<div
								style={{
									display: 'flex',
									gap: '15px',
									alignItems: 'flex-end',
									flexWrap: 'wrap'
								}}
							>
								<div
									className="form-group"
									style={{ flex: 1, minWidth: '160px' }}
								>
									<label>First Name</label>
									<input
										type="text"
										value={editingManager.first_name}
										onChange={(e) =>
											setEditingManager((prev) =>
												prev
													? {
															...prev,
															first_name: e.target.value
													  }
													: prev
											)
										}
										required
										style={{ width: '100%' }}
									/>
								</div>
								<div
									className="form-group"
									style={{ flex: 1, minWidth: '160px' }}
								>
									<label>Last Name</label>
									<input
										type="text"
										value={editingManager.last_name}
										onChange={(e) =>
											setEditingManager((prev) =>
												prev
													? {
															...prev,
															last_name: e.target.value
													  }
													: prev
											)
										}
										required
										style={{ width: '100%' }}
									/>
								</div>
								<div
									className="form-group"
									style={{ flex: 1, minWidth: '200px' }}
								>
									<label>Email</label>
									<input
										type="email"
										value={editingManager.email}
										onChange={(e) =>
											setEditingManager((prev) =>
												prev
													? {
															...prev,
															email: e.target.value
													  }
													: prev
											)
										}
										required
										style={{ width: '100%' }}
									/>
								</div>
								<div
									className="form-group"
									style={{ minWidth: '140px' }}
								>
									<label>Role</label>
									<select
										value={editingManager.role}
										onChange={(e) =>
											setEditingManager((prev) =>
												prev
													? {
															...prev,
															role: e.target.value as 'manager' | 'sales'
													  }
													: prev
											)
										}
										style={{ width: '100%' }}
									>
										<option value="sales">Sales</option>
										<option value="manager">Manager</option>
									</select>
								</div>
								<div style={{ display: 'flex', gap: '8px' }}>
									<button
										type="submit"
										className="btn btn-primary"
									>
										Save
									</button>
									<button
										type="button"
										className="btn btn-outline"
										onClick={() => setEditingManager(null)}
									>
										Cancel
									</button>
								</div>
							</div>
						</form>
					)}

					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Role</th>
								<th>Status</th>
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
									<td>
										<span className={`status-badge ${manager.isActive ? 'status-completed' : 'status-rejected'}`}>
											{manager.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td>{manager.created}</td>
									<td>
										<div style={{ display: 'flex', gap: '5px' }}>
											{permissions.canManageTeam && (
												<>
													<button
														className="btn btn-outline"
														onClick={() =>
															setEditingManager({
																id: manager.id,
																first_name: manager.name.split(' ')[0] || '',
																last_name: manager.name.split(' ').slice(1).join(' ') || '',
																email: manager.email,
																role: manager.role
															})
														}
													>
														Edit
													</button>
													{manager.isActive ? (
														<button
															className="btn btn-outline"
															onClick={async () => {
																try {
																	await dataService.deactivateStaffMember(manager.id)
																	loadData()
																} catch (error) {
																	console.error('Failed to deactivate staff:', error)
																}
															}}
															style={{
																color: '#ff9800',
																borderColor: '#ff9800'
															}}
														>
															Deactivate
														</button>
													) : (
														<button
															className="btn btn-outline"
															onClick={async () => {
																try {
																	await dataService.activateStaffMember(manager.id)
																	loadData()
																} catch (error) {
																	console.error('Failed to activate staff:', error)
																}
															}}
															style={{
																color: '#16a34a',
																borderColor: '#16a34a'
															}}
														>
															Activate
														</button>
													)}
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

					{/* Password change controls moved to login page (forgot password flow) */}
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
