"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, CheckCircle } from "lucide-react"
import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"

export default function ComplyingDevelopmentPage() {
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Complying Development"
        description="SEPP codes and complying development regulations"
        backHref="/knowledge-base"
      />

      {/* Document Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Document Store</CardTitle>
          <CardDescription>Access your complying development documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>CDC-Application-2024.pdf</span>
                </div>
                <Badge>Admin Upload</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>Compliance-Checklist-2024.pdf</span>
                </div>
                <Badge>Admin Upload</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>Technical-Drawings-2024.pdf</span>
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
                    <a href="mailto:cdc@planfortomorrow.com" className="text-blue-500 hover:underline">
                      cdc@planfortomorrow.com
                    </a>
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Information Section */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>Essential documentation for your CDC</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>CDC Application Form</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Site Plan and Elevations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>BASIX Certificate</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Structural Engineering Plans</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Compliance Declaration</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CDC Benefits</CardTitle>
            <CardDescription>Advantages of complying development</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Faster approval process</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Predetermined development standards</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Reduced assessment time</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cost-effective solution</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Streamlined process</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 