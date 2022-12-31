import { parseIssueUrl } from "../src/utils";

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

    it("parses correct issue url with task list marker", () => {
        const actual = parseIssueUrl("- [ ] https://github.com/actions/setup-node/issues/5663");
        expect(actual).toStrictEqual({ repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 });
    });

    it("parses correct issue url if more than one issue in input line", () => {
        const actual = parseIssueUrl("- [ ] https://github.com/actions/setup-node/issues/5663, https://github.com/actions/setup-node/issues/5665");
        expect(actual).toStrictEqual({ repoOwner: "actions", repoName: "setup-node", issueNumber: 5663 });
    });

    it("parses correctly more complex issue url", () => {
        const actual = parseIssueUrl("https://github.com/maxim-lobanov/build-issue-dependencies-graph/issues/1");
        expect(actual).toStrictEqual({ repoOwner: "maxim-lobanov", repoName: "build-issue-dependencies-graph", issueNumber: 1 });
    });
});
