"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, CheckCircle } from "lucide-react"
import { useState } from "react"
import { paymentService } from "../../../../../lib/services/paymentService"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/ui/page-header"

export default function NathersBASIXPage() {
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const { toast } = useToast()

  const handlePurchase = async (amount: number, description: string) => {
    setIsProcessingPayment(true)
    try {
      const result = await paymentService.processPayment({
        amount,
        currency: "AUD",
        description,
        type: 'assessment'
      })

      if (result.success) {
        toast({
          title: "Purchase successful",
          description: `Transaction ID: ${result.transactionId}`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Purchase failed",
          description: result.error || "An error occurred during payment processing",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Purchase failed",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="NatHERS & BASIX"
        description="Energy efficiency and sustainability requirements"
        backHref="/knowledge-base"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* NatHERS Assessment Card */}
        <Card>
          <CardHeader>
            <CardTitle>NatHERS Assessment</CardTitle>
            <CardDescription>Professional energy efficiency assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Compliant with national requirements</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Prepared by accredited assessors</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>5-7 business days turnaround</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Energy efficiency recommendations</span>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-2xl font-bold">$550</p>
              <p className="text-sm text-gray-500">inc. GST</p>
            </div>
            <Button
              className="w-full"
              onClick={() => handlePurchase(550, "NatHERS Assessment")}
              disabled={isProcessingPayment}
            >
              Purchase Now
            </Button>
          </CardContent>
        </Card>

        {/* BASIX Certificate Card */}
        <Card>
          <CardHeader>
            <CardTitle>BASIX Certificate</CardTitle>
            <CardDescription>NSW sustainability compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>NSW planning requirements compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Experienced consultants</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>3-5 business days turnaround</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Sustainability recommendations</span>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-2xl font-bold">$495</p>
              <p className="text-sm text-gray-500">inc. GST</p>
            </div>
            <Button
              className="w-full"
              onClick={() => handlePurchase(495, "BASIX Certificate")}
              disabled={isProcessingPayment}
            >
              Purchase Now
            </Button>
          </CardContent>
        </Card>

        {/* Combined Package Card */}
        <Card className="border-2 border-yellow-500">
          <CardHeader>
            <Badge className="w-fit mb-2" variant="secondary">Best Value</Badge>
            <CardTitle>Combined Package</CardTitle>
            <CardDescription>NatHERS & BASIX bundle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Complete NatHERS assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Full BASIX certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Priority processing (5-7 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free council revisions</span>
              </div>
            </div>
            <div className="pt-4">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">$895</p>
                <Badge variant="secondary" className="text-green-600">Save $150</Badge>
              </div>
              <p className="text-sm text-gray-500">inc. GST</p>
              <p className="text-sm text-gray-500">Individual value: $1,045</p>
            </div>
            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-600"
              onClick={() => handlePurchase(895, "Combined NatHERS & BASIX Package")}
              disabled={isProcessingPayment}
            >
              Purchase Package
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Document Upload Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Document Store</CardTitle>
          <CardDescription>Access your certificates and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>NatHERS-Certificate-2024.pdf</span>
                </div>
                <Badge>Admin Upload</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>BASIX-Certificate-2024.pdf</span>
                </div>
                <Badge>Admin Upload</Badge>
              </div>
            </div>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Request Document Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Document Upload</DialogTitle>
                  <DialogDescription>
                    Contact our team to request document uploads or updates.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    For document uploads or urgent requests, please contact us at:
                    <br />
                    <a href="mailto:energy@planfortomorrow.com" className="text-blue-500 hover:underline">
                      energy@planfortomorrow.com
                    </a>
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
