import { GitHubIssue, GitHubIssueReference } from "./models";
import { parseIssuesUrls, parseIssueUrl } from "./utils";

export class IssueContentParser {
    public extractIssueTasklist(issue: GitHubIssue): GitHubIssueReference[] {
        const contentLines = issue.body?.split("\n") ?? [];

        return contentLines
            .filter(x => this.isTaskListLine(x))
            .map(x => parseIssueUrl(x))
            .filter((x): x is GitHubIssueReference => x !== null);
    }

    public extractIssueDependencies(issue: GitHubIssue): GitHubIssueReference[] {
        const contentLines = issue.body?.split("\n") ?? [];

        return contentLines
            .filter(x => this.isDependencyLine(x))
            .map(x => parseIssuesUrls(x))
            .flat()
            .filter((x): x is GitHubIssueReference => x !== null);
    }

    public replaceIssueContent(issue: GitHubIssue, sectionTitle: string, newSectionContent: string): string {
        const contentLines = issue.body?.split("\n") ?? [];

        const sectionStartIndex = contentLines.findIndex(x => this.isMarkdownHeaderLine(x, sectionTitle));
        if (sectionStartIndex === -1) {
            throw new Error(`Markdown header '${sectionTitle}' is not found in issue body.`);
        }

        const sectionEndIndex = contentLines.findIndex(
            (x, index) => index > sectionStartIndex && this.isMarkdownHeaderLine(x)
        );

        return [
            ...contentLines.slice(0, sectionStartIndex + 1),
            newSectionContent,
            "",
            ...contentLines.slice(sectionEndIndex !== -1 ? sectionEndIndex : contentLines.length),
        ].join("\n");
    }

    public isMarkdownHeaderLine(str: string, sectionTitle?: string): boolean {
        if (!str.startsWith("#")) {
            return false;
        }

        const trimmedLine = str.replace(/^#+/, "").trim();
        if (!trimmedLine) {
            return false;
        }

        if (!sectionTitle) {
            return true;
        }

        return trimmedLine.toLowerCase() === sectionTitle.toLocaleLowerCase();
    }

    public isTaskListLine(str: string): boolean {
        return str.startsWith("- [ ] ") || str.startsWith("- [x] ");
    }

    public isDependencyLine(str: string): boolean {
        const dependencyLinePrefixes = ["Dependencies: ", "Predecessors: ", "Depends on ", "Depends on: "];
        const formattedLine = str.toLowerCase();
        return dependencyLinePrefixes.some(x => formattedLine.startsWith(x.toLowerCase()));
    }
}
