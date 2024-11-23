'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Calendar, CheckCircle, ChevronDown, Filter, Plus, Search, Settings, Tag, Trash2, Edit, MoreHorizontal, X } from 'lucide-react'
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
import { useStorage } from '@/hooks/useStorage';
import { usePoints } from '@/hooks/usePoints';
import { ProfileDialog } from '@/components/profile-dialog';

export function AdvancedDashboardComponent() {
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
  const [profileOpen, setProfileOpen] = useState(false);
  const { points, history, addPoints, stats } = usePoints();

  const storage = useStorage();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await storage.getTasks();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };
    fetchTasks();
  }, [searchQuery, activeFilter, activeSort]);

  const addTask = async (newTask: CreateTaskInput) => {
    try {
      const task = await storage.addTask(newTask) as Task;
      setTasks([...tasks, task]);
      setOpen(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await storage.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }

  const updateTaskProgress = async (id: string, progress: number) => {
    try {
      const oldTask = tasks.find(t => t.id === id);
      await storage.updateTask(id, { progress });
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, progress } : task
      ));

      if (oldTask) {
        if (progress === 100 && oldTask.progress !== 100) {
          const basePoints = 100;
          const priorityBonus = oldTask.priority === 'High' ? 50 : 
                              oldTask.priority === 'Medium' ? 30 : 10;
          addPoints(`タスク完了: ${oldTask.title}`, basePoints + priorityBonus);
        } else if (progress > oldTask.progress) {
          addPoints(`進捗更新: ${oldTask.title}`, 10);
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  const updateTask = async (id: string, updates: Partial<CreateTaskInput>) => {
    try {
      await storage.updateTask(id, updates);
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

  const handleReset = () => {
    if (confirm('すべてのデータ（タスク、ポイント、履歴、レベル）がリセットされます。よろしいですか？')) {
      // LocalStorageのすべてのデータを削除
      localStorage.removeItem('tasks');
      localStorage.removeItem('userPoints');
      localStorage.removeItem('pointHistory');
      localStorage.removeItem('userStats'); // statsのデータも削除
      
      // タスクのみリセット（他のステートは自動的にリセットされます）
      setTasks([]);
      setProfileOpen(false);
      
      // 通知を表示
      alert('すべてのデータがリセットされました。');
      
      // ページをリロード（これによりすべてのステートが初期化されます）
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-background text-foreground">
        <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h1 className="text-2xl font-bold">NotiTask</h1>
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
                          <h3 className="font-semibold">通知</h3>
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
                        <p className="text-xs leading-none text-muted-foreground">
                          {points} pt
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleReset}
                      className="text-red-500 focus:text-red-500"
                    >
                      Reset All Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <Input
                type="search"
                placeholder="タスクを検索..."
                className="w-full sm:w-64"
                value={searchQuery}
                onChange={handleSearch}
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => applyFilter('priority', undefined)}>
                      すべての重要度
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyFilter('priority', 'High')}>
                      重要度：高
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyFilter('priority', 'Medium')}>
                      重要度：中
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyFilter('priority', 'Low')}>
                      重要度：低
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => applyFilter('status', undefined)}>
                      すべてのステータス
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyFilter('status', 'To Do')}>
                      未着手
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyFilter('status', 'In Progress')}>
                      進行中
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applyFilter('status', 'Done')}>
                      完了
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
                      期限 {activeSort.field === 'deadline' && (activeSort.direction === 'ascending' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applySort('priority')}>
                      重要度 {activeSort.field === 'priority' && (activeSort.direction === 'ascending' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => applySort('progress')}>
                      進捗 {activeSort.field === 'progress' && (activeSort.direction === 'ascending' ? '↑' : '↓')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> タスクを追加
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>新規タスク作成</DialogTitle>
                  <DialogDescription>
                    新しいタスクを作成します。完了したら保存をクリックしてください。
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
                      <Label htmlFor="title" className="text-right">タイトル</Label>
                      <Input id="title" name="title" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">説明</Label>
                      <Textarea id="description" name="description" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">重要度</Label>
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
                      <Label htmlFor="deadline" className="text-right">期限</Label>
                      <Input id="deadline" name="deadline" type="date" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tags" className="text-right">タグ</Label>
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
            <TabsList className="w-full sm:w-auto flex">
              <TabsTrigger value="all" className="flex-1 sm:flex-none">すべて</TabsTrigger>
              <TabsTrigger value="todo" className="flex-1 sm:flex-none">未着手</TabsTrigger>
              <TabsTrigger value="inprogress" className="flex-1 sm:flex-none">進行中</TabsTrigger>
              <TabsTrigger value="done" className="flex-1 sm:flex-none">完了</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {getFilteredTasks(tasks, activeTab).map((task) => (
                  <Card key={task.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <h3 className="text-sm font-medium break-all pr-2">{task.title}</h3>
                      <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "default" : "secondary"}>
                        {task.priority}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground break-all">{task.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {task.deadline}
                        </div>
                        <div className="flex items-center">
                          <Tag className="mr-1 h-3 w-3" />
                          <span className="break-all">{task.tags.join(', ')}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between mt-auto">
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
        <footer className="border-t mt-auto">
          <div className="container mx-auto px-4 py-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2023 NotiTask. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>タスクの編集</DialogTitle>
            <DialogDescription>
              タスクの内容を編集できます。完了したら保存をクリックしてください。
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
                  <Label htmlFor="edit-title" className="text-right">タイトル</Label>
                  <Input 
                    id="edit-title" 
                    name="title" 
                    defaultValue={editingTask.title}
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">説明</Label>
                  <Textarea 
                    id="edit-description" 
                    name="description" 
                    defaultValue={editingTask.description}
                    className="col-span-3" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-priority" className="text-right">重要度</Label>
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
                  <Label htmlFor="edit-deadline" className="text-right">期限</Label>
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
                  <Label htmlFor="edit-tags" className="text-right">タグ</Label>
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
      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        points={points}
        history={history}
        stats={stats}
      />
    </div>
  )
}