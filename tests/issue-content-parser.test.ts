import { IssueContentParser } from "../src/issue-content-parser";
import { parseInputs } from "../src/config";

describe("IssueContentParser", () => {
    it("getIssueTasklist", async () => {
        const config = parseInputs();
        const issueContentParser = new IssueContentParser(config.accessToken);
        const result = await issueContentParser.getIssueTasklist(config.rootIssueUrl);
        expect(result).toEqual([]);
    });
});
