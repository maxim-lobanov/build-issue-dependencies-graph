import { GitHubIssue } from "./models";
import { wrapString } from "./utils";

export type MermaidNodeStatus = "default" | "notstarted" | "started" | "completed";

export class MermaidNode {
    constructor(
        public readonly nodeId: string,
        public readonly title: string,
        public readonly status: MermaidNodeStatus,
        public readonly url?: string
    ) {}

    public getFormattedTitle(): string {
        let result = this.title;

        result = result.replaceAll('"', "'");
        result = wrapString(result, 40);

        return result;
    }

    public static createFromGitHubIssue(issue: GitHubIssue): MermaidNode {
        return new MermaidNode(
            `issue${issue.id}`,
            issue.title,
            MermaidNode.getNodeStatusFromGitHubIssue(issue),
            //issue.html_url
        );
    }

    private static getNodeStatusFromGitHubIssue(issue: GitHubIssue): MermaidNodeStatus {
        if (issue.state !== "open") {
            return "completed";
        }

        if (issue.assignees && issue.assignees.length > 0) {
            return "started";
        }

        return "notstarted";
    }

    public static createStartNode(): MermaidNode {
        return new MermaidNode("start", "Start", "default");
    }

    public static createFinishNode(): MermaidNode {
        return new MermaidNode("finish", "Finish", "default");
    }
}
