"use client"

import React from 'react'
import { Check } from 'lucide-react'
import { DocumentWithStatus } from '../types/consultants'

interface ConsultantStatusProps {
  document: DocumentWithStatus
}

export function ConsultantStatus({ document }: ConsultantStatusProps) {
  const documentName = document.uploadedFile?.originalName || document.title

  return (
    <div className={`flex items-center text-sm ${
      document.displayStatus === 'uploaded' ? 'text-green-600' : 'text-gray-400'
    }`}>
      <Check className={`h-4 w-4 mr-2 ${document.displayStatus === 'uploaded' ? '' : 'opacity-0'}`} />
      <span>
        {document.displayStatus === 'uploaded'
          ? `${document.title}: ${documentName}`
          : `${document.title}`}
      </span>
    </div>
  )
} 