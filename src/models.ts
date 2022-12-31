export type GitHubIssueReference = {
    repoOwner: string;
    repoName: string;
    issueNumber: number;
};

export interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body?: string | null;
    assignee: unknown;
    html_url: string;
    state: string;
}
