import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { Button } from "@shared/components/ui/button"
import { FileText, Clock, Upload, Bell } from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { ConsultantTicket } from '@shared/types/consultantsTickets'
import { DocumentRenderer } from '@/components/DocumentRenderer'
import { ReportSummarySection } from '@/components/ReportSummarySection'

// Helper function to get display name for ticket type
const getTicketTypeDisplayName = (type: string): string => {
  switch (type) {
    case 'NatHERS & BASIX':
      return 'NatHERS & BASIX';
    case 'Waste Management':
      return 'Waste Management';
    case 'Cost Estimate':
      return 'Cost Estimate';
    case 'Stormwater':
      return 'Stormwater';
    case 'Traffic':
      return 'Traffic';
    case 'Surveyor':
      return 'Surveyor';
    case 'Bushfire':
      return 'Bushfire';
    case 'Flooding':
      return 'Flooding';
    case 'Acoustic':
      return 'Acoustic';
    case 'Landscaping':
      return 'Landscaping';
    case 'Heritage':
      return 'Heritage';
    case 'Biodiversity':
      return 'Biodiversity';
    case 'Lawyer':
      return 'Lawyer';
    case 'Certifiers':
      return 'Certifiers';
    case 'Arborist':
      return 'Arborist';
    case "Geotechnical":
      return "Geotechnical";
    default:
      return type;
  }
}

interface ConsultantTicketCardProps {
  ticket: ConsultantTicket
  onUploadDocument: (ticketId: string, file: File) => Promise<void>
  onReturnDocument: (ticketId: string) => Promise<void>
  getStatusColor: (status: string) => string
}

export function ConsultantTicketCard({
  ticket,
  onUploadDocument,
  onReturnDocument,
  getStatusColor
}: ConsultantTicketCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium">
              {ticket.consultantName ? `${ticket.consultantName} — ` : ''}{getTicketTypeDisplayName(ticket.category)}
            </h2>
            <p className="text-xs text-gray-500 truncate">{ticket.jobAddress}</p>
            <ReportSummarySection
              report={ticket.assessment}
              jobId={ticket.jobId}
            />
          </div>
          <div className={cn("rounded-md px-2 py-1 text-xs font-semibold", getStatusColor(ticket.status))}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {ticket.documents && ticket.documents.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-1">Documents to be Attached</h3>
              <ul className="list-disc list-inside text-xs mb-2">
                {ticket.documents.map((doc: any) => (
                  <li key={doc.id}>{doc.name}</li>
                ))}
              </ul>
            </div>
          )}

          {ticket.assessment && (
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-sm mb-1">Development Details</h3>
                <p className="text-xs mb-1">
                  <strong>Type:</strong> {ticket.assessment.developmentType}
                </p>
                <p className="text-xs truncate">
                  <strong>Info:</strong> {ticket.assessment.additionalInfo}
                </p>
              </div>
              <DocumentRenderer
                doc={{
                  id: ticket.id,
                  title: getTicketTypeDisplayName(ticket.category),
                  path: ticket.id,
                  type: 'document',
                  category: 'REPORTS',
                  versions: [],
                  currentVersion: 1,
                  createdAt: ticket.assessment.createdAt || new Date().toISOString(),
                  updatedAt: ticket.assessment.updatedAt || new Date().toISOString(),
                  isActive: true,
                  displayStatus: 'uploaded',
                  uploadedFile: {
                    fileName: ticket.assessment.fileName || '',
                    originalName: ticket.assessment.originalName || '',
                    type: 'application/pdf',
                    uploadedAt: ticket.assessment.uploadedAt || new Date().toISOString(),
                    size: ticket.assessment.size || 0
                  }
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
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      onUploadDocument(ticket.id, file)
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
  )
}
