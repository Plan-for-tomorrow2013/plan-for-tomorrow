'use client';

import { useState } from 'react';
import { HelpCircle, Search, Mail, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/components/ui/accordion';
import { PageHeader } from '@shared/components/ui/page-header';

const HELP_SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I create a new job?',
        answer:
          "To create a new job, go to the Dashboard and use the 'New Job' form. Enter the address and select the job stage. You can also upload relevant documents at this stage.",
      },
      {
        question: 'What documents do I need?',
        answer:
          "Required documents vary by job type. Generally, you'll need architectural plans, a site survey, and property information. The system will guide you through required documents for your specific case.",
      },
    ],
  },
  {
    title: 'Initial Assessment',
    items: [
      {
        question: 'How does the Initial Assessment work?',
        answer:
          'The Initial Assessment uses AI to analyze your project against council requirements. You can also chat with our system to get instant answers about planning rules and requirements.',
      },
      {
        question: 'Can I purchase pre-configured assessments?',
        answer:
          'Yes, you can purchase pre-configured assessments for various development types including alterations, single dwellings, dual occupancy, and more.',
      },
    ],
  },
  {
    title: 'Design Check',
    items: [
      {
        question: 'What does the Design Check analyze?',
        answer:
          'The Design Check analyzes your architectural plans against council-specific development controls, including building height, setbacks, FSR, and more.',
      },
      {
        question: 'How accurate is the Design Check?',
        answer:
          'Our Design Check uses advanced AI to provide highly accurate results. However, we recommend reviewing the results with your architect or planner.',
      },
    ],
  },
  {
    title: 'Report Writer',
    items: [
      {
        question: 'What types of reports can I generate?',
        answer:
          'You can generate Complying Development Certificates (CDC) and Statements of Environmental Effects (SoEE) for various development types.',
      },
      {
        question: 'How long does report review take?',
        answer:
          "Reports are typically reviewed within 1-2 business days. You'll receive an email notification when your report is ready.",
      },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSections, setFilteredSections] = useState(HELP_SECTIONS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredSections(HELP_SECTIONS);
      return;
    }

    const filtered = HELP_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(
        item =>
          item.question.toLowerCase().includes(query.toLowerCase()) ||
          item.answer.toLowerCase().includes(query.toLowerCase())
      ),
    })).filter(section => section.items.length > 0);

    setFilteredSections(filtered);
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@example.com?subject=Portal Support Request';
  };

  return (
    <div className="p-6">
      <PageHeader title="Help Center" icon={<HelpCircle className="h-6 w-6" />} />

      <div className="max-w-full mx-auto space-y-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Need help with the portal?</h2>
              <p>Search our help articles or contact us directly</p>
              <div className="max-w-xl mx-auto flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    placeholder="Search help articles..."
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    className="pl-8 bg-white text-primary border-0"
                  />
                </div>
                <Button
                  variant="outline"
                  className="bg-white hover:bg-white/90"
                  onClick={handleContactSupport}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {filteredSections.map(section => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>
                  Everything you need to know about {section.title.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Frequently accessed features and guides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Video Tutorials', href: '/help/tutorials' },
                { title: 'User Guide PDF', href: '/help/guide.pdf' },
                { title: 'FAQ', href: '/help/faq' },
                { title: 'Support Portal', href: '/help/support' },
              ].map(link => (
                <Button key={link.title} variant="outline" className="justify-between" asChild>
                  <a href={link.href}>
                    {link.title}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
