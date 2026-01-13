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
import { Settings as SettingsIcon, User, Bell, Shield, Database, Download, Upload, RefreshCw, Layers, Plus, Trash2 } from "lucide-react";
import { SchoolService } from "@/lib/SchoolService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const [academicConfig, setAcademicConfig] = useState({
    grades: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    streams: ['A', 'B', 'C']
  });

  const [newGrade, setNewGrade] = useState("");
  const [newStream, setNewStream] = useState("");

  const saveSettings = async () => {
    setSaving(true);
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

  const handleBatchCreate = async () => {
    if (!user?.school?.id) return;
    setSaving(true);
    try {
      // Fetch existing classes to avoid duplicates
      const existingClasses = await SchoolService.getClasses(user.school.id);
      const existingMap = new Set(existingClasses.map(c => c.name.toLowerCase()));

      const classesToCreate = [];
      let skippedCount = 0;

      for (const grade of academicConfig.grades) {
        for (const stream of academicConfig.streams) {
          const className = `Grade ${grade}${stream}`;

          if (existingMap.has(className.toLowerCase())) {
            skippedCount++;
            continue;
          }

          classesToCreate.push({
            school_id: user.school.id,
            name: className,
            level: parseInt(grade) || 0,
            stream: stream,
            capacity: 40
          });
        }
      }

      if (classesToCreate.length > 0) {
        await SchoolService.createClasses(classesToCreate);
        toast({
          title: "Setup Complete",
          description: `Successfully created ${classesToCreate.length} new classes. ${skippedCount > 0 ? `Skipped ${skippedCount} existing classes.` : ''}`
        });
      } else {
        toast({
          title: "Registry Up to Date",
          description: `All ${skippedCount} selected classes already exist in your school structure.`
        });
      }

    } catch (error) {
      console.error("Batch creation failed:", error);
      toast({
        title: "Error",
        description: "Batch creation failed. Please check your internet connection.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, preferences, and school structure
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} Level
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="structure">School Structure</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6">
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={userSettings.firstName} onChange={(e) => setUserSettings({ ...userSettings, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={userSettings.lastName} onChange={(e) => setUserSettings({ ...userSettings, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={userSettings.email} onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Display Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={userSettings.preferences.theme} onValueChange={(v) => setUserSettings({ ...userSettings, preferences: { ...userSettings.preferences, theme: v } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={userSettings.preferences.language} onValueChange={(v) => setUserSettings({ ...userSettings, preferences: { ...userSettings.preferences, language: v } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ny">Chichewa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(userSettings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="capitalize">{key} Notifications</div>
                  <Switch checked={value} onCheckedChange={(checked) => setUserSettings({ ...userSettings, notifications: { ...userSettings.notifications, [key]: checked } })} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Grade Levels
                </CardTitle>
                <CardDescription>Manage available grades in your school</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter grade (e.g. 1)"
                    value={newGrade}
                    onChange={e => setNewGrade(e.target.value)}
                  />
                  <Button size="icon" onClick={() => {
                    if (newGrade && !academicConfig.grades.includes(newGrade)) {
                      setAcademicConfig({ ...academicConfig, grades: [...academicConfig.grades, newGrade].sort((a, b) => parseInt(a) - parseInt(b)) });
                      setNewGrade("");
                    }
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {academicConfig.grades.map(grade => (
                    <Badge key={grade} variant="secondary" className="px-3 py-1 gap-2">
                      Grade {grade}
                      <Trash2 className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" onClick={() => setAcademicConfig({ ...academicConfig, grades: academicConfig.grades.filter(g => g !== grade) })} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-success" />
                  Streams
                </CardTitle>
                <CardDescription>Define how you divide your grade levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter stream (e.g. A or Red)"
                    value={newStream}
                    onChange={e => setNewStream(e.target.value)}
                  />
                  <Button size="icon" onClick={() => {
                    if (newStream && !academicConfig.streams.includes(newStream)) {
                      setAcademicConfig({ ...academicConfig, streams: [...academicConfig.streams, newStream] });
                      setNewStream("");
                    }
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {academicConfig.streams.map(stream => (
                    <Badge key={stream} variant="outline" className="px-3 py-1 gap-2">
                      {stream}
                      <Trash2 className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" onClick={() => setAcademicConfig({ ...academicConfig, streams: academicConfig.streams.filter(s => s !== stream) })} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-0 shadow-soft bg-primary/5">
              <CardHeader>
                <CardTitle>Quick Setup</CardTitle>
                <CardDescription>Automatically generate your school's class registry based on the grades and streams above.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">This will create {academicConfig.grades.length * academicConfig.streams.length} classes.</p>
                    <p className="text-xs text-muted-foreground">Classrooms like "Grade 1A", "Grade 1B", etc. will be initialized.</p>
                  </div>
                  <Button
                    onClick={handleBatchCreate}
                    disabled={saving || academicConfig.grades.length === 0}
                    variant="default"
                  >
                    {saving ? "Creating..." : "Generate Classrooms"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Input value={systemSettings.schoolYear} onChange={(e) => setSystemSettings({ ...systemSettings, schoolYear: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Grading System</Label>
                  <Select value={systemSettings.grading.system} onValueChange={(v) => setSystemSettings({ ...systemSettings, grading: { ...systemSettings.grading, system: v } })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ABC">A, B, C System</SelectItem>
                      <SelectItem value="numeric">Numeric (0-100)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" onClick={exportData} disabled={backupInProgress}>
                  {backupInProgress ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Export Data
                </Button>
                <Button variant="outline" onClick={importData}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
                <Button variant="outline" onClick={exportData} disabled={backupInProgress}>
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(userSettings.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <Switch checked={value} onCheckedChange={(checked) => setUserSettings({ ...userSettings, privacy: { ...userSettings.privacy, [key]: checked } })} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div >
  );
}
