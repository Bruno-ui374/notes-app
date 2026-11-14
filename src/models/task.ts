export type TaskStatus = "todo" | "progress" | "done";

export type Task = {
  id: string;
  title: string;
  groupId: string;
  status: TaskStatus;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  color: "blue" | "pink" | "yellow" | "mint" | "lavender";
};

export type TaskGroup = {
  id: string;
  name: string;
  description: string;
  accent: "blue" | "pink" | "yellow" | "teal" | "purple" | "orange";
};

export const initialGroups: TaskGroup[] = [];
export const initialTasks: Task[] = [];
