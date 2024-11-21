export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done';
  deadline: string;
  tags: string[];
  progress: number;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  priority: Task['priority'];
  deadline: string;
  tags: string[];
} 