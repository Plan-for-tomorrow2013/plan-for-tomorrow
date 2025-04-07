"use client"

import { useState } from "react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../../components/ui/dialog"
import { Badge } from "../../../../components/ui/badge"
import { useToast } from "../../../../components/ui/use-toast"
import { WasteCalculator } from "../../../../components/WasteCalculator"
import { CheckCircle, FileText, Upload } from "lucide-react"
import { paymentService } from "../../../../../lib/services/paymentService"
import { PageHeader } from "../../../components/ui/page-header"

export default function WasteManagementPage() {
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
        type: 'report'
      })

      if (result.success) {
        toast({
          title: "Payment Successful",
          description: "Your waste management report has been purchased"
        })
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "An error occurred during payment",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while processing the payment",
        variant: "destructive"
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Waste Management"
        description="Waste management guidelines and calculators"
        backHref="/knowledge-base"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <WasteCalculator />

        <Card>
          <CardHeader>
            <CardTitle>Professional Report</CardTitle>
            <CardDescription>
              Get a comprehensive waste management report for your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">What&apos;s Included:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Detailed waste analysis</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Recycling recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Cost optimization strategies</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Environmental impact assessment</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">$495</p>
                  <p className="text-sm text-muted-foreground">One-time purchase</p>
                </div>
                <Button
                  onClick={() => handlePurchase(495, "Waste Management Report")}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? "Processing..." : "Purchase Report"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Need Urgent Assistance?</h2>
        <p>
          Contact our waste management experts at{" "}
          <a href="mailto:waste@planfortomorrow.com" className="text-primary hover:underline">
            waste@planfortomorrow.com
          </a>
        </p>
      </div>

      {/* Document Upload Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Document Store</CardTitle>
          <CardDescription>Access your waste management documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>Waste-Management-Report-2024.pdf</span>
                </div>
                <Badge>Admin Upload</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>Waste-Calculations-2024.pdf</span>
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
                    <a href="mailto:waste@planfortomorrow.com" className="text-blue-500 hover:underline">
                      waste@planfortomorrow.com
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
