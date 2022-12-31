import { GitHubIssue } from "./models";

export type MermaidNodeStatus = "notstarted" | "started" | "completed";

export class MermaidNode {
    constructor(
        public readonly nodeId: string,
        public readonly title: string,
        public readonly status: MermaidNodeStatus,
        public readonly url?: string
    ) {}

    public static createFromGitHubIssue(issue: GitHubIssue): MermaidNode {
        return new MermaidNode(
            `issue${issue.id}`,
            issue.title,
            MermaidNode.getNodeStatusFromGitHubIssue(issue),
            issue.html_url
        );
    }

    private static getNodeStatusFromGitHubIssue(issue: GitHubIssue): MermaidNodeStatus {
        if (issue.state !== "open") {
            return "completed";
        }

        if (issue.assignee !== null) {
            return "started";
        }

        return "notstarted";
    }

    public static createStartNode(): MermaidNode {
        return new MermaidNode("start", "Start", "notstarted");
    }

    public static createFinishNode(): MermaidNode {
        return new MermaidNode("finish", "Finish", "notstarted");
    }
}
