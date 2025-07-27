'use client';

import { useState } from 'react';
import { User, CreditCard, Loader2 } from 'lucide-react';
import { PageHeader } from '@shared/components/ui/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import { Label } from '@shared/components/ui/label';
import { Switch } from '@/app/professionals/account/components/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { useToast } from '@shared/components/ui/use-toast';

interface AccountData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Company Information
  companyName: string;
  abn: string;
  companyAddress: string;

  // Notification Settings
  emailUpdates: boolean;
  jobStatusChanges: boolean;
  reportReadyNotifications: boolean;
  marketingCommunications: boolean;

  // Security
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;

  // Social Media
  linkedin: string;
  facebook: string;
  twitter: string;
  instagram: string;
}

export default function AccountPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const [accountData, setAccountData] = useState<AccountData>({
    // Personal Information
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+61 400 000 000',

    // Company Information
    companyName: '',
    abn: '',
    companyAddress: '',

    // Notification Settings
    emailUpdates: true,
    jobStatusChanges: true,
    reportReadyNotifications: true,
    marketingCommunications: true,

    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',

    // Social Media
    linkedin: '',
    facebook: '',
    twitter: '',
    instagram: '',
  });

  const handleInputChange = (field: keyof AccountData, value: string | boolean) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAll = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/account/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) throw new Error('Update failed');

      toast({
        title: 'Account Updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Account Settings"
        description="Manage your account preferences and settings"
      />

      <div className="w-full">
        <Tabs defaultValue="personal" className="space-y-6 w-full">
          <TabsList className="flex w-full border-b bg-grey-100 p-0">
            <TabsTrigger value="personal" className="flex-1">
              Personal
            </TabsTrigger>
            <TabsTrigger value="company" className="flex-1">
              Company
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1">
              Security
            </TabsTrigger>
            <TabsTrigger value="social" className="flex-1">
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={accountData.firstName}
                      onChange={e => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={accountData.lastName}
                      onChange={e => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={accountData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
                <CardDescription>Update your company information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={accountData.companyName}
                    onChange={e => handleInputChange('companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abn">ABN</Label>
                  <Input
                    id="abn"
                    value={accountData.abn}
                    onChange={e => handleInputChange('abn', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    value={accountData.companyAddress}
                    onChange={e => handleInputChange('companyAddress', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    {
                      id: 'email-updates',
                      label: 'Email Updates',
                      field: 'emailUpdates' as keyof AccountData,
                    },
                    {
                      id: 'job-status',
                      label: 'Job Status Changes',
                      field: 'jobStatusChanges' as keyof AccountData,
                    },
                    {
                      id: 'report-ready',
                      label: 'Report Ready Notifications',
                      field: 'reportReadyNotifications' as keyof AccountData,
                    },
                    {
                      id: 'marketing',
                      label: 'Marketing Communications',
                      field: 'marketingCommunications' as keyof AccountData,
                    },
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <Label htmlFor={item.id}>{item.label}</Label>
                      <Switch
                        id={item.id}
                        checked={accountData[item.field] as boolean}
                        onCheckedChange={checked => handleInputChange(item.field, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={accountData.currentPassword}
                      onChange={e => handleInputChange('currentPassword', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={accountData.newPassword}
                      onChange={e => handleInputChange('newPassword', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={accountData.confirmPassword}
                      onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Connect your social media accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    { id: 'linkedin', label: 'LinkedIn', field: 'linkedin' as keyof AccountData },
                    { id: 'facebook', label: 'Facebook', field: 'facebook' as keyof AccountData },
                    { id: 'twitter', label: 'Twitter', field: 'twitter' as keyof AccountData },
                    {
                      id: 'instagram',
                      label: 'Instagram',
                      field: 'instagram' as keyof AccountData,
                    },
                  ].map(platform => (
                    <div key={platform.id} className="space-y-2">
                      <Label htmlFor={platform.id}>{platform.label}</Label>
                      <Input
                        id={platform.id}
                        placeholder={`Your ${platform.label} profile URL`}
                        value={accountData[platform.field] as string}
                        onChange={e => handleInputChange(platform.field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Single Save Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveAll} disabled={isUpdating} className="px-8">
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
