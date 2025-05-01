"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { useToast } from "@shared/components/ui/use-toast"
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react"
import { PageHeader } from "@shared/components/ui/page-header"
import { Announcement, AnnouncementResponse } from "@shared/types/announcements"
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@shared/components/RichTextEditor').then(mod => mod.RichTextEditor), {
  ssr: false,
  loading: () => <p className="text-sm text-muted-foreground">Loading editor...</p>
})

export default function AnnouncementsPage() {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    isRichText: false
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements')
      if (!response.ok) throw new Error('Failed to fetch announcements')
      const data: AnnouncementResponse = await response.json()
      if (data.error) throw new Error(data.error.message)
      setAnnouncements(data.data as Announcement[])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load announcements",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create announcement')

      const data: AnnouncementResponse = await response.json()
      if (data.error) throw new Error(data.error.message)

      setAnnouncements(prev => [data.data as Announcement, ...prev])
      setFormData({ title: '', content: '', author: '', isRichText: false })

      toast({
        title: "Success",
        description: "Announcement created successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create announcement",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      author: announcement.author,
      isRichText: announcement.isRichText || false
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    setSubmitting(true)

    try {
      const response = await fetch(`/api/announcements/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to update announcement')

      const data: AnnouncementResponse = await response.json()
      if (data.error) throw new Error(data.error.message)

      setAnnouncements(prev =>
        prev.map(announcement =>
          announcement.id === editingId ? data.data as Announcement : announcement
        )
      )
      setEditingId(null)
      setFormData({ title: '', content: '', author: '', isRichText: false })

      toast({
        title: "Success",
        description: "Announcement updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update announcement",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return
    }

    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete announcement')

      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id))

      toast({
        title: "Success",
        description: "Announcement deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete announcement",
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ title: '', content: '', author: '', isRichText: false })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Announcements"
          description="Create and manage announcements"
          backHref="/admin"
        />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Announcements"
        description="Create and manage announcements"
        backHref="/admin"
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Announcement title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content: string) => setFormData(prev => ({ ...prev, content }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Author</label>
                <Input
                  value={formData.author}
                  onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRichText"
                  checked={formData.isRichText}
                  onChange={e => setFormData(prev => ({ ...prev, isRichText: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isRichText" className="text-sm font-medium">
                  Use rich text formatting
                </label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      {editingId ? 'Update Announcement' : 'Create Announcement'}
                    </>
                  )}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{announcement.title}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {announcement.isRichText ? (
                    <div className="mt-1 prose prose-sm max-w-none">
                      <RichTextEditor
                        value={announcement.content}
                        readOnly
                      />
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{announcement.content}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">Posted by {announcement.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(announcement.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No announcements yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
