import { GitHubRepoReference } from "../src/models";
import { parseIssueNumber, parseIssuesUrls, parseIssueUrl, wrapString } from "../src/utils";

describe("parseIssueUrl", () => {
    it("invalid site host", () => {
        const actual = parseIssueUrl("google.com");
        expect(actual).toBeNull();
    });

    it("only repository url", () => {
        const actual = parseIssueUrl("https://github.com/actions/setup-node");
        expect(actual).toBeNull();
    });

    it("only repository issues url without issue number", () => {
        const actual = parseIssueUrl("https://github.com/actions/setup-node/issues");
        expect(actual).toBeNull();
    });

    it("empty issue number", () => {
        const actual = parseIssueUrl("https://github.com/actions/setup-node/issues/");
        expect(actual).toBeNull();
    });

    it("non-number issue number", () => {
        const actual = parseIssueUrl("https://github.com/actions/setup-node/issues/fake");
        expect(actual).toBeNull();
    });

    it("parses correct issue url", () => {
        const actual = parseIssueUrl("https://github.com/actions/setup-node/issues/5663");
        expect(actual).toStrictEqual({ repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 });
    });

    it("parses correct issue url with trailing spaces", () => {
        const actual = parseIssueUrl(" https://github.com/actions/setup-node/issues/5663");
        expect(actual).toStrictEqual({ repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 });
    });

    it("parses correctly more complex issue url", () => {
        const actual = parseIssueUrl("https://github.com/maxim-lobanov/build-issue-dependencies-graph/issues/1");
        expect(actual).toStrictEqual({
            repoOwner: "maxim-lobanov",
            repoName: "build-issue-dependencies-graph",
            issueNumber: 1,
        });
    });
});

describe("parseIssueNumber", () => {
    const repoRef: GitHubRepoReference = { repoOwner: "testOwner", repoName: "testRepo" };

    it("empty string", () => {
        const actual = parseIssueNumber("", repoRef);
        expect(actual).toBeNull();
    });

    it("invalid format", () => {
        const actual = parseIssueNumber("#abc", repoRef);
        expect(actual).toBeNull();
    });

    it("parses issue number correctly", () => {
        const actual = parseIssueNumber("#123", repoRef);
        expect(actual).toStrictEqual({
            repoOwner: "testOwner",
            repoName: "testRepo",
            issueNumber: 123,
        });
    });
});

describe("parseIssuesUrls", () => {
    const repoRef: GitHubRepoReference = { repoOwner: "testOwner", repoName: "testRepo" };

    it("parses single issue url", () => {
        const actual = parseIssuesUrls("https://github.com/actions/setup-node/issues/5663", repoRef);
        expect(actual).toStrictEqual([{ repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 }]);
    });

    it("parses multiple issues urls", () => {
        const actual = parseIssuesUrls(
            "https://github.com/actions/setup-node/issues/110 https://github.com/actions/setup-go/issues/115 https://github.com/actions/setup-go/issues/120",
            repoRef
        );
        expect(actual).toStrictEqual([
            { repoOwner: "actions", repoName: "setup-node", issueNumber: 110 },
            { repoOwner: "actions", repoName: "setup-go", issueNumber: 115 },
            { repoOwner: "actions", repoName: "setup-go", issueNumber: 120 },
        ]);
    });

    it("parses multiple comma separated issues urls", () => {
        const actual = parseIssuesUrls(
            "https://github.com/actions/setup-node/issues/110, https://github.com/actions/setup-go/issues/115",
            repoRef
        );
        expect(actual).toStrictEqual([
            { repoOwner: "actions", repoName: "setup-node", issueNumber: 110 },
            { repoOwner: "actions", repoName: "setup-go", issueNumber: 115 },
        ]);
    });

    it("parses multiple issues urls with additional words", () => {
        const actual = parseIssuesUrls(
            "Depends on: https://github.com/actions/setup-node/issues/110, https://github.com/actions/setup-go/issues/115",
            repoRef
        );
        expect(actual).toStrictEqual([
            { repoOwner: "actions", repoName: "setup-node", issueNumber: 110 },
            { repoOwner: "actions", repoName: "setup-go", issueNumber: 115 },
        ]);
    });

    it("parses multiple issue numbers with additional words", () => {
        const actual = parseIssuesUrls("Depends on: #123, gawgaw #213 afaaw", repoRef);
        expect(actual).toStrictEqual([
            { repoOwner: "testOwner", repoName: "testRepo", issueNumber: 123 },
            { repoOwner: "testOwner", repoName: "testRepo", issueNumber: 213 },
        ]);
    });

    it("parses multiple issues in different formats", () => {
        const actual = parseIssuesUrls(
            "Depends on: https://github.com/actions/setup-node/issues/110, #123, gawgaw #213 afaaw, https://github.com/actions/setup-go/issues/115",
            repoRef
        );
        expect(actual).toStrictEqual([
            { repoOwner: "actions", repoName: "setup-node", issueNumber: 110 },
            { repoOwner: "testOwner", repoName: "testRepo", issueNumber: 123 },
            { repoOwner: "testOwner", repoName: "testRepo", issueNumber: 213 },
            { repoOwner: "actions", repoName: "setup-go", issueNumber: 115 },
        ]);
    });

    it("no valid urls found", () => {
        const actual = parseIssuesUrls(
            "https://github.com/actions/setup-node/, https://github.com/actions/setup-go/issues/ https://github.com/actions/setup-go/issues/fake",
            repoRef
        );
        expect(actual).toStrictEqual([]);
    });
});

describe("wrapString", () => {
    it.each([
        ["", 40, ""],
        ["hello world", 40, "hello world"],
        [
            "Integrate software report diff module into macOS Monterey pipeline and validate deployment pipeline end-to-end",
            40,
            "Integrate software report diff module into\nmacOS Monterey pipeline and validate\ndeployment pipeline end-to-end",
        ],
        [
            "Onboard Linux image generation to new software report module",
            40,
            "Onboard Linux image generation to new\nsoftware report module",
        ],
        [
            "Integrate auxiliary release scripts into Windows / Linux deployment pipelines",
            40,
            "Integrate auxiliary release scripts into\nWindows / Linux deployment pipelines",
        ],
        [
            "Implement unit tests and e2e tests for software report diff module",
            40,
            "Implement unit tests and e2e tests for\nsoftware report diff module",
        ],
    ])("case %#", (input: string, maxWidth: number, expected: string) => {
        const actual = wrapString(input, maxWidth);
        expect(actual).toBe(expected);
    });
});
