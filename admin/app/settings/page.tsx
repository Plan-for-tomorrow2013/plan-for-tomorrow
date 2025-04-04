"use client"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { useToast } from "../../hooks/use-toast"
import { useState } from "react"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-2">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your full name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="Enter your phone number" />
              </div>
            </div>
            <Separator />
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your portal experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Preferred Currency</Label>
                <Input id="currency" placeholder="AUD" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">Time Zone</Label>
                <Input id="timezone" placeholder="Australia/Sydney" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Input id="language" placeholder="English" />
              </div>
            </div>
            <Separator />
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your projects and assessments
                  </p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get instant updates on your phone
                  </p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
            </div>
            <Separator />
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Notification Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Password</Label>
                  <p className="text-sm text-muted-foreground">
                    Change your account password
                  </p>
                </div>
                <Button variant="outline">Change</Button>
              </div>
            </div>
            <Separator />
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 