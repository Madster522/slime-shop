import React from 'react'
import CompanyStatusBanner from '@/components/company/CompanyStatusBanner'
import MaintenanceGate from '@/components/company/MaintenanceGate'
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MaintenanceGate>
      <CompanyStatusBanner />
      <Navbar />
      {children}
      <Footer />
    </MaintenanceGate>
  )
}
