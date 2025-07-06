'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@shared/components/ui/use-toast';
import { ConsultantTicket } from '@shared/types/consultantsTickets';
import { PageHeader } from '@shared/components/ui/page-header';
import { ConsultantTicketCard } from '../../../components/ConsultantTicketCard';

export default function ConsultantTicketsPage() {
  const [tickets, setTickets] = useState<ConsultantTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/consultant-tickets');
        if (!response.ok) {
          throw new Error('Failed to fetch consultant tickets');
        }
        const data = await response.json();
        // Sort tickets by createdAt in descending order (newest first)
        const sortedTickets = data.sort(
          (a: ConsultantTicket, b: ConsultantTicket) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTickets(sortedTickets);
      } catch (error) {
        console.error('Error fetching consultant tickets:', error);
        setError('Failed to load consultant tickets');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchTickets();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(fetchTickets, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUploadDocument = async (ticketId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ticketId', ticketId);

      const response = await fetch('/api/consultant-tickets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const updatedTicket = await response.json();
      setTickets(tickets.map(ticket => (ticket.id === ticketId ? updatedTicket : ticket)));

      toast({
        title: 'Document uploaded successfully',
        description: 'The completed assessment has been uploaded.',
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error uploading document',
        description: 'Failed to upload the document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReturnDocument = async (ticketId: string) => {
    try {
      const response = await fetch('/api/consultant-tickets/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to return document');
      }

      const result = await response.json();
      setTickets(tickets.map(ticket => (ticket.id === ticketId ? result : ticket)));

      toast({
        title: 'Success',
        description: 'The document has been returned successfully.',
      });
    } catch (error) {
      console.error('Error returning document:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to process the document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Consultant Tickets"
          description="View and manage consultant tickets"
          backHref="/admin"
        />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Consultant Tickets"
          description="View and manage consultant tickets"
          backHref="/admin"
        />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Consultant Tickets"
        description="View and manage consultant tickets"
        backHref="/admin"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tickets.map(ticket => (
          <ConsultantTicketCard
            key={ticket.id}
            ticket={ticket}
            onUploadDocument={handleUploadDocument}
            onReturnDocument={handleReturnDocument}
            getStatusColor={getStatusColor}
          />
        ))}

        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-500">No consultant tickets found</div>
        )}
      </div>
    </div>
  );
}
