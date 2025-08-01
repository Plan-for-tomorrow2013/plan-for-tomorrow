'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { PageHeader } from '@shared/components/ui/page-header';
import { Clock } from 'lucide-react';

export default function DesignCheckPage() {
  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Design Check"
        description="Design check of a property"
        backHref="/professionals/dashboard"
      />

      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Clock className="h-12 w-12 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
