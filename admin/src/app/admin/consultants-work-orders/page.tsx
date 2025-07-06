'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@shared/components/ui/use-toast';
import { ConsultantWorkOrder } from '@shared/types/consultantsWorkOrder';
import { PageHeader } from '@shared/components/ui/page-header';
import { WorkOrderCard } from './components/WorkOrderCard';

export default function ConsultantWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<ConsultantWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch('/api/consultant-work-orders');
      if (!response.ok) {
        throw new Error('Failed to fetch work orders');
      }
      const data = await response.json();
      setWorkOrders(data);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load work orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (orderId: string, file: File, type: 'report' | 'invoice') => {
    console.log('[ConsultantWorkOrdersPage] handleUploadDocument called:', { orderId, file, type });
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ticketId', orderId);
      formData.append('type', type);

      const response = await fetch('/api/consultant-work-orders/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const updatedOrder = await response.json();
      setWorkOrders(prev => 
        prev.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );

      toast({
        title: 'Success',
        description: `${type === 'report' ? 'Final report' : 'Invoice'} uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteWork = async (orderId: string) => {
    try {
      const response = await fetch('/api/consultant-work-orders/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete work order');
      }

      const updatedOrder = await response.json();
      setWorkOrders(prev => 
        prev.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );

      toast({
        title: 'Success',
        description: 'Work order completed and returned to client',
      });
    } catch (error) {
      console.error('Error completing work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete work order',
        variant: 'destructive',
      });
    }
  };

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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Consultant Work Orders"
          description="View and manage consultant work orders"
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
          title="Consultant Work Orders"
          description="View and manage consultant work orders"
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
        title="Consultant Work Orders"
        description="Manage work orders for accepted quotes"
        backHref="/admin"
      />

      {workOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No work orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {workOrders.map((workOrder) => (
            <WorkOrderCard
              key={workOrder.id}
              workOrder={workOrder}
              onUploadDocument={handleUploadDocument}
              onCompleteWork={handleCompleteWork}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
