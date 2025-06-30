import Link from "next/link"
import { Button } from "@/app/professionals/SoEE/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/professionals/SoEE/components/ui/card"
import { ArrowRight, FileText, ClipboardList } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Statement of Environmental Effects Generator</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Generate a basic Statement of Environmental Effects for your development application by answering a series
            of questions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-10">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Easy Document Creation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Generate a Basic Statement of Environmental Effects by answering simple questions about your
                development.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" />
                Compliance Focused
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ensures your Statement of Environmental Effects addresses all required planning controls.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-10">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Complete the following steps to generate your Statement of Environmental Effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Project Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide basic information about your development project and council area.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Enter Property Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide information about the property including address, lot details, and site characteristics.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Describe Your Development</h3>
                  <p className="text-sm text-muted-foreground">
                    Detail the proposed development including any demolition, construction, or alterations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  4
                </div>
                <div>
                  <h3 className="font-medium">Planning Controls</h3>
                  <p className="text-sm text-muted-foreground">
                    Assess compliance with relevant planning controls and regulations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  5
                </div>
                <div>
                  <h3 className="font-medium">Environmental Considerations</h3>
                  <p className="text-sm text-muted-foreground">
                    Answer questions about environmental impacts, privacy, overshadowing, and other factors.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  6
                </div>
                <div>
                  <h3 className="font-medium">Generate & Download</h3>
                  <p className="text-sm text-muted-foreground">
                    Review your document, make any final adjustments, and download the completed Statement of
                    Environmental Effects.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href="/professionals/SoEE/form/project-setup">
            <Button size="lg" className="gap-2">
              Start Creating Your Document <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

