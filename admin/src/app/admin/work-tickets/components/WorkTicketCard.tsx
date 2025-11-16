import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { FileText, Clock, Upload, Bell } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { WorkTicket } from '@shared/types/workTickets';
import { DocumentRenderer } from '@/components/DocumentRenderer';
import { ReportSummarySection } from '@/components/ReportSummarySection';

// Helper function to get display name for ticket type
const getTicketTypeDisplayName = (type: string): string => {
  switch (type) {
    case 'custom-assessment':
      return 'Custom Assessment';
    case 'statement-of-environmental-effects':
      return 'Statement of Environmental Effects';
    case 'complying-development-certificate':
      return 'Complying Development Certificate';
    case 'waste-management-assessment':
      return 'Waste Management Assessment';
    case 'nathers-assessment':
      return 'Nathers Assessment';
    default:
      return type;
  }
};

interface WorkTicketCardProps {
  ticket: WorkTicket;
  onUploadDocument: (ticketId: string, file: File) => Promise<void>;
  onReturnDocument: (ticketId: string) => Promise<void>;
  getStatusColor: (status: string) => string;
}

export function WorkTicketCard({
  ticket,
  onUploadDocument,
  onReturnDocument,
  getStatusColor,
}: WorkTicketCardProps) {
  return (
    <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium">{getTicketTypeDisplayName(ticket.ticketType)}</h2>
            <p className="text-xs text-gray-500 truncate">{ticket.jobAddress}</p>
            <ReportSummarySection
              report={
                ticket.customAssessment ||
                ticket.statementOfEnvironmentalEffects ||
                ticket.complyingDevelopmentCertificate ||
                ticket.wasteManagementAssessment ||
                ticket.nathersAssessment
              }
              jobId={ticket.jobId}
            />
          </div>
          <div
            className={cn(
              'rounded-md px-2 py-1 text-xs font-semibold',
              getStatusColor(ticket.status)
            )}
          >
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {ticket.ticketType === 'custom-assessment' && ticket.customAssessment && (
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-sm mb-1">Development Details</h3>
                <p className="text-xs mb-1">
                  <strong>Type:</strong> {ticket.customAssessment.developmentType}
                </p>
                <p className="text-xs truncate">
                  <strong>Info:</strong> {ticket.customAssessment.additionalInfo}
                </p>
              </div>
              <DocumentRenderer
                doc={{
                  id: 'custom-assessment',
                  title: 'Custom Assessment',
                  path: 'custom-assessment',
                  type: 'document',
                  category: 'REPORTS',
                  versions: [],
                  currentVersion: 1,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  isActive: true,
                  displayStatus: 'uploaded',
                  uploadedFile: {
                    fileName: ticket.customAssessment.fileName || '',
                    originalName: ticket.customAssessment.originalName || '',
                    type: 'application/pdf',
                    uploadedAt: ticket.customAssessment.uploadedAt || new Date().toISOString(),
                    size: ticket.customAssessment.size || 0,
                  },
                }}
                jobId={ticket.jobId}
              />
            </div>
          )}

          {ticket.ticketType === 'statement-of-environmental-effects' &&
            ticket.statementOfEnvironmentalEffects && (
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-sm mb-1">Development Details</h3>
                  <p className="text-xs mb-1">
                    <strong>Type:</strong> {ticket.statementOfEnvironmentalEffects.developmentType}
                  </p>
                  <p className="text-xs truncate">
                    <strong>Info:</strong> {ticket.statementOfEnvironmentalEffects.additionalInfo}
                  </p>
                </div>
                <DocumentRenderer
                  doc={{
                    id: 'statement-of-environmental-effects',
                    title: 'Statement of Environmental Effects',
                    path: 'statement-of-environmental-effects',
                    type: 'document',
                    category: 'REPORTS',
                    versions: [],
                    currentVersion: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isActive: true,
                    displayStatus: 'uploaded',
                    uploadedFile: {
                      fileName: ticket.statementOfEnvironmentalEffects.fileName || '',
                      originalName: ticket.statementOfEnvironmentalEffects.originalName || '',
                      type: 'application/pdf',
                      uploadedAt:
                        ticket.statementOfEnvironmentalEffects.uploadedAt ||
                        new Date().toISOString(),
                      size: ticket.statementOfEnvironmentalEffects.size || 0,
                    },
                  }}
                  jobId={ticket.jobId}
                />
              </div>
            )}

          {ticket.ticketType === 'complying-development-certificate' &&
            ticket.complyingDevelopmentCertificate && (
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-sm mb-1">Development Details</h3>
                  <p className="text-xs mb-1">
                    <strong>Type:</strong> {ticket.complyingDevelopmentCertificate.developmentType}
                  </p>
                  <p className="text-xs truncate">
                    <strong>Info:</strong> {ticket.complyingDevelopmentCertificate.additionalInfo}
                  </p>
                </div>
                <DocumentRenderer
                  doc={{
                    id: 'complying-development-certificate',
                    title: 'Complying Development Certificate',
                    path: 'complying-development-certificate',
                    type: 'document',
                    category: 'REPORTS',
                    versions: [],
                    currentVersion: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isActive: true,
                    displayStatus: 'uploaded',
                    uploadedFile: {
                      fileName: ticket.complyingDevelopmentCertificate.fileName || '',
                      originalName: ticket.complyingDevelopmentCertificate.originalName || '',
                      type: 'application/pdf',
                      uploadedAt:
                        ticket.complyingDevelopmentCertificate.uploadedAt ||
                        new Date().toISOString(),
                      size: ticket.complyingDevelopmentCertificate.size || 0,
                    },
                  }}
                  jobId={ticket.jobId}
                />
              </div>
            )}

          {ticket.ticketType === 'waste-management-assessment' &&
            ticket.wasteManagementAssessment && (
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-sm mb-1">Development Details</h3>
                  <p className="text-xs mb-1">
                    <strong>Type:</strong> {ticket.wasteManagementAssessment.developmentType}
                  </p>
                  <p className="text-xs truncate">
                    <strong>Info:</strong> {ticket.wasteManagementAssessment.additionalInfo}
                  </p>
                </div>
                <DocumentRenderer
                  doc={{
                    id: 'waste-management-assessment',
                    title: 'Waste Management Assessment',
                    path: 'waste-management-assessment',
                    type: 'document',
                    category: 'REPORTS',
                    versions: [],
                    currentVersion: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isActive: true,
                    displayStatus: 'uploaded',
                    uploadedFile: {
                      fileName: ticket.wasteManagementAssessment.fileName || '',
                      originalName: ticket.wasteManagementAssessment.originalName || '',
                      type: 'application/pdf',
                      uploadedAt:
                        ticket.wasteManagementAssessment.uploadedAt || new Date().toISOString(),
                      size: ticket.wasteManagementAssessment.size || 0,
                    },
                  }}
                  jobId={ticket.jobId}
                />
              </div>
            )}

          {ticket.ticketType === 'nathers-assessment' && ticket.nathersAssessment && (
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-sm mb-1">Development Details</h3>
                <p className="text-xs mb-1">
                  <strong>Type:</strong> {ticket.nathersAssessment.developmentType}
                </p>
                <p className="text-xs truncate">
                  <strong>Info:</strong> {ticket.nathersAssessment.additionalInfo}
                </p>
              </div>
              <DocumentRenderer
                doc={{
                  id: 'nathers-assessment',
                  title: 'Nathers Assessment',
                  path: 'nathers-assessment',
                  type: 'document',
                  category: 'REPORTS',
                  versions: [],
                  currentVersion: 1,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  isActive: true,
                  displayStatus: 'uploaded',
                  uploadedFile: {
                    fileName: ticket.nathersAssessment.fileName || '',
                    originalName: ticket.nathersAssessment.originalName || '',
                    type: 'application/pdf',
                    uploadedAt: ticket.nathersAssessment.uploadedAt || new Date().toISOString(),
                    size: ticket.nathersAssessment.size || 0,
                  },
                }}
                jobId={ticket.jobId}
              />
            </div>
          )}

          <div className="border-t pt-2">
            <h3 className="font-medium text-sm mb-1">Completed Assessment</h3>
            {ticket.completedDocument ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    <span className="truncate">{ticket.completedDocument.originalName}</span>
                  </div>
                  {!ticket.completedDocument.returnedAt && (
                    <Button
                      size="sm"
                      onClick={() => onReturnDocument(ticket.id)}
                      className="flex items-center h-6 text-xs"
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
                {ticket.completedDocument.returnedAt && (
                  <div className="text-xs text-gray-500">
                    <p>Added to stores</p>
                    <p className="text-[10px]">
                      {new Date(ticket.completedDocument.returnedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor={`file-upload-${ticket.id}`} className="cursor-pointer">
                  <div className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800">
                    <Upload className="h-3 w-3" />
                    <span>Upload Assessment</span>
                  </div>
                </label>
                <input
                  id={`file-upload-${ticket.id}`}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onUploadDocument(ticket.id, file);
                    }
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Clock size={12} className="mr-1" />
            <span>{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
