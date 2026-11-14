import { useEffect, useMemo, useState } from "react";
import {
  initialGroups,
  initialTasks,
  Task,
  TaskGroup,
  TaskStatus,
} from "../models/task";

const storageKey = "mart-task-planner-state";

export function useTaskBoard() {
  const [state, setState] = useState<{ tasks: Task[]; groups: TaskGroup[] }>(
    () => {
      const stored = sessionStorage.getItem(storageKey);
      if (!stored) return { tasks: initialTasks, groups: initialGroups };
      try {
        const parsed = JSON.parse(stored) as {
          tasks?: Task[];
          groups?: TaskGroup[];
        };
        return {
          tasks: Array.isArray(parsed.tasks)
            ? parsed.tasks.map((task) => ({
                ...task,
                color: task.color ?? "blue",
              }))
            : initialTasks,
          groups: Array.isArray(parsed.groups) ? parsed.groups : initialGroups,
        };
      } catch {
        return { tasks: initialTasks, groups: initialGroups };
      }
    },
  );
  const { tasks, groups } = state;

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task,
      ),
    }));
  };

  const addTask = (
    title: string,
    groupId: string,
    dueDate: string,
    priority: Task["priority"],
    color: Task["color"],
  ) => {
    setState((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id: `task-${Date.now()}`,
          title,
          groupId,
          dueDate,
          priority,
          color,
          status: "todo",
        },
      ],
    }));
  };

  const updateTask = (
    taskId: string,
    updates: Pick<Task, "title" | "dueDate" | "priority" | "color">,
  ) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    }));
  };

  const addGroup = (
    name: string,
    description: string,
    accent: TaskGroup["accent"],
  ) => {
    setState((current) => ({
      ...current,
      groups: [
        ...current.groups,
        { id: `group-${Date.now()}`, name, description, accent },
      ],
    }));
  };

  const updateGroup = (
    groupId: string,
    updates: Pick<TaskGroup, "name" | "description" | "accent">,
  ) => {
    setState((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group,
      ),
    }));
  };

  const moveGroup = (groupId: string, direction: -1 | 1) => {
    setState((current) => {
      const groups = current.groups;
      const index = groups.findIndex((group) => group.id === groupId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= groups.length)
        return current;
      const next = [...groups];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return { ...current, groups: next };
    });
  };

  const groupStats = useMemo(
    () =>
      groups.map((group) => {
        const groupTasks = tasks.filter((task) => task.groupId === group.id);
        const complete = groupTasks.filter(
          (task) => task.status === "done",
        ).length;
        return {
          ...group,
          tasks: groupTasks,
          complete,
          total: groupTasks.length,
        };
      }),
    [groups, tasks],
  );

  return {
    tasks,
    groupStats,
    updateTaskStatus,
    addTask,
    updateTask,
    addGroup,
    updateGroup,
    moveGroup,
  };
}
