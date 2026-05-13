import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './components/AuthContext'
import { ProtectedLayout } from './components/Layout'
import ToastHost from './components/ToastHost'
import Login from './components/Login'
import PartnersPage from './pages/PartnersPage'
import PartnerDetailPage from './pages/PartnerDetailPage'
import IpTooQueuePage from './pages/IpTooQueuePage'
import OrdersPage from './pages/OrdersPage'
import InventoryPage from './pages/InventoryPage'
import FaqPage from './pages/FaqPage'
import BroadcastPage from './pages/BroadcastPage'
import SuggestionsPage from './pages/SuggestionsPage'
import AuditPage from './pages/AuditPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route index element={<Navigate to="/partners" replace />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/partners/:id" element={<PartnerDetailPage />} />
            <Route path="/ip-too" element={<IpTooQueuePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/broadcast" element={<BroadcastPage />} />
            <Route path="/suggestions" element={<SuggestionsPage />} />
            <Route path="/audit" element={<AuditPage />} />
          </Route>
        </Routes>
        <ToastHost />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
