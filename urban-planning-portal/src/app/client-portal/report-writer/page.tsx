"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Plus, Upload } from "lucide-react"
import { useState } from "react"

export default function ReportWriterPage() {
  const [showUploadDialog, setShowUploadDialog] = useState(false)

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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">$499</p>
                <p className="text-sm text-gray-500">One-time payment</p>
              </div>
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-yellow-500 hover:bg-yellow-600">Start Generator</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Report</DialogTitle>
                    <DialogDescription>
                      Upload your project documents to begin generating your Statement of Environmental Effects.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Drag and drop your files here</p>
                      <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                    </div>
                    <Button className="w-full">Upload Files</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Store</CardTitle>
              <CardDescription>Your uploaded documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Project-Brief-2024.pdf</span>
                  <Badge variant="secondary">2MB</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Site-Analysis.doc</span>
                  <Badge variant="secondary">1.5MB</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add More
              </Button>
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
              <Button className="w-full bg-orange-500 hover:bg-orange-600">Purchase Now</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
