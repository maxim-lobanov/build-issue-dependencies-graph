import { GitHubIssue } from "./models";

export type MermaidNodeStatus = "notstarted" | "started" | "completed";

export class MermaidNode {
    constructor(
        public readonly nodeId: string,
        public readonly title: string,
        public readonly status: MermaidNodeStatus,
        public readonly url?: string
    ) {}

    public getWrappedTitle(): string {
        const maxWidth = 40;
        const words = this.title.split(/\s+/);

        let result = words[0];
        let lastLength = result.length;
        for (let wordIndex = 1; wordIndex < words.length; wordIndex++) {
            if (lastLength + words[wordIndex].length >= maxWidth) {
                result += "\n";
                lastLength = 0;
            } else {
                result += " ";
            }

            result += words[wordIndex];
            lastLength += words[wordIndex].length;
        }

        return result;
    }

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

        if (issue.assignee) {
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
