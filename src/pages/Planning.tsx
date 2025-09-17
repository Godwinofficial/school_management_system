import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthService } from "@/lib/auth";
import { StorageService } from "@/lib/storage";
import { Calendar, Target, TrendingUp, Users, School, BookOpen, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PlanningGoal {
  id: string;
  title: string;
  description: string;
  category: 'enrollment' | 'infrastructure' | 'academic' | 'teacher' | 'technology';
  priority: 'low' | 'medium' | 'high' | 'critical';
  target: number;
  current: number;
  deadline: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  responsible: string;
}

export default function Planning() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<PlanningGoal>>({
    category: 'enrollment',
    priority: 'medium',
    status: 'planning'
  });

  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();

  const stats = StorageService.getStatistics(
    userLevel === 'student' ? 'school' : userLevel, 
    userLevel === 'school' || userLevel === 'student' ? user?.school?.id : undefined
  );

  // Mock planning goals data
  const [goals, setGoals] = useState<PlanningGoal[]>([
    {
      id: '1',
      title: 'Increase Student Enrollment',
      description: 'Target enrollment increase of 15% for the next academic year',
      category: 'enrollment',
      priority: 'high',
      target: Math.round(stats.totalStudents * 1.15),
      current: stats.totalStudents,
      deadline: '2025-02-01',
      status: 'in-progress',
      responsible: 'Head Teacher'
    },
    {
      id: '2',
      title: 'Improve Academic Performance',
      description: 'Increase excellent performance rate from current to 25%',
      category: 'academic',
      priority: 'critical',
      target: 25,
      current: Math.round((stats.performanceStats.excellent / stats.totalStudents) * 100) || 15,
      deadline: '2025-06-30',
      status: 'in-progress',
      responsible: 'Deputy Head'
    },
    {
      id: '3',
      title: 'Technology Integration',
      description: 'Deploy digital learning platforms in all classrooms',
      category: 'technology',
      priority: 'medium',
      target: 100,
      current: 35,
      deadline: '2025-03-15',
      status: 'planning',
      responsible: 'IT Coordinator'
    },
    {
      id: '4',
      title: 'Teacher Training Program',
      description: 'Complete professional development for all teaching staff',
      category: 'teacher',
      priority: 'high',
      target: 100,
      current: 60,
      deadline: '2025-01-30',
      status: 'in-progress',
      responsible: 'Training Officer'
    }
  ]);

  const categories = [
    { value: 'enrollment', label: 'Enrollment', icon: Users },
    { value: 'infrastructure', label: 'Infrastructure', icon: School },
    { value: 'academic', label: 'Academic', icon: BookOpen },
    { value: 'teacher', label: 'Teaching Staff', icon: Target },
    { value: 'technology', label: 'Technology', icon: TrendingUp }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-muted' },
    { value: 'medium', label: 'Medium', color: 'bg-primary' },
    { value: 'high', label: 'High', color: 'bg-warning' },
    { value: 'critical', label: 'Critical', color: 'bg-destructive' }
  ];

  const statuses = [
    { value: 'planning', label: 'Planning', icon: Clock, color: 'bg-muted' },
    { value: 'in-progress', label: 'In Progress', icon: TrendingUp, color: 'bg-primary' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-success' },
    { value: 'on-hold', label: 'On Hold', icon: AlertCircle, color: 'bg-warning' }
  ];

  const filteredGoals = selectedCategory === "all" 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory);

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-muted';
  };

  const getStatusColor = (status: string) => {
    return statuses.find(s => s.value === status)?.color || 'bg-muted';
  };

  const getStatusIcon = (status: string) => {
    return statuses.find(s => s.value === status)?.icon || Clock;
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const addGoal = () => {
    if (newGoal.title && newGoal.description) {
      const goal: PlanningGoal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category as any,
        priority: newGoal.priority as any,
        target: newGoal.target || 100,
        current: newGoal.current || 0,
        deadline: newGoal.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: newGoal.status as any,
        responsible: newGoal.responsible || 'Administrator'
      };
      setGoals([...goals, goal]);
      setNewGoal({ category: 'enrollment', priority: 'medium', status: 'planning' });
      setShowAddGoal(false);
    }
  };

  const overallProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + calculateProgress(goal.current, goal.target), 0) / goals.length)
    : 0;

  const upcomingDeadlines = goals
    .filter(goal => goal.status !== 'completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Strategic Planning
          </h1>
          <p className="text-muted-foreground mt-1">
            Educational planning, goal setting, and progress tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="w-fit">
            Overall Progress: {overallProgress}%
          </Badge>
          <Button onClick={() => setShowAddGoal(!showAddGoal)}>
            Add Goal
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">
              {goals.filter(g => g.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.status === 'in-progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Active initiatives</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.priority === 'high' || g.priority === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent goals</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <p className="text-xs text-muted-foreground">Average completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Goal Form */}
      {showAddGoal && (
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Add New Goal</CardTitle>
            <CardDescription>Create a new strategic planning goal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Goal Title</label>
                <Input
                  placeholder="Enter goal title"
                  value={newGoal.title || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select 
                  value={newGoal.category} 
                  onValueChange={(value) => setNewGoal({ ...newGoal, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe the goal and its objectives"
                value={newGoal.description || ''}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select 
                  value={newGoal.priority} 
                  onValueChange={(value) => setNewGoal({ ...newGoal, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Target</label>
                <Input
                  type="number"
                  placeholder="Target value"
                  value={newGoal.target || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Current</label>
                <Input
                  type="number"
                  placeholder="Current value"
                  value={newGoal.current || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, current: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Deadline</label>
                <Input
                  type="date"
                  value={newGoal.deadline || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addGoal}>Add Goal</Button>
              <Button variant="outline" onClick={() => setShowAddGoal(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Planning Categories</CardTitle>
          <CardDescription>Filter goals by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All Categories ({goals.length})
            </Button>
            {categories.map(category => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.label} ({goals.filter(g => g.category === category.value).length})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="grid gap-6">
        {filteredGoals.map(goal => {
          const StatusIcon = getStatusIcon(goal.status);
          const progress = calculateProgress(goal.current, goal.target);
          const daysToDeadline = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={goal.id} className="border-0 shadow-soft">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <Badge className={getPriorityColor(goal.priority)}>
                        {goal.priority}
                      </Badge>
                      <Badge className={getStatusColor(goal.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {goal.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{goal.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{progress}%</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.current} / {goal.target}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Deadline</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(goal.deadline).toLocaleDateString()}
                          {daysToDeadline > 0 ? ` (${daysToDeadline} days)` : ' (Overdue)'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Responsible</div>
                        <div className="text-xs text-muted-foreground">{goal.responsible}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Category</div>
                        <div className="text-xs text-muted-foreground capitalize">{goal.category}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Deadlines */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>Goals requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingDeadlines.map(goal => {
              const daysToDeadline = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysToDeadline < 0;
              const isUrgent = daysToDeadline <= 7 && daysToDeadline >= 0;
              
              return (
                <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{goal.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Progress: {calculateProgress(goal.current, goal.target)}% • {goal.responsible}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      isOverdue ? 'text-destructive' : 
                      isUrgent ? 'text-warning' : 'text-muted-foreground'
                    }`}>
                      {isOverdue ? 'Overdue' : `${daysToDeadline} days left`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}