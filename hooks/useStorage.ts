import { Task, CreateTaskInput } from '@/types/task';
import { useState } from 'react';

export const useStorage = () => {
  const getTasks = async () => {
    if (typeof window === 'undefined') return [];
    const tasksJson = localStorage.getItem('tasks');
    return tasksJson ? JSON.parse(tasksJson) : [];
  };

  const addTask = async (task: CreateTaskInput) => {
    const tasks = await getTasks();
    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      progress: 0,
      status: 'To Do',
      createdAt: new Date().toISOString(),
    };
    const updatedTasks = [...tasks, newTask];
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const tasks = await getTasks();
    const updatedTasks = tasks.map((task: Task) =>
      task.id === id ? { ...task, ...updates } : task
    );
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return updatedTasks.find((task: Task) => task.id === id);
  };

  const deleteTask = async (id: string) => {
    const tasks = await getTasks();
    const updatedTasks = tasks.filter((task: Task) => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  return {
    getTasks,
    addTask,
    updateTask,
    deleteTask,
  };
}; 