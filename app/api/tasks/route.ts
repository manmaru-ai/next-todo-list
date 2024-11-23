import { NextRequest, NextResponse } from 'next/server';
import { notionService } from '@/lib/notion';
import { Task, CreateTaskInput } from '@/types/task';

interface TaskData extends CreateTaskInput {
  title: string;
  description: string;
  priority: Task['priority'];
  status: Task['status'];
  deadline: string;
  tags: string[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const priority = searchParams.get('priority') as Task['priority'] | undefined;
    const status = searchParams.get('status') as Task['status'] | undefined;
    const search = searchParams.get('search') || undefined;
    const sortField = searchParams.get('sortField') as 'deadline' | 'priority' | 'progress' | undefined;
    const sortDirection = searchParams.get('sortDirection') as 'ascending' | 'descending' | undefined;

    const tasks = await notionService.getFilteredTasks({
      priority,
      status,
      search,
      sort: sortField && sortDirection ? { 
        field: sortField, 
        direction: sortDirection 
      } : undefined,
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const data: TaskData = await request.json();
    const task = await notionService.createTask(data);
    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
} 