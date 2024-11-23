import { NextResponse } from 'next/server';
import { notionService } from '@/lib/notion';

interface TaskData {
  title: string;
  description: string;
  status: string;
  // 他の必要なプロパティ
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority') as any;
    const status = searchParams.get('status') as any;
    const search = searchParams.get('search');
    const sortField = searchParams.get('sortField') as any;
    const sortDirection = searchParams.get('sortDirection') as any;

    const tasks = await notionService.getFilteredTasks({
      priority,
      status,
      search,
      sort: sortField ? { field: sortField, direction: sortDirection } : undefined,
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