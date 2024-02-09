import { GitHubIssue } from "../src/models";
import { MermaidNode } from "../src/mermaid-node";

describe("MermaidNode", () => {
    describe("createFromGitHubIssue", () => {
        it("issue with completed status", () => {
            const issue: GitHubIssue = {
                id: 100,
                number: 1,
                title: "My Issue 1",
                body: "Test content",
                assignees: [{}],
                html_url: "github.com",
                state: "closed",
            };
            const actual = MermaidNode.createFromGitHubIssue(issue);
            expect(actual.nodeId).toBe("issue100");
            expect(actual.title).toBe("My Issue 1");
            //expect(actual.url).toBe("github.com");
            expect(actual.status).toBe("completed");
        });

        it("issue with started status", () => {
            const issue: GitHubIssue = {
                id: 100,
                number: 1,
                title: "My Issue 1",
                body: "Test content",
                assignees: [{}],
                html_url: "github.com",
                state: "open",
            };
            const actual = MermaidNode.createFromGitHubIssue(issue);
            expect(actual.nodeId).toBe("issue100");
            expect(actual.title).toBe("My Issue 1");
            //expect(actual.url).toBe("github.com");
            expect(actual.status).toBe("started");
        });

        it("issue with notstarted status", () => {
            const issue: GitHubIssue = {
                id: 100,
                number: 1,
                title: "My Issue 1",
                body: "Test content",
                assignees: [],
                html_url: "github.com",
                state: "open",
            };
            const actual = MermaidNode.createFromGitHubIssue(issue);
            expect(actual.nodeId).toBe("issue100");
            expect(actual.title).toBe("My Issue 1");
            //expect(actual.url).toBe("github.com");
            expect(actual.status).toBe("notstarted");
        });
    });

    describe("getFormattedTitle", () => {
        it.each([
            ["", ""],
            ["hello world", "hello world"],
            [
                "Onboard Linux image generation to new software report module",
                "Onboard Linux image generation to new\nsoftware report module",
            ],
            ['Update link "Learn more" with new link', "Update link 'Learn more' with new link"],
        ])("case %#", (input: string, expected: string) => {
            const node = new MermaidNode("issue", input, "notstarted");
            const actual = node.getFormattedTitle();
            expect(actual).toBe(expected);
        });
    });
});
