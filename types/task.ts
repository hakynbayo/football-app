export type Task = {
  id: string;
  title: string;
  description: string | undefined;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
};

export type TaskFilter = "all" | "active" | "completed";

export type TaskListProps = {
  isLoading: boolean;
  tasks: Task[];
  filter: TaskFilter;
};
