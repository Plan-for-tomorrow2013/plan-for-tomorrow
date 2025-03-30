"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author: string
}

interface AnnouncementsProps {
  announcements: Announcement[]
  isAdmin?: boolean
  onAddAnnouncement?: () => void
}

export function Announcements({ announcements, isAdmin = false, onAddAnnouncement }: AnnouncementsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Announcements</CardTitle>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={onAddAnnouncement}>
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{announcement.title}</h3>
                <span className="text-sm text-muted-foreground">{announcement.date}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{announcement.content}</p>
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