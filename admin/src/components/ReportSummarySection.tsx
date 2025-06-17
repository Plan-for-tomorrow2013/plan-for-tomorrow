interface ReportSummarySectionProps {
  report: any
  jobId: string
}

export function ReportSummarySection({ report, jobId }: ReportSummarySectionProps) {
  if (!report) return null;
  const docs = report.documents || {};
  const docList = [
    { key: 'certificate107', label: '10.7 Certificate', doc: docs.certificate107 },
    { key: 'certificateOfTitle', label: 'Certificate of Title', doc: docs.certificateOfTitle },
    { key: 'surveyPlan', label: 'Survey Plan', doc: docs.surveyPlan },
    { key: 'architecturalPlan', label: 'Architectural Plan', doc: docs.architecturalPlan },
  ];
  return (
    <div className="mb-2">
      <div className="font-semibold text-sm">Documents to be Attached:</div>
      <ul className="list-disc list-inside text-xs">
        {docList.map(({ key, label, doc }) =>
          doc && (doc.fileName || doc.originalName) ? (
            <li key={key}>
              {doc.originalName || label}
              {doc.fileName && (
                <>
                  {' '}
                  <a
                    href={`/api/download-document?jobId=${jobId}&fileName=${encodeURIComponent(doc.fileName)}&originalName=${encodeURIComponent(doc.originalName || label)}`}
                    download={doc.originalName || label}
                    className="text-blue-600 hover:underline ml-1"
                  >
                    (Download)
                  </a>
                </>
              )}
            </li>
          ) : null
        )}
      </ul>
      <div className="text-xs mt-1">
      </div>
    </div>
  );
}
