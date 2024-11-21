'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Calendar, CheckCircle, ChevronDown, Filter, Moon, Plus, Search, Settings, Sun, Tag, Trash2, Edit, MoreHorizontal, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Task, CreateTaskInput } from '@/types/task';

export function AdvancedDashboardComponent() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [open, setOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<{
    priority?: Task['priority'];
    status?: Task['status'];
  }>({});
  const [activeSort, setActiveSort] = useState<{
    field?: 'deadline' | 'priority' | 'progress';
    direction?: 'ascending' | 'descending';
  }>({});
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'deadline' | 'progress';
  }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const params = new URLSearchParams();
        if (activeFilter.priority) params.append('priority', activeFilter.priority);
        if (activeFilter.status) params.append('status', activeFilter.status);
        if (searchQuery) params.append('search', searchQuery);
        if (activeSort.field) {
          params.append('sortField', activeSort.field);
          params.append('sortDirection', activeSort.direction || 'ascending');
        }

        const response = await fetch(`/api/tasks?${params.toString()}`);
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };
    fetchTasks();
  }, [searchQuery, activeFilter, activeSort]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Here you would typically update the theme in your app
  }

  const addTask = async (newTask: CreateTaskInput) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      const task = await response.json();
      setTasks([...tasks, task]);
      setOpen(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }

  const updateTaskProgress = async (id: string, progress: number) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      });
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, progress } : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  const updateTask = async (id: string, updates: Partial<CreateTaskInput>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
      setEditDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const applyFilter = (type: 'priority' | 'status', value: string | undefined) => {
    setActiveFilter(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const applySort = (field: 'deadline' | 'priority' | 'progress') => {
    setActiveSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const getFilteredTasks = (tasks: Task[], tabValue: string) => {
    switch (tabValue) {
      case 'todo':
        return tasks.filter(task => task.status === 'To Do');
      case 'inprogress':
        return tasks.filter(task => task.status === 'In Progress');
      case 'done':
        return tasks.filter(task => task.status === 'Done');
      default:
        return tasks;
    }
  };

  const checkDeadlines = useCallback(() => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const newNotifications = tasks
      .filter(task => {
        if (task.status === 'Done') return false;
        
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        threeDaysFromNow.setHours(0, 0, 0, 0);
        
        return deadline <= threeDaysFromNow && deadline >= today;
      })
      .map(task => {
        const deadline = new Date(task.deadline);
        const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: task.id,
          title: `${task.priority} Priority Task`,
          message: `"${task.title}" is due ${daysUntilDeadline === 0 ? 'today' : 
            daysUntilDeadline === 1 ? 'tomorrow' : 
            `in ${daysUntilDeadline} days`}`,
          type: 'deadline' as const
        };
      });

    setNotifications(newNotifications);
  }, [tasks]);

  useEffect(() => {
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 1000 * 60 * 60); // 1時間ごとにチェック
    return () => clearInterval(interval);
  }, [checkDeadlines]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground">
        <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">TodoList</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Notifications</h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setShowNotifications(false)}
                          className="h-6 w-6"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {notifications.length > 0 ? (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className="p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-medium text-sm text-destructive">
                                    {notification.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {notification.message}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@username" />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">username</p>
                      <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <Input
                type="search"
                placeholder="Search tasks..."
                className="w-64"
                value={searchQuery}
                onChange={handleSearch}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => applyFilter('priority', undefined)}>
                    All Priorities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyFilter('priority', 'High')}>
                    High Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyFilter('priority', 'Medium')}>
                    Medium Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyFilter('priority', 'Low')}>
                    Low Priority
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => applyFilter('status', undefined)}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyFilter('status', 'To Do')}>
                    To Do
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyFilter('status', 'In Progress')}>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyFilter('status', 'Done')}>
                    Done
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Sort <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => applySort('deadline')}>
                    Date {activeSort.field === 'deadline' && (activeSort.direction === 'ascending' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applySort('priority')}>
                    Priority {activeSort.field === 'priority' && (activeSort.direction === 'ascending' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applySort('progress')}>
                    Progress {activeSort.field === 'progress' && (activeSort.direction === 'ascending' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Create a new task here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newTask: CreateTaskInput = {
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    priority: formData.get('priority') as Task['priority'],
                    deadline: formData.get('deadline') as string,
                    tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
                  };
                  await addTask(newTask);
                  (e.target as HTMLFormElement).reset();
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title</Label>
                      <Input id="title" name="title" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Textarea id="description" name="description" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">Priority</Label>
                      <Select name="priority" required>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="deadline" className="text-right">Deadline</Label>
                      <Input id="deadline" name="deadline" type="date" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tags" className="text-right">Tags</Label>
                      <Input 
                        id="tags" 
                        name="tags" 
                        className="col-span-3" 
                        placeholder="Design, Development, Documentation" 
                        required 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Task</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="todo">To Do</TabsTrigger>
              <TabsTrigger value="inprogress">In Progress</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredTasks(tasks, activeTab).map((task) => (
                  <Card key={task.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <h3 className="text-sm font-medium">{task.title}</h3>
                      <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "default" : "secondary"}>
                        {task.priority}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                      <div className="mt-2 flex space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {task.deadline}
                        </div>
                        <div className="flex items-center">
                          <Tag className="mr-1 h-3 w-3" />
                          {task.tags.join(', ')}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <Progress value={task.progress} className="w-[60px]" />
                        <span className="text-sm font-medium">{task.progress}%</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => updateTaskProgress(task.id, Math.min(task.progress + 10, 100))}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setEditingTask(task);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
        <footer className="border-t">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">© 2023 TodoList App. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </footer>
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updates: Partial<CreateTaskInput> = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                priority: formData.get('priority') as Task['priority'],
                deadline: formData.get('deadline') as string,
                tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
              };
              await updateTask(editingTask.id, updates);
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-title" className="text-right">Title</Label>
                  <Input 
                    id="edit-title" 
                    name="title" 
                    defaultValue={editingTask.title}
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">Description</Label>
                  <Textarea 
                    id="edit-description" 
                    name="description" 
                    defaultValue={editingTask.description}
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-priority" className="text-right">Priority</Label>
                  <Select name="priority" defaultValue={editingTask.priority}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-deadline" className="text-right">Deadline</Label>
                  <Input 
                    id="edit-deadline" 
                    name="deadline" 
                    type="date" 
                    defaultValue={editingTask.deadline}
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-tags" className="text-right">Tags</Label>
                  <Input 
                    id="edit-tags" 
                    name="tags" 
                    defaultValue={editingTask.tags.join(', ')}
                    className="col-span-3" 
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}