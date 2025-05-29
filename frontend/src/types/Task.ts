export interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: Date | string | null;
  priority: "P1" | "P2" | "P3" | "P4";
  createdAt: Date;
}

export interface ParsedTask {
  title: string;
  assignee: string;
  dueDate: Date | string | null;
  priority: "P1" | "P2" | "P3" | "P4";
}
