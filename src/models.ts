export type GitHubRepoReference = {
    repoOwner: string;
    repoName: string;
};

export type GitHubIssueReference = GitHubRepoReference & {
    issueNumber: number;
};

export interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body?: string | null;
    assignees?: Array<unknown> | null;
    html_url: string;
    state: string;
}
