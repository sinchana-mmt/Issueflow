export type Person = { id: string; name: string };
export type TagRef = { id: string; name: string; color: string };

export type IssueCard = {
  id: string;
  key: string;
  number: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  dueDate: string | null;
  updatedAt: string;
  createdAt: string;
  archivedAt: string | null;
  rank: number;
  project: { id: string; key: string; name: string };
  assignee: Person | null;
  reporter: Person;
  tags: TagRef[];
  parent: { id: string; key: string; title: string } | null;
  subtaskDone: number;
  subtaskTotal: number;
};
