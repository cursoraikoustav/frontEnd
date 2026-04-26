export interface IssuePayload {
  id?: string;
  title: string;
  description: string;
  status: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
}
