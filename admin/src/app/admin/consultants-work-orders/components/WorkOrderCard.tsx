import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { FileText, Clock, Upload, CheckCircle, DollarSign, Loader2 } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { ConsultantWorkOrder } from '@shared/types/consultantsWorkOrder';
import { useState } from 'react';

interface WorkOrderCardProps {
  workOrder: ConsultantWorkOrder;
  onUploadDocument: (orderId: string, file: File, type: 'report' | 'invoice') => Promise<void>;
  onCompleteWork: (orderId: string) => Promise<void>;
  getStatusColor: (status: string) => string;
}

export function WorkOrderCard({
  workOrder,
  onUploadDocument,
  onCompleteWork,
  getStatusColor,
}: WorkOrderCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'report' | 'invoice') => {
    const file = event.target.files?.[0];
    console.log(`[WorkOrderCard] File selected for upload:`, { type, file, workOrderId: workOrder.id });
    if (!file) return;

    setIsUploading(true);
    try {
      await onUploadDocument(workOrder.id, file, type);
    } finally {
      setIsUploading(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onCompleteWork(workOrder.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const canComplete = workOrder.completedDocument && workOrder.invoice;

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-[#323A40] text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{workOrder.consultantName}</h3>
            <p className="text-sm text-gray-300">{workOrder.category}</p>
            <p className="text-xs text-gray-400 mt-1">
              Job: {workOrder.jobAddress}
            </p>
          </div>
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(workOrder.status))}>
            {workOrder.status.replace('-', ' ')}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Accepted: {new Date(workOrder.acceptedAt || workOrder.createdAt).toLocaleDateString()}</span>
          </div>
          
          {workOrder.quoteAmount && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>Quote Amount: ${workOrder.quoteAmount}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Final Report</span>
            {workOrder.completedDocument ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={isUploading}
                onClick={() => { console.log(`[WorkOrderCard] Upload Final Report clicked for`, workOrder.id); document.getElementById(`report-upload-${workOrder.id}`)?.click(); }}
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Invoice</span>
            {workOrder.invoice ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={isUploading}
                onClick={() => { console.log(`[WorkOrderCard] Upload Invoice clicked for`, workOrder.id); document.getElementById(`invoice-upload-${workOrder.id}`)?.click(); }}
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </Button>
            )}
          </div>
        </div>

        {canComplete && workOrder.status !== 'completed' && (
          <Button
            className="w-full"
            onClick={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete & Return
              </>
            )}
          </Button>
        )}

        {workOrder.status === 'completed' && (
          <div className="text-center text-green-600 text-sm">
            <CheckCircle className="h-4 w-4 inline mr-1" />
            Work completed and returned
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          id={`report-upload-${workOrder.id}`}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFileUpload(e, 'report')}
        />
        <input
          id={`invoice-upload-${workOrder.id}`}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFileUpload(e, 'invoice')}
        />
      </CardContent>
    </Card>
  );
} 