import { GitHubIssue, GitHubIssueReference } from "./models";
import { parseIssueUrl } from "./utils";

export class IssueContentParser {
    public extractIssueTasklist(issue: GitHubIssue): GitHubIssueReference[] {
        const contentLines = issue.body?.split("\n") ?? [];

        return contentLines
            .filter(x => x.startsWith("- [ ] "))
            .map(x => parseIssueUrl(x))
            .filter((x): x is GitHubIssueReference => x !== null);
    }

    public extractIssueDependencies(issue: GitHubIssue): GitHubIssueReference[] {
        const contentLines = issue.body?.split("\n") ?? [];

        return contentLines
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
