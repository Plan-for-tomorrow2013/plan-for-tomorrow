'use client'

export default function ReportWriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto p-6">
      {children}
    </div>
  )
}
