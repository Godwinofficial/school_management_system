import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AuthService } from "@/lib/auth";
import { Settings as SettingsIcon, User, Bell, Shield, Database, Download, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const { toast } = useToast();
  
  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();

  const [userSettings, setUserSettings] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '', 
    email: user?.email || '',
    notifications: {
      email: true,
      browser: true,
      reports: true,
      deadlines: true
    },
    preferences: {
      theme: 'system',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    privacy: {
      profileVisible: true,
      analyticsOptOut: false,
      dataSharing: false
    }
  });

  const [systemSettings, setSystemSettings] = useState({
    schoolYear: '2024-2025',
    termDates: {
      term1Start: '2024-01-15',
      term1End: '2024-04-12',
      term2Start: '2024-05-06',
      term2End: '2024-08-09',
      term3Start: '2024-09-02', 
      term3End: '2024-12-06'
    },
    grading: {
      system: 'ABC',
      passGrade: 'C'
    },
    backup: {
      autoBackup: true,
      frequency: 'weekly',
      retention: '6months'
    }
  });

  const saveSettings = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully."
    });
  };

  const exportData = async () => {
    setBackupInProgress(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBackupInProgress(false);
    toast({
      title: "Data exported",
      description: "Your data has been exported successfully."
    });
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "Import started",
          description: `Importing data from ${file.name}...`
        });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, preferences, and system configuration
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} Level
        </Badge>
      </div>

      {/* User Profile Settings */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Update your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={userSettings.firstName}
                onChange={(e) => setUserSettings({
                  ...userSettings,
                  firstName: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={userSettings.lastName}
                onChange={(e) => setUserSettings({
                  ...userSettings,
                  lastName: e.target.value
                })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={userSettings.email}
              onChange={(e) => setUserSettings({
                ...userSettings,
                email: e.target.value
              })}
            />
          </div>

          {user?.school && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="font-medium">Institution Information</div>
                <div className="text-sm text-muted-foreground">
                  <div><strong>School:</strong> {user.school.name}</div>
                  <div><strong>Type:</strong> {user.school.type}</div>
                  <div><strong>Location:</strong> {user.school.district}, {user.school.province}</div>
                  <div><strong>Center Number:</strong> {user.school.centerNumber}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Receive notifications via email
                </div>
              </div>
              <Switch
                checked={userSettings.notifications.email}
                onCheckedChange={(checked) => setUserSettings({
                  ...userSettings,
                  notifications: { ...userSettings.notifications, email: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Browser Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Show notifications in your browser
                </div>
              </div>
              <Switch
                checked={userSettings.notifications.browser}
                onCheckedChange={(checked) => setUserSettings({
                  ...userSettings,
                  notifications: { ...userSettings.notifications, browser: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Report Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Get notified when reports are ready
                </div>
              </div>
              <Switch
                checked={userSettings.notifications.reports}
                onCheckedChange={(checked) => setUserSettings({
                  ...userSettings,
                  notifications: { ...userSettings.notifications, reports: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Deadline Reminders</div>
                <div className="text-sm text-muted-foreground">
                  Reminders for important deadlines
                </div>
              </div>
              <Switch
                checked={userSettings.notifications.deadlines}
                onCheckedChange={(checked) => setUserSettings({
                  ...userSettings,
                  notifications: { ...userSettings.notifications, deadlines: checked }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Display Preferences
          </CardTitle>
          <CardDescription>
            Customize your interface and display options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select 
                value={userSettings.preferences.theme}
                onValueChange={(value) => setUserSettings({
                  ...userSettings,
                  preferences: { ...userSettings.preferences, theme: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select 
                value={userSettings.preferences.language}
                onValueChange={(value) => setUserSettings({
                  ...userSettings,
                  preferences: { ...userSettings.preferences, language: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ny">Chichewa</SelectItem>
                  <SelectItem value="bem">Bemba</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select 
                value={userSettings.preferences.dateFormat}
                onValueChange={(value) => setUserSettings({
                  ...userSettings,
                  preferences: { ...userSettings.preferences, dateFormat: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select 
                value={userSettings.preferences.timeFormat}
                onValueChange={(value) => setUserSettings({
                  ...userSettings,
                  preferences: { ...userSettings.preferences, timeFormat: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings (Admin Only) */}
      {(userLevel === 'national' || userLevel === 'provincial' || userLevel === 'district') && (
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Configuration
            </CardTitle>
            <CardDescription>
              Administrative settings for system management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Input
                  value={systemSettings.schoolYear}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    schoolYear: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Grading System</Label>
                <Select 
                  value={systemSettings.grading.system}
                  onValueChange={(value) => setSystemSettings({
                    ...systemSettings,
                    grading: { ...systemSettings.grading, system: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABC">A, B, C System</SelectItem>
                    <SelectItem value="numeric">Numeric (0-100)</SelectItem>
                    <SelectItem value="gpa">GPA (0-4.0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4">Term Dates</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-3">
                  <div className="font-medium text-sm">Term 1</div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={systemSettings.termDates.term1Start}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        termDates: { ...systemSettings.termDates, term1Start: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={systemSettings.termDates.term1End}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        termDates: { ...systemSettings.termDates, term1End: e.target.value }
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="font-medium text-sm">Term 2</div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={systemSettings.termDates.term2Start}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        termDates: { ...systemSettings.termDates, term2Start: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={systemSettings.termDates.term2End}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        termDates: { ...systemSettings.termDates, term2End: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="font-medium text-sm">Term 3</div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={systemSettings.termDates.term3Start}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        termDates: { ...systemSettings.termDates, term3Start: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={systemSettings.termDates.term3End}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        termDates: { ...systemSettings.termDates, term3End: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Management */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, and backup your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              onClick={exportData}
              disabled={backupInProgress}
              className="flex items-center gap-2"
            >
              {backupInProgress ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Data
            </Button>
            
            <Button 
              variant="outline" 
              onClick={importData}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
            
            <Button 
              variant="outline" 
              onClick={exportData}
              disabled={backupInProgress}
              className="flex items-center gap-2"
            >
              {backupInProgress ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Create Backup
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto Backup</div>
                <div className="text-sm text-muted-foreground">
                  Automatically backup data weekly
                </div>
              </div>
              <Switch
                checked={systemSettings.backup.autoBackup}
                onCheckedChange={(checked) => setSystemSettings({
                  ...systemSettings,
                  backup: { ...systemSettings.backup, autoBackup: checked }
                })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <Select 
                  value={systemSettings.backup.frequency}
                  onValueChange={(value) => setSystemSettings({
                    ...systemSettings,
                    backup: { ...systemSettings.backup, frequency: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Retention Period</Label>
                <Select 
                  value={systemSettings.backup.retention}
                  onValueChange={(value) => setSystemSettings({
                    ...systemSettings,
                    backup: { ...systemSettings.backup, retention: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 Month</SelectItem>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Profile Visibility</div>
                <div className="text-sm text-muted-foreground">
                  Make your profile visible to other users
                </div>
              </div>
              <Switch
                checked={userSettings.privacy.profileVisible}
                onCheckedChange={(checked) => setUserSettings({
                  ...userSettings,
                  privacy: { ...userSettings.privacy, profileVisible: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Analytics Opt-out</div>
                <div className="text-sm text-muted-foreground">
                  Exclude your data from analytics reports
                </div>
              </div>
              <Switch
                checked={userSettings.privacy.analyticsOptOut}
                onCheckedChange={(checked) => setUserSettings({
                  ...userSettings,
                  privacy: { ...userSettings.privacy, analyticsOptOut: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Data Sharing</div>
                <div className="text-sm text-muted-foreground">
                  Share anonymized data for research purposes
                </div>
              </div>
              <Switch
                checked={userSettings.privacy.dataSharing}
                onCheckedChange={(checked) => setUserSettings({
                  ...userSettings,
                  privacy: { ...userSettings.privacy, dataSharing: checked }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button 
          onClick={saveSettings}
          disabled={saving}
          size="lg"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
}