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
            const issue = { body: "## Hello\n- [ ] https://github.com/actions/setup-node/issues/5663\nTest" } as GitHubIssue;
            const actual = issueContentParser.extractIssueTasklist(issue);
            expect(actual).toEqual([
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 }
            ]);
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
`
            } as GitHubIssue;
            const actual = issueContentParser.extractIssueTasklist(issue);
            expect(actual).toEqual([
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 },
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 5700 },
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 5753 },
            ]);
        });

        it("parses tasklist with Win-style line endings", () => {
            const issue = { body: "# Epic 1\r\n\r\n## Issue Spec\r\n\r\n- [ ] https://github.com/actions/setup-node/issues/5663\r\n- [ ] https://github.com/actions/setup-python/issues/170\r\n- [ ] https://github.com/actions/setup-go/issues/1\r\n\r\n### Spec graph\r\n\r\nTest content" } as GitHubIssue;
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
`
            } as GitHubIssue;
            const actual = issueContentParser.extractIssueTasklist(issue);
            expect(actual).toEqual([
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 1 },
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 2 },
                { repoOwner: "actions", repoName: "setup-node", issueNumber: 7 },
            ]);
        });
    });
});
