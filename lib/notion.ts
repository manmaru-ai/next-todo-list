import { Client } from '@notionhq/client';
import { Task, CreateTaskInput } from '@/types/task';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export const notionService = {
  async getTasks(): Promise<Task[]> {
    try {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: [{ property: 'deadline', direction: 'ascending' }],
      });

      if (response.results.length > 0) {
        const page = response.results[0] as any;
        console.log('Database Properties:', Object.keys(page.properties));
      }

      return response.results.map((page: any) => {
        const properties = page.properties;
        
        return {
          id: page.id,
          title: properties.title?.title[0]?.plain_text || '',
          description: properties.description?.rich_text[0]?.plain_text || '',
          priority: properties.priority?.select?.name || 'Low',
          status: properties.status?.select?.name || 'To Do',
          deadline: properties.deadline?.date?.start || '',
          tags: properties.tags?.multi_select?.map((tag: any) => tag.name) || [],
          progress: properties.progress?.number || 0,
        };
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    try {
      const response = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          title: {
            title: [{ text: { content: input.title } }]
          },
          description: {
            rich_text: [{ text: { content: input.description } }]
          },
          priority: {
            select: { name: input.priority }
          },
          status: {
            select: { name: 'To Do' }
          },
          deadline: {
            date: { start: input.deadline }
          },
          tags: {
            multi_select: input.tags.map(tag => ({ name: tag }))
          },
          progress: {
            number: 0
          }
        },
      });

      return {
        id: response.id,
        ...input,
        status: 'To Do',
        progress: 0,
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateTaskProgress(id: string, progress: number): Promise<void> {
    try {
      await notion.pages.update({
        page_id: id,
        properties: {
          progress: { number: progress },
          status: {
            select: {
              name: progress === 100 ? 'Done' : progress > 0 ? 'In Progress' : 'To Do',
            },
          },
        },
      });
    } catch (error) {
      console.error('Error updating task progress:', error);
      throw error;
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await notion.pages.update({
        page_id: id,
        archived: true,
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async updateTask(id: string, input: Partial<CreateTaskInput>): Promise<void> {
    try {
      const properties: any = {};
      
      if (input.title !== undefined) {
        properties.title = {
          title: [{ text: { content: input.title } }]
        };
      }
      
      if (input.description !== undefined) {
        properties.description = {
          rich_text: [{ text: { content: input.description } }]
        };
      }
      
      if (input.priority !== undefined) {
        properties.priority = {
          select: { name: input.priority }
        };
      }
      
      if (input.deadline !== undefined) {
        properties.deadline = {
          date: { start: input.deadline }
        };
      }
      
      if (input.tags !== undefined) {
        properties.tags = {
          multi_select: input.tags.map(tag => ({ name: tag }))
        };
      }

      await notion.pages.update({
        page_id: id,
        properties,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async getFilteredTasks(options: {
    priority?: 'High' | 'Medium' | 'Low';
    status?: 'To Do' | 'In Progress' | 'Done';
    search?: string;
    sort?: {
      field: 'deadline' | 'priority' | 'progress';
      direction: 'ascending' | 'descending';
    };
  }): Promise<Task[]> {
    try {
      const filter: any = {
        and: [] as any[]
      };

      if (options.priority) {
        filter.and.push({
          property: 'priority',
          select: {
            equals: options.priority
          }
        });
      }

      if (options.status) {
        filter.and.push({
          property: 'status',
          select: {
            equals: options.status
          }
        });
      }

      if (options.search) {
        filter.and.push({
          or: [
            {
              property: 'title',
              title: {
                contains: options.search.toLowerCase()
              }
            },
            {
              property: 'description',
              rich_text: {
                contains: options.search.toLowerCase()
              }
            }
          ]
        });
      }

      const sorts = [];
      if (options.sort) {
        if (options.sort.field === 'priority') {
          sorts.push({
            property: 'priority',
            direction: options.sort.direction
          });
        } else if (options.sort.field === 'deadline') {
          sorts.push({
            property: 'deadline',
            direction: options.sort.direction
          });
        } else if (options.sort.field === 'progress') {
          sorts.push({
            property: 'progress',
            direction: options.sort.direction
          });
        }
      }

      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: filter.and.length > 0 ? filter : undefined,
        sorts: sorts.length > 0 ? sorts : undefined,
      });

      return response.results.map((page: any) => ({
        id: page.id,
        title: page.properties.title?.title[0]?.plain_text || '',
        description: page.properties.description?.rich_text[0]?.plain_text || '',
        priority: page.properties.priority?.select?.name || 'Low',
        status: page.properties.status?.select?.name || 'To Do',
        deadline: page.properties.deadline?.date?.start || '',
        tags: page.properties.tags?.multi_select?.map((tag: any) => tag.name) || [],
        progress: page.properties.progress?.number || 0,
      }));
    } catch (error) {
      console.error('Error filtering tasks:', error);
      throw error;
    }
  },
}; 