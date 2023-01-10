import { parseIssuesUrls, parseIssueUrl } from "../src/utils";

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

describe("parseIssuesUrls", () => {
    it("parses single issue url", () => {
        const actual = parseIssuesUrls("https://github.com/actions/setup-node/issues/5663");
        expect(actual).toStrictEqual([{ repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 }]);
    });

    it("parses multiple issues urls", () => {
        const actual = parseIssuesUrls(
            "https://github.com/actions/setup-node/issues/110 https://github.com/actions/setup-go/issues/115 https://github.com/actions/setup-go/issues/120"
        );
        expect(actual).toStrictEqual([
            { repoOwner: "actions", repoName: "setup-node", issueNumber: 110 },
            { repoOwner: "actions", repoName: "setup-go", issueNumber: 115 },
            { repoOwner: "actions", repoName: "setup-go", issueNumber: 120 },
        ]);
    });

    it("parses multiple comma separated issues urls", () => {
        const actual = parseIssuesUrls(
            "https://github.com/actions/setup-node/issues/110, https://github.com/actions/setup-go/issues/115"
        );
        expect(actual).toStrictEqual([
            { repoOwner: "actions", repoName: "setup-node", issueNumber: 110 },
            { repoOwner: "actions", repoName: "setup-go", issueNumber: 115 },
        ]);
    });

    it("parses multiple issues urls with additional words", () => {
        const actual = parseIssuesUrls(
            "Depends on: https://github.com/actions/setup-node/issues/110, https://github.com/actions/setup-go/issues/115"
        );
        expect(actual).toStrictEqual([
            { repoOwner: "actions", repoName: "setup-node", issueNumber: 110 },
            { repoOwner: "actions", repoName: "setup-go", issueNumber: 115 },
        ]);
    });

    it("no valid urls found", () => {
        const actual = parseIssuesUrls(
            "https://github.com/actions/setup-node/, https://github.com/actions/setup-go/issues/ https://github.com/actions/setup-go/issues/fake"
        );
        expect(actual).toStrictEqual([]);
    });
});
