import { ParsedIssueUrl, parseIssueUrl } from "../src/utils";

describe("parseIssueUrl", () => {
    it.each([
        [
            "https://github.com/maxim-lobanov/build-issue-dependencies-graph/issues/1",
            {
                owner: "maxim-lobanov",
                repo: "build-issue-dependencies-graph",
                issue_number: 1,
            },
        ],
        [
            "https://github.com/actions/setup-node/issues/5663",
            { owner: "actions", repo: "setup-node", issue_number: 5663 },
        ],
        ["https://github.com/actions/setup-node/issues/fake", null],
        ["https://github.com/actions/setup-node/issues/", null],
        ["https://github.com/actions/setup-node/issues", null],
        ["https://github.com/actions/setup-node", null],
        ["google.com", null],
    ])("parses %s", (input: string, expected: ParsedIssueUrl | null) => {
        const actual = parseIssueUrl(input);
        expect(actual).toEqual(expected);
    });
});
