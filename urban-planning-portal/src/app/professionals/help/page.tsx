import { Button } from "@shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card"
import { Input } from "@shared/components/ui/input"
import { HelpCircle, Search, Book, MessageCircle, Phone } from "lucide-react"

export default function HelpPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-gray-500 mt-2">Find answers and support</p>
        </div>
      </div>

      <div className="max-w-2xl mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search for help..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center gap-2">
              <Book className="h-6 w-6 text-blue-500" />
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Documentation</h3>
            </div>
            <CardDescription>Browse our guides and tutorials</CardDescription>
          </div>
          <div className="p-6 pt-0">
            <ul className="space-y-2">
              <li>• Getting Started Guide</li>
              <li>• Initial Assessment Guide</li>
              <li>• Report Writing Tips</li>
              <li>• Design Check Guide</li>
            </ul>
            <Button variant="outline" className="w-full mt-4">View All</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-green-500" />
              <CardTitle>Live Chat</CardTitle>
            </div>
            <CardDescription>Chat with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Our team is available Monday to Friday, 9am - 5pm AEST.
            </p>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="h-6 w-6 text-purple-500" />
              <CardTitle>Contact Us</CardTitle>
            </div>
            <CardDescription>Get in touch via phone or email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="text-sm">Phone: 1300 XXX XXX</p>
              <p className="text-sm">Email: support@planfortomorrow.com</p>
            </div>
            <Button variant="outline" className="w-full">Send Email</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-gray-500" />
                <CardTitle className="text-base">How do I start a new assessment?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To start a new assessment, navigate to the Initial Assessment page and click the "Create New" button.
                Follow the guided process to complete your assessment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-gray-500" />
                <CardTitle className="text-base">What documents do I need for a report?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                For a complete report, you'll need site plans, development drawings, and any relevant council documentation.
                Check our documentation guide for a full list.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>• Design Check Guide</li>
            <li>• Report Writer Guide</li>
            <li>• Consultants Guide</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How to Use the Platform</h2>
          <p className="mb-4">
            To start a new assessment, navigate to the Design Check page and follow the guided process.
            Our platform will help you ensure your design complies with local regulations and requirements.
          </p>
        </section>
      </div>
    </div>
  )
}
