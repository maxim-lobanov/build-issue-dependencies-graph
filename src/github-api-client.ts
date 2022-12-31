import { getOctokit } from "@actions/github";
import type { GitHub } from "@actions/github/lib/utils";
import { GitHubIssue, GitHubIssueReference } from "./models";

export class GitHubApiClient {
    private readonly client: InstanceType<typeof GitHub>;

    constructor(accessToken: string) {
        this.client = getOctokit(accessToken);
    }

    public async getIssue(issueRef: GitHubIssueReference): Promise<GitHubIssue> {
        const response = await this.client.rest.issues.get({
            owner: issueRef.repoOwner,
            repo: issueRef.repoName,
            issue_number: issueRef.issueNumber,
        });

        return response.data;
    }

    public async updateIssueContent(issueRef: GitHubIssueReference, body: string): Promise<void> {
        await this.client.rest.issues.update({
            owner: issueRef.repoOwner,
            repo: issueRef.repoName,
            issue_number: issueRef.issueNumber,
            body: body,
        });
    }
}
