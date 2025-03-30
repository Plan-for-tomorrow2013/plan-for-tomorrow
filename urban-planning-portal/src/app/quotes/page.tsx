import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, Clock, CheckCircle } from "lucide-react"

export default function QuotesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quotes</h1>
          <p className="text-gray-500 mt-2">Manage your project quotes</p>
        </div>
        <Button>New Quote</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <CardTitle>Statement of Environmental Effects</CardTitle>
              </div>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <CardDescription>42 Park Road, Merrylands</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">$499</span>
                <span className="text-sm text-gray-500">inc. GST</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Created: 23 Mar 2024</span>
              </div>
              <Button className="w-full">Accept Quote</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <CardTitle>Design Check</CardTitle>
              </div>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <CardDescription>42 Park Road, Merrylands</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">$299</span>
                <span className="text-sm text-gray-500">inc. GST</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Created: 23 Mar 2024</span>
              </div>
              <Button className="w-full">Accept Quote</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                <CardTitle>Complying Development Certificate</CardTitle>
              </div>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <CardDescription>42 Park Road, Merrylands</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">$699</span>
                <span className="text-sm text-gray-500">inc. GST</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Created: 23 Mar 2024</span>
              </div>
              <Button className="w-full">Accept Quote</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 