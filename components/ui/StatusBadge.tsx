import React from 'react'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const ORDER_STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  Pending:    { bg: 'bg-yellow-100',  text: 'text-yellow-800',  icon: '⏳' },
  Processing: { bg: 'bg-blue-100',    text: 'text-blue-800',    icon: '🔄' },
  Printing:   { bg: 'bg-purple-100',  text: 'text-purple-800',  icon: '🖨️' },
  Packed:     { bg: 'bg-indigo-100',  text: 'text-indigo-800',  icon: '📦' },
  Shipped:    { bg: 'bg-green-100',   text: 'text-green-800',   icon: '🚚' },
  Delayed:    { bg: 'bg-orange-100',  text: 'text-orange-800',  icon: '⚠️' },
  Delivered:  { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '✅' },
  Cancelled:  { bg: 'bg-red-100',     text: 'text-red-800',     icon: '❌' },
  Refunded:   { bg: 'bg-pink-100',    text: 'text-pink-800',    icon: '↩️' },
  'In Queue': { bg: 'bg-cyan-100',    text: 'text-cyan-800',    icon: '📋' },
  Approved:   { bg: 'bg-blue-100',    text: 'text-blue-800',    icon: '✔️' },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const style = ORDER_STATUS_STYLES[status] || { bg: 'bg-slate-100', text: 'text-slate-700', icon: '•' }
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold ${sizeClass} ${style.bg} ${style.text}`}>
      {style.icon} {status}
    </span>
  )
}

// Printer status badge (used in admin)
const PRINTER_STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  idle:     { bg: 'bg-green-900/40',   text: 'text-green-300',   border: 'border-green-700' },
  printing: { bg: 'bg-blue-900/40',    text: 'text-blue-300',    border: 'border-blue-700' },
  error:    { bg: 'bg-red-900/40',     text: 'text-red-300',     border: 'border-red-700' },
  offline:  { bg: 'bg-slate-700',      text: 'text-slate-400',   border: 'border-slate-600' },
  unknown:  { bg: 'bg-slate-700',      text: 'text-slate-400',   border: 'border-slate-600' },
}

export function PrinterStatusBadge({ status }: { status: string }) {
  const s = PRINTER_STATUS_STYLES[status] || PRINTER_STATUS_STYLES.unknown
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>
      {status}
    </span>
  )
}

// Alert severity badge
const ALERT_SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-900/60',    text: 'text-red-300',    border: 'border-red-700' },
  high:     { bg: 'bg-orange-900/60', text: 'text-orange-300', border: 'border-orange-700' },
  medium:   { bg: 'bg-yellow-900/60', text: 'text-yellow-300', border: 'border-yellow-700' },
  low:      { bg: 'bg-slate-700',     text: 'text-slate-300',  border: 'border-slate-600' },
}

export function AlertSeverityBadge({ severity }: { severity: string }) {
  const s = ALERT_SEVERITY_STYLES[severity] || ALERT_SEVERITY_STYLES.low
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>
      {severity}
    </span>
  )
}
