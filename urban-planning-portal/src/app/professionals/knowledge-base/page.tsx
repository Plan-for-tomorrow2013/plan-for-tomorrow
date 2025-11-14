'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { FileText, Building2, Lightbulb, Recycle, Hammer, ChevronDown, ChevronUp } from 'lucide-react';
import { FeedbackForm } from '@shared/components/FeedbackForm';
import { useState } from 'react';
import { toast } from '@shared/components/ui/use-toast';

const navItems = [
  {
    title: 'development-application',
    href: '/professionals/knowledge-base/development-application',
  },
  {
    title: 'complying-development',
    href: '/professionals/knowledge-base/complying-development',
  },
  {
    title: 'nathers-basix',
    href: '/professionals/knowledge-base/nathers-basix',
  },
  {
    title: 'waste-management',
    href: '/professionals/knowledge-base/waste-management',
  },
  {
    title: 'pre-construction',
    href: '/professionals/knowledge-base/pre-construction',
  },

];
export default function KnowledgeBasePage() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const toggleFeedback = () => {
    setIsFeedbackOpen(prev => !prev);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Knowledge Base</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/professionals/knowledge-base/development-application">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-500" />
                <CardTitle className="text-lg">Development Application</CardTitle>
              </div>
              <CardDescription>
                Guidelines and requirements for development applications
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/professionals/knowledge-base/complying-development">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-green-500" />
                <CardTitle className="text-lg">Complying Development</CardTitle>
              </div>
              <CardDescription>SEPP codes and complying development regulations</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/professionals/knowledge-base/nathers-basix">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                <CardTitle className="text-lg">NatHERS & BASIX</CardTitle>
              </div>
              <CardDescription>Energy efficiency and sustainability requirements</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/professionals/knowledge-base/waste-management">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Recycle className="h-6 w-6 text-purple-500" />
                <CardTitle className="text-lg">Waste Management</CardTitle>
              </div>
              <CardDescription>Waste management guidelines and calculators</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/professionals/knowledge-base/pre-construction">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Hammer className="h-6 w-6 text-green-500" />
                <CardTitle className="text-lg">Pre-Construction</CardTitle>
              </div>
              <CardDescription>Pre-Construction planning and preparation</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/professionals/knowledge-base/construction-certificate">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Hammer className="h-6 w-6 text-green-500" />
                <CardTitle className="text-lg">Construction Certificate</CardTitle>
              </div>
              <CardDescription>Construction certificate requirements and application process</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/professionals/knowledge-base/occupation-certificate">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Hammer className="h-6 w-6 text-green-500" />
                <CardTitle className="text-lg">Occupation Certificate</CardTitle>
              </div>
              <CardDescription>Pre-Construction planning and preparation</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="border rounded-lg p-4 mt-8">
        <button onClick={toggleFeedback} className="flex items-center justify-between w-full">
          <h2 className="text-xl font-semibold">Feedback</h2>
          {isFeedbackOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        {isFeedbackOpen && (
          <div className="mt-4">
            <FeedbackForm
              title="Help Us Improve"
              description="We value your feedback! Let us know how we can improve the knowledge base."
              showJobSelection={false}
              onSubmit={async data => {
                console.log('Knowledge base feedback submitted:', data);
                toast({
                  title: 'Feedback Submitted',
                  description: 'Thank you for your feedback! We appreciate your input.',
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
