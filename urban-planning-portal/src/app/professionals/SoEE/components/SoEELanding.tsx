import React from "react";
import Link from "next/link";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { ArrowRight, FileText, ClipboardList } from "lucide-react";

interface SoEELandingProps {
  jobId?: string;
}

export default function SoEELanding({ jobId }: SoEELandingProps) {
  // Build the correct link
  const startHref = jobId
    ? `/professionals/SoEE/form/property-details?job=${jobId}`
    : `/professionals/SoEE/form/property-details`;

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto max-w-5xl py-10">
        
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Check Property Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide information about the property including address, lot details, and site characteristics.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  2
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
                    3
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
                    4
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
                  5
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
          <Link href={startHref}>
            <Button size="lg" className="gap-2">
              Start Creating Your Document <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 