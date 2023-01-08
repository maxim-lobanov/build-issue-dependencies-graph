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
            expect(actual.url).toBe("github.com");
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
            expect(actual.url).toBe("github.com");
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
            expect(actual.url).toBe("github.com");
            expect(actual.status).toBe("notstarted");
        });
    });

    describe("getWrappedTitle", () => {
        it.each([
            ["", ""],
            ["hello world", "hello world"],
            [
                "Integrate software report diff module into macOS Monterey pipeline and validate deployment pipeline end-to-end",
                "Integrate software report diff module into\nmacOS Monterey pipeline and validate\ndeployment pipeline end-to-end",
            ],
            [
                "Onboard Linux image generation to new software report module",
                "Onboard Linux image generation to new\nsoftware report module",
            ],
            [
                "Integrate auxiliary release scripts into Windows / Linux deployment pipelines",
                "Integrate auxiliary release scripts into\nWindows / Linux deployment pipelines",
            ],
            [
                "Implement unit tests and e2e tests for software report diff module",
                "Implement unit tests and e2e tests for\nsoftware report diff module",
            ],
        ])("case %#", (input: string, expected: string) => {
            const node = new MermaidNode("issue", input, "notstarted");
            const actual = node.getWrappedTitle();
            expect(actual).toBe(expected);
        });
    });
});
