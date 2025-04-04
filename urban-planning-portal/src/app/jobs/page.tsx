import { Button } from "../../../../admin/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../admin/components/ui/card"
import { Input } from "../../../../admin/components/ui/input"
import { MapPin } from "lucide-react"

export default function JobsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Jobs</h1>
        <Button>Create Job</Button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">New Job</h2>
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input 
                type="text" 
                placeholder="Search address..." 
                className="flex-1"
              />
              <Button>Search</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">My Jobs</h2>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-base">42 Park Road, Merrylands</CardTitle>
                </div>
                <span className="text-sm text-gray-500">Cumberland Council</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <Button variant="outline" className="w-full">
                  Initial Assessment
                </Button>
                <Button variant="outline" className="w-full">
                  Design Check
                </Button>
                <Button variant="outline" className="w-full">
                  Report Writer
                </Button>
                <Button variant="outline" className="w-full">
                  Quotes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 