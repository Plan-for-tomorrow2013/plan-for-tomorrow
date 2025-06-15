"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { Textarea } from "@shared/components/ui/textarea"
import { useToast } from "@shared/components/ui/use-toast"
import { Loader2, Plus, Pencil, Save, X } from "lucide-react"
import { PageHeader } from "@shared/components/ui/page-header"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"

interface Consultant {
  id: string
  name: string
  email: string
  phone: string
  company: string
  notes: string
  category: string
  logo?: string
}

interface ConsultantsManagerProps {
  title: string
  description: string
  apiEndpoint: string
}

const categories = [
  "NatHERS & BASIX",
  "Waste Management",
  "Cost Estimate",
  "Stormwater",
  "Traffic",
  "Surveyor",
  "Bushfire",
  "Flooding",
  "Acoustic",
  "Landscaping",
  "Heritage",
  "Biodiversity",
  "Lawyer",
  "Certifiers",
  "Arborist"
]

export function ConsultantsManager({
  title,
  description,
  apiEndpoint,
}: ConsultantsManagerProps) {
  const { toast } = useToast()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    category: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Consultant>>({})
  const [selectedCategory, setSelectedCategory] = useState(categories[0])

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      const response = await fetch(apiEndpoint)
      if (!response.ok) throw new Error(`Failed to fetch ${title}`)
      const data = await response.json()
      setConsultants(data)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load ${title}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setLogoFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let response
      if (logoFile) {
        const formDataToSend = new FormData()
        Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value))
        formDataToSend.append('logo', logoFile)
        formDataToSend.append('category', selectedCategory)
        response = await fetch(apiEndpoint, {
          method: 'POST',
          body: formDataToSend,
        })
      } else {
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, category: selectedCategory }),
        })
      }
      if (!response.ok) throw new Error(`Failed to create ${title}`)
      const newConsultant = await response.json()
      setConsultants(prev => [...prev, newConsultant])
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
        category: selectedCategory,
      })
      setLogoFile(null)
      setLogoPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast({ title: 'Success', description: `${title} created successfully` })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: `Failed to create ${title}: ${(error as Error).message}`,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (consultantId: string) => {
    if (!window.confirm("Are you sure you want to delete this consultant? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`${apiEndpoint}/${consultantId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete consultant')

      setConsultants(prev => prev.filter(consultant => consultant.id !== consultantId))
      toast({ title: "Success", description: "Consultant deleted successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete consultant: " + (error as Error).message,
        variant: "destructive"
      })
    }
  }

  const startEdit = (consultant: Consultant) => {
    setEditingId(consultant.id)
    setEditForm({ ...consultant })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleEditChange = (field: keyof Consultant, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      const response = await fetch(`${apiEndpoint}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, category: selectedCategory }),
      })
      if (!response.ok) throw new Error('Failed to update consultant')
      const updated = await response.json()
      setConsultants(prev => prev.map(c => c.id === editingId ? updated : c))
      toast({ title: 'Success', description: 'Consultant updated successfully' })
      setEditingId(null)
      setEditForm({})
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update consultant', variant: 'destructive' })
    }
  }

  const filteredConsultants = consultants.filter(c => c.category === selectedCategory)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title={title}
          description={description}
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
        title={title}
        description={description}
        backHref="/admin"
      />
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Consultant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Consultant Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="consultant@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="0400 000 000"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input
                  value={formData.company}
                  onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  ref={fileInputRef}
                />
                {logoPreview && (
                  <img src={logoPreview} alt="Logo preview" className="h-12 w-12 rounded-full mt-2 object-cover border" />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the consultant"
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Consultant
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConsultants.map((consultant) => (
            <Card key={consultant.id}>
              <CardHeader className="flex flex-row items-center gap-3">
                {consultant.logo ? (
                  <img src={consultant.logo} alt="Logo" className="h-10 w-10 rounded-full object-cover border" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border">
                    {consultant.name ? consultant.name[0] : '?'}
                  </div>
                )}
                <CardTitle>{consultant.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {editingId === consultant.id ? (
                  <div className="space-y-2">
                    <div>
                      <strong>Company:</strong>{' '}
                      <Input
                        value={editForm.company || ''}
                        onChange={e => handleEditChange('company', e.target.value)}
                        className="inline w-auto"
                      />
                    </div>
                    <div>
                      <strong>Email:</strong>{' '}
                      <Input
                        value={editForm.email || ''}
                        onChange={e => handleEditChange('email', e.target.value)}
                        className="inline w-auto"
                      />
                    </div>
                    <div>
                      <strong>Phone:</strong>{' '}
                      <Input
                        value={editForm.phone || ''}
                        onChange={e => handleEditChange('phone', e.target.value)}
                        className="inline w-auto"
                      />
                    </div>
                    <div>
                      <strong>Notes:</strong>{' '}
                      <Textarea
                        value={editForm.notes || ''}
                        onChange={e => handleEditChange('notes', e.target.value)}
                        className="inline w-auto"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={saveEdit}>
                        <Save className="h-4 w-4 mr-1" /> Save Changes
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <strong>Company:</strong> {consultant.company}
                    </div>
                    <div>
                      <strong>Email:</strong> {consultant.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {consultant.phone}
                    </div>
                    <div>
                      <strong>Notes:</strong> {consultant.notes}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(consultant)}>Edit</Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(consultant.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredConsultants.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consultants found</h3>
            <p className="text-gray-500">No consultants available yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
