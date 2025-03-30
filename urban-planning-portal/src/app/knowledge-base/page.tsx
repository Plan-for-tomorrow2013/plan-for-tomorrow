import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, Building2, Ruler } from "lucide-react"

export default function KnowledgeBasePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Knowledge Base</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-500" />
              <CardTitle>Planning Guidelines</CardTitle>
            </div>
            <CardDescription>Essential planning documentation and guidelines</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>• Development Control Plans (DCP)</li>
              <li>• Local Environmental Plans (LEP)</li>
              <li>• State Environmental Planning Policies (SEPP)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-green-500" />
              <CardTitle>Building Codes</CardTitle>
            </div>
            <CardDescription>Building standards and requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>• National Construction Code (NCC)</li>
              <li>• Australian Standards</li>
              <li>• Building Certifier Guidelines</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ruler className="h-6 w-6 text-purple-500" />
              <CardTitle>Design Resources</CardTitle>
            </div>
            <CardDescription>Design guidelines and best practices</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>• Urban Design Guidelines</li>
              <li>• Architectural Standards</li>
              <li>• Sustainability Requirements</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-orange-500" />
              <CardTitle>Learning Resources</CardTitle>
            </div>
            <CardDescription>Educational materials and tutorials</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>• Video Tutorials</li>
              <li>• Case Studies</li>
              <li>• Best Practice Guides</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 