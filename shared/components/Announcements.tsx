"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card"
import { Button } from "@shared/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@shared/components/ui/use-toast"
import { Announcement } from "@shared/types/announcements"
import dynamic from 'next/dynamic'
// import 'react-quill/dist/quill.snow.css' // Temporarily commented out due to missing CSS files
import sanitizeHtml from 'sanitize-html'
import { stripHtml } from 'string-strip-html'

// Dynamically import the rich text editor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@shared/components/RichTextEditor').then(mod => mod.RichTextEditor), {
  ssr: false,
  loading: () => <p className="text-sm text-muted-foreground">Loading content...</p>
})

interface AnnouncementsProps {
  announcements: Announcement[]
  isAdmin?: boolean
  onAddAnnouncement?: () => void
  enableWebSocket?: boolean
  enableRichText?: boolean
  className?: string
}

export function Announcements({
  announcements: initialAnnouncements,
  isAdmin = false,
  onAddAnnouncement,
  enableWebSocket = false,
  enableRichText = false,
  className = ""
}: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
  const { toast } = useToast()

  // Log initial announcements for debugging
  useEffect(() => {
    console.log('Initial announcements:', initialAnnouncements)
    setAnnouncements(initialAnnouncements)
  }, [initialAnnouncements])

  useEffect(() => {
    if (!enableWebSocket) return

    // Set up WebSocket connection
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'announcement') {
        switch (data.action) {
          case 'created':
            setAnnouncements(prev => [data.data, ...prev])
            if (isAdmin) {
              toast({
                title: "New Announcement",
                description: data.data.title
              })
            }
            break
          case 'updated':
            setAnnouncements(prev => prev.map(a => a.id === data.data.id ? data.data : a))
            break
          case 'deleted':
            setAnnouncements(prev => prev.filter(a => a.id !== data.data.id))
            break
        }
      }
    }

    return () => {
      ws.close()
    }
  }, [enableWebSocket, isAdmin, toast])

  // Log current announcements for debugging
  useEffect(() => {
    console.log('Current announcements:', announcements)
  }, [announcements])

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Announcements</CardTitle>
          {isAdmin && onAddAnnouncement && (
            <Button variant="outline" size="sm" onClick={onAddAnnouncement}>
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements
            .slice() // copy array
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((announcement) => (
            <div key={announcement.id} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{announcement.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {new Date(announcement.date).toLocaleDateString()}
                </span>
              </div>
              {announcement.isRichText ? (
                <div
                  className="mt-1 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.content) }}
                />
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{stripHtml(announcement.content).result}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">Posted by {announcement.author}</p>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No announcements at this time
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
