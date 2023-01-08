import { IssueContentParser } from "../src/issue-content-parser";
import { GitHubIssue } from "../src/models";

describe("IssueContentParser", () => {
    const issueContentParser = new IssueContentParser();

    describe("extractIssueTasklist", () => {
        it("issue without body", () => {
            const issue = { body: undefined } as GitHubIssue;
            const actual = issueContentParser.extractIssueTasklist(issue);
            expect(actual).toEqual([]);
        });

        it("parses tasklist with single issue", () => {
            const issue = {
                body: "## Hello\n- [ ] https://github.com/actions/setup-node/issues/5663\nTest",
            } as GitHubIssue;
            const actual = issueContentParser.extractIssueTasklist(issue);
            expect(actual).toEqual([{ repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 }]);
        });

        it("parses tasklist with multiple issues", () => {
            const issue = {
                body: `
# Epic 1
## Issue Spec

- [ ] https://github.com/actions/setup-node/issues/5663
- [ ] https://github.com/actions/setup-node/issues/5700
- [ ] https://github.com/actions/setup-node/issues/5753

### Spec graph

Test content

### Hello
Test content 2
`,
            } as GitHubIssue;
            const actual = issueContentParser.extractIssueTasklist(issue);
            expect(actual).toEqual([
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 },
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 5700 },
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 5753 },
            ]);
        });

        it("parses tasklist with Win-style line endings", () => {
            const issue = {
                body: "# Epic 1\r\n\r\n## Issue Spec\r\n\r\n- [ ] https://github.com/actions/setup-node/issues/5663\r\n- [ ] https://github.com/actions/setup-python/issues/170\r\n- [ ] https://github.com/actions/setup-go/issues/1\r\n\r\n### Spec graph\r\n\r\nTest content",
            } as GitHubIssue;
            const actual = issueContentParser.extractIssueTasklist(issue);
            expect(actual).toEqual([
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 },
                { repoOwner: "actions", repoName: "setup-python", issueNumber: 170 },
                { repoOwner: "actions", repoName: "setup-go", issueNumber: 1 },
            ]);
        });

        it("ignores invalid task list lines", () => {
            const issue = {
                body: `
# Epic 1
## Issue Spec
- [ ] https://github.com/actions/setup-node/issues/1


- [ ] https://github.com/actions/setup-node/issues/2
- [ ]https://github.com/actions/setup-node/issues/3
- [] https://github.com/actions/setup-node/issues/4
-[ ] https://github.com/actions/setup-node/issues/5
[ ] https://github.com/actions/setup-node/issues/6
- [ ] https://github.com/actions/setup-node/issues/7
`,
            } as GitHubIssue;
            const actual = issueContentParser.extractIssueTasklist(issue);
            expect(actual).toEqual([
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 1 },
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 2 },
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 7 },
            ]);
        });
    });

    describe("extractIssueDependencies", () => {
        it("empty body", () => {
            const issue = { body: undefined } as GitHubIssue;
            const actual = issueContentParser.extractIssueDependencies(issue);
            expect(actual).toEqual([]);
        });

        it("no dependency lines", () => {
            const issue = {
                body: `
Hello https://github.com/actions/setup-node/issues/1
Dep https://github.com/actions/setup-node/issues/2
depending https://github.com/actions/setup-node/issues/3

https://github.com/actions/setup-node/issues/4

Test content 3
`,
            } as GitHubIssue;
            const actual = issueContentParser.extractIssueDependencies(issue);
            expect(actual).toEqual([]);
        });

        it("single dependency line with single issue", () => {
            const issue = {
                body: "## Hello\nDepends on https://github.com/actions/setup-node/issues/5663\nTest",
            } as GitHubIssue;
            const actual = issueContentParser.extractIssueDependencies(issue);
            expect(actual).toEqual([{ repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 }]);
        });

        it("single dependency line with multiple issues", () => {
            const issue = {
                body: `
Hello

Depends on https://github.com/actions/setup-node/issues/105, https://github.com/actions/setup-python/issues/115, https://github.com/actions/setup-go/issues/125

Test content
`,
            } as GitHubIssue;
            const actual = issueContentParser.extractIssueDependencies(issue);
            expect(actual).toEqual([
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 105 },
                { repoOwner: "actions", repoName: "setup-python", issueNumber: 115 },
                { repoOwner: "actions", repoName: "setup-go", issueNumber: 125 },
            ]);
        });

        it("multiple dependency lines with multiple issues", () => {
            const issue = {
                body: `
Hello

Depends on https://github.com/actions/setup-node/issues/101, https://github.com/actions/setup-node/issues/102
Depends on https://github.com/actions/setup-go/issues/103 https://github.com/actions/setup-go/issues/104
Depends on https://github.com/actions/setup-ruby/issues/105 & https://github.com/actions/setup-ruby/issues/106

Test content
`,
            } as GitHubIssue;
            const actual = issueContentParser.extractIssueDependencies(issue);
            expect(actual).toEqual([
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 101 },
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 102 },
                { repoOwner: "actions", repoName: "setup-go", issueNumber: 103 },
                { repoOwner: "actions", repoName: "setup-go", issueNumber: 104 },
                { repoOwner: "actions", repoName: "setup-ruby", issueNumber: 105 },
                { repoOwner: "actions", repoName: "setup-ruby", issueNumber: 106 },
            ]);
        });

        it("different types of dependency lines", () => {
            const issue = {
                body: `
Hello

Depends on https://github.com/actions/setup-node/issues/101
depends on: https://github.com/actions/setup-node/issues/102
Dependencies: https://github.com/actions/setup-node/issues/103

Test content
`,
            } as GitHubIssue;
            const actual = issueContentParser.extractIssueDependencies(issue);
            expect(actual).toEqual([
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 101 },
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 102 },
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 103 },
            ]);
        });
    });

    describe("replaceIssueContent", () => {
        it("updates content with single line", () => {
            const issue = {
                body: `
# Epic 1

## Issue Spec
Other content
`,
            } as GitHubIssue;
            const actual = issueContentParser.replaceIssueContent(issue, "Epic 1", "Test content");
            expect(actual).toBe(`
# Epic 1
Test content

## Issue Spec
Other content
`);
        });

        it("updates content with multiple lines", () => {
            const issue = {
                body: `
# Epic 1

## Issue Spec
Other content
`,
            } as GitHubIssue;
            const actual = issueContentParser.replaceIssueContent(
                issue,
                "Epic 1",
                "Test line 1\n```\ncode block\n```\nTest line 3"
            );
            expect(actual).toBe(`
# Epic 1
Test line 1
\`\`\`
code block
\`\`\`
Test line 3

## Issue Spec
Other content
`);
        });

        it("updates content when a lot of headers", () => {
            const issue = {
                body: `
# Epic 1
## Header 1
First header content

## Header 2
Second header content

## Header 3
Third header content

## Header 4
Other content
`,
            } as GitHubIssue;
            const actual = issueContentParser.replaceIssueContent(
                issue,
                "Header 3",
                "Test line 1\nTest line 2\nTest line 3"
            );
            expect(actual).toBe(`
# Epic 1
## Header 1
First header content

## Header 2
Second header content

## Header 3
Test line 1
Test line 2
Test line 3

## Header 4
Other content
`);
        });

        it("updates content of last section", () => {
            const issue = {
                body: `
# Epic 1
## Header 1
First header content
## Header 2
Second header content
`,
            } as GitHubIssue;
            const actual = issueContentParser.replaceIssueContent(
                issue,
                "Header 2",
                "Test content\nSome other test content"
            );
            expect(actual).toBe(`
# Epic 1
## Header 1
First header content
## Header 2
Test content
Some other test content
`);
        });

        it("updates content of empty section", () => {
            const issue = {
                body: `
# Epic 1
## Header 1
First header content
## Header 2
# Header 3
Third header content
`,
            } as GitHubIssue;
            const actual = issueContentParser.replaceIssueContent(
                issue,
                "Header 2",
                "Test content\nSome other test content"
            );
            expect(actual).toBe(`
# Epic 1
## Header 1
First header content
## Header 2
Test content
Some other test content

# Header 3
Third header content
`);
        });

        it("updates content with mermaid diagram", () => {
            const issue = {
                body: `
# Epic 1
## Header 1
First header content
## Epic spec
\`\`\`mermaid
flowchart TD
old diagram content
\`\`\`
# Header 3
`,
            } as GitHubIssue;
            const actual = issueContentParser.replaceIssueContent(
                issue,
                "Epic spec",
                "```mermaid\nflowchart TD\nnew diagram content\n```"
            );
            expect(actual).toBe(`
# Epic 1
## Header 1
First header content
## Epic spec
\`\`\`mermaid
flowchart TD
new diagram content
\`\`\`

# Header 3
`);
        });

        it("fails if section is not found", () => {
            const issue = {
                body: `
    # Epic 1
    ## Header 1
    First header content
    ## Header 2
    Second header content
    # Header 3
    `,
            } as GitHubIssue;
            expect(() => issueContentParser.replaceIssueContent(issue, "Epic spec", "Test content")).toThrow(
                /Markdown header 'Epic spec' is not found in issue body.+/
            );
        });
    });

    describe("isIssueContentIdentical", () => {
        it("content is identical", () => {
            const issue = {
                body: "# Header\r\nHello world\r\n\r\n## Header 2\r\n\r\n```mermaid\ntest content\n```\n\r\n## Header 3\r\nFooter",
            } as GitHubIssue;
            const newIssueContent =
                "# Header\r\nHello world\r\n\r\n## Header 2\r\n\r\n```mermaid\ntest content\n```\n\r\n## Header 3\r\nFooter";
            expect(issueContentParser.isIssueContentIdentical(issue, newIssueContent)).toBeTruthy();
        });

        it("content is identical but different line endings", () => {
            const issue = {
                body: "# Header\r\nHello world\r\n\r\n## Header 2\r\n\r\n```mermaid\r\ntest content\r\n```\r\n\r\n## Header 3\r\nFooter",
            } as GitHubIssue;
            const newIssueContent =
                "# Header\r\nHello world\r\n\r\n## Header 2\r\n\r\n```mermaid\ntest content\n```\n\r\n## Header 3\r\nFooter";
            expect(issueContentParser.isIssueContentIdentical(issue, newIssueContent)).toBeTruthy();
        });

        it("content is different", () => {
            const issue = {
                body: "# Header\r\nHello world\r\n\r\n## Header 2\r\n\r\n```mermaid\r\ntest content\r\n```\r\n\r\n## Header 3\r\nFooter",
            } as GitHubIssue;
            const newIssueContent =
                "# Header\r\nHello world\r\n\r\n## Header 2\r\n\r\n```mermaid\ntest content 2\n```\n\r\n## Header 3\r\nFooter";
            expect(issueContentParser.isIssueContentIdentical(issue, newIssueContent)).toBeFalsy();
        });
    });

    describe("isMarkdownHeaderLine", () => {
        it("non-header line", () => {
            expect(issueContentParser.isMarkdownHeaderLine("Epic 1")).toBeFalsy();
        });

        it("header line with empty title", () => {
            expect(issueContentParser.isMarkdownHeaderLine("### ")).toBeFalsy();
        });

        it("header line", () => {
            expect(issueContentParser.isMarkdownHeaderLine("## Epic 1")).toBeTruthy();
        });

        it("header line with incorrect title", () => {
            expect(issueContentParser.isMarkdownHeaderLine("## Epic 1", "Issues Spec")).toBeFalsy();
        });

        it("header line with correct title", () => {
            expect(issueContentParser.isMarkdownHeaderLine("#### Issues Spec", "Issues Spec")).toBeTruthy();
        });
    });

    describe("isTaskListLine", () => {
        it("tasklist line", () => {
            expect(issueContentParser.isTaskListLine("- [ ] Task list item")).toBeTruthy();
        });

        it("non-tasklist line", () => {
            expect(issueContentParser.isTaskListLine("Task list item")).toBeFalsy();
            expect(issueContentParser.isTaskListLine("[ ] Task list item")).toBeFalsy();
            expect(issueContentParser.isTaskListLine("-[ ] Task list item")).toBeFalsy();
            expect(issueContentParser.isTaskListLine("- [] Task list item")).toBeFalsy();
            expect(issueContentParser.isTaskListLine("- [ ]Task list item")).toBeFalsy();
        });
    });

    describe("isDependencyLine", () => {
        it("dependency line", () => {
            expect(issueContentParser.isDependencyLine("Depends on: issue 1")).toBeTruthy();
            expect(issueContentParser.isDependencyLine("Depends on: issue 1, issue 2")).toBeTruthy();
            expect(issueContentParser.isDependencyLine("Depends on issue 1")).toBeTruthy();
            expect(issueContentParser.isDependencyLine("Dependencies: issue 1")).toBeTruthy();
        });

        it("non-dependency line", () => {
            expect(issueContentParser.isDependencyLine("Issue 1")).toBeFalsy();
            expect(issueContentParser.isDependencyLine("Depends: issue 1")).toBeFalsy();
            expect(issueContentParser.isDependencyLine("Depends on:issue 1")).toBeFalsy();
            expect(issueContentParser.isDependencyLine("Depends onissue 1")).toBeFalsy();
            expect(issueContentParser.isDependencyLine("Dependencies:issue 1")).toBeFalsy();
            expect(issueContentParser.isDependencyLine("Dependencies issue 1")).toBeFalsy();
        });
    });
});
