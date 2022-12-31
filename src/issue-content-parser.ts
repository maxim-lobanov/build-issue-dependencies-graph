import { getOctokit } from "@actions/github";
import type { GitHub } from "@actions/github/lib/utils";
import { GitHubIssue, GitHubIssueReference } from "./models";
import { parseIssueUrl } from "./utils";

export class IssueContentParser {
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

    public extractIssueTasklist(issue: GitHubIssue): GitHubIssueReference[] {
        const issueContent = issue.body ?? "";
        const issueContentLines = issueContent.split("\n");

        return issueContentLines
            .filter(x => x.startsWith("- [ ] "))
            .map(x => parseIssueUrl(x))
            .filter((x): x is GitHubIssueReference => x !== null);
    }

    public extractIssueDependencies(issue: GitHubIssue): GitHubIssueReference[] {
        const issueContent = issue.body ?? "";
        const issueContentLines = issueContent.split("\n");

        return issueContentLines
            .filter(x => x.startsWith("Depends on"))
            .map(x => x.split(",").map(y => parseIssueUrl(y)))
            .flat()
            .filter((x): x is GitHubIssueReference => x !== null);
    }

    public replaceIssueContent(issue: GitHubIssue, sectionTitle: string, newSectionContent: string): string {
        const content = issue.body ?? "";
        const contentLines = content.split("\n");

        const sectionStartIndex = contentLines.findIndex(line => this.isLineMarkdownHeader(line, sectionTitle));
        if (sectionStartIndex === -1) {
            throw "";
        }

        const sectionEndIndex = contentLines.findIndex(
            (line, lineIndex) => lineIndex > sectionStartIndex && this.isLineMarkdownHeader(line)
        );

        return [
            ...contentLines.slice(0, sectionStartIndex),
            newSectionContent,
            ...contentLines.slice(sectionEndIndex),
        ].join("\n");
    }

    private isLineMarkdownHeader(line: string, sectionTitle?: string): boolean {
        if (!line.startsWith("#")) {
            return false;
        }

        if (!sectionTitle) {
            return true;
        }

        const trimmedLine = line.replace(/^#+/, "").trim();
        return trimmedLine.toLowerCase() === sectionTitle.toLocaleLowerCase();
    }
}
