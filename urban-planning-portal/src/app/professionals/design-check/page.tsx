import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ruler, Upload, CheckCircle } from "lucide-react"

export default function DesignCheckPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Design Check</h1>
          <p className="text-gray-500 mt-2">Verify your design compliance</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Plans
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5">
          <Tabs defaultValue="compliance" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
            </TabsList>
            <TabsContent value="compliance" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <CardTitle>Setback Requirements</CardTitle>
                  </div>
                  <CardDescription>Front, side, and rear setbacks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between">
                      <span>Front Setback</span>
                      <span className="text-green-500">Compliant (6.5m)</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Side Setback</span>
                      <span className="text-green-500">Compliant (1.5m)</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Rear Setback</span>
                      <span className="text-green-500">Compliant (8m)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Design Summary</CardTitle>
              <CardDescription>Overview of design checks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Floor Space Ratio: 0.5:1</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Building Height: 8.5m</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
              <CardDescription>Available actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Generate Report</Button>
              <Button variant="outline" className="w-full">Save Draft</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
