"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import PdfViewer from "@/components/PdfViewer"

export default function DocumentPage() {
  const searchParams = useSearchParams()
  const pdfPath = searchParams.get("path")
  const title = searchParams.get("title") || "Assessment PDF"
  const router = useRouter()

  if (!pdfPath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Document Not Found</h1>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">
            Return to Nathers - BASIX
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <button onClick={() => router.back()} className="text-[#5a3d1c] hover:underline flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Nathers - BASIX
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6">{title}</h1>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <PdfViewer pdfPath={pdfPath} />
        </div>
      </div>
    </div>
  )
}
