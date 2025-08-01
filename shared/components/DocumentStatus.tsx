"use client"

import React from 'react'
import { Check } from 'lucide-react'
import { DocumentWithStatus } from '../types/documents'

interface DocumentStatusProps {
  document: DocumentWithStatus
}

export function DocumentStatus({ document }: DocumentStatusProps) {
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
