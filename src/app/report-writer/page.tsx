"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DocumentStore } from "@/components/DocumentStore"
import { DocumentUpload } from "@/components/DocumentUpload"
import { Document } from "@/types/documents"
import { paymentService } from "@/lib/services/paymentService"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function ReportWriterPage() {
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document)
    setShowUploadDialog(false)
    toast({
      title: "Document Selected",
      description: `Selected ${document.title} for report generation`
    })
  }

  const handlePurchase = async (amount: number, description: string, type: 'assessment' | 'report' | 'certificate') => {
    if (!selectedDocument && type === 'report') {
      toast({
        title: "Error",
        description: "Please select a document first",
        variant: "destructive"
      })
      return
    }

    setIsProcessingPayment(true)
    setPaymentError(null)

    try {
      const result = await paymentService.processPayment({
        amount,
        currency: "AUD",
        description,
        type,
        metadata: {
          documentId: selectedDocument?.id,
          documentName: selectedDocument?.title
        }
      })

      if (result.success) {
        toast({
          title: "Payment Successful",
          description: `Your ${type} has been purchased. Transaction ID: ${result.transactionId}`
        })
        
        // Here you would typically start the report generation process
        if (type === 'report' && selectedDocument) {
          // Simulate report generation start
          toast({
            title: "Report Generation Started",
            description: "Your report is being generated. We'll notify you when it's ready."
          })
        }
      } else {
        setPaymentError(result.error || "Payment failed")
        toast({
          title: "Payment Failed",
          description: result.error || "An error occurred during payment",
          variant: "destructive"
        })
      }
    } catch (error) {
      const errorMessage = "An error occurred while processing the payment"
      setPaymentError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      console.error("Payment error:", error)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Report Writer</h1>
          <p className="text-gray-500 mt-2">Generate professional planning reports</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Statement of Environmental Effects Generator</CardTitle>
            <CardDescription>AI-powered report generation tool</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Benefits</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li>• Comprehensive environmental impact analysis</li>
                <li>• Automatic compliance checking</li>
                <li>• Professional formatting and structure</li>
                <li>• Fast turnaround time</li>
              </ul>
            </div>
            
            <div>
              <p className="text-2xl font-bold">$499</p>
              <p className="text-sm text-gray-500">One-time payment</p>
            </div>

            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-yellow-500 hover:bg-yellow-600"
                  onClick={() => handlePurchase(499, "Statement of Environmental Effects Generator", "report")}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? "Processing..." : "Start Generator"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Report</DialogTitle>
                  <DialogDescription>
                    Upload your project documents to begin generating your Statement of Environmental Effects.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <DocumentUpload
                    onUploadComplete={handleDocumentSelect}
                    maxSize={20}
                    allowedTypes={["application/pdf"]}
                  />
                  <DocumentStore
                    title="Project Documents"
                    description="Or select from your existing documents"
                    onDocumentSelect={handleDocumentSelect}
                  />
                </div>
              </DialogContent>
            </Dialog>
            {paymentError && (
              <p className="text-sm text-red-500">{paymentError}</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Selected Document</CardTitle>
              <CardDescription>Currently selected for report generation</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDocument ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedDocument.type}</Badge>
                    <span className="text-sm">{selectedDocument.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(selectedDocument.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No document selected</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Complying Development Certificate</CardTitle>
              <CardDescription>Fast-track approval process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li>• Rapid assessment</li>
                <li>• Pre-checked compliance</li>
                <li>• Council-ready documentation</li>
              </ul>
              <div>
                <p className="text-2xl font-bold">$699</p>
                <p className="text-sm text-gray-500">One-time payment</p>
              </div>
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => handlePurchase(699, "Complying Development Certificate", "certificate")}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? "Processing..." : "Purchase Now"}
              </Button>
              {paymentError && (
                <p className="text-sm text-red-500">{paymentError}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 