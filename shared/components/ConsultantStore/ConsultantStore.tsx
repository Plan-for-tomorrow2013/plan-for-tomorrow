"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { useConsultants } from '@shared/contexts/consultant-context';
import { ConsultantTile } from '../ConsultantTile';
import { ConsultantStoreProps } from './types';

export function ConsultantStore({
  title = "Consultant Store",
  description = "Documents provided by external consultants."
}: ConsultantStoreProps) {
  const { consultantDocuments, isLoading, error, downloadDocument } = useConsultants();

  const handleDownload = (jobId: string, docId: string) => {
    downloadDocument(jobId, docId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Loading consultant documents...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {consultantDocuments.length > 0 ? (
          consultantDocuments.map((doc) => (
            <ConsultantTile
              key={doc.id}
              document={doc}
              onDownload={() => handleDownload(doc.metadata?.jobId || '', doc.id)}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No consultant documents have been requested or returned for this job yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 