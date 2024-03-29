import { Graph, GraphEdge } from "./graph-builder";
import { MermaidNode } from "./mermaid-node";

export class MermaidRender {
    constructor(private readonly includeLegend: boolean) {}

    public render(graph: Graph): string {
        return `
\`\`\`mermaid
flowchart TD
${this.renderLegendSection()}
${this.renderCssSection()}
${this.renderIssuesSection(graph.vertices)}
${this.renderDependencies(graph.edges)}
\`\`\`
`;
    }

    private renderCssSection(): string {
        return `
%% <CSS>

classDef notstarted fill:#FFF,color:#000;
classDef started fill:#fae17d,color:#000;
classDef completed fill:#ccffd8,color:#000;

%% </CSS>
`;
    }

    private renderLegendSection(): string {
        if (!this.includeLegend) {
            return "";
        }

        return `
%% <Legend>
legend --> start
subgraph legend["Legend"]
    direction LR;
    notstarted("Issue is not started"):::notstarted;
    started("Issue is in progress"):::started;
    completed("Issue is done"):::completed;
    notstarted --> started --> completed;
end

%% </Legend>
`;
    }

    private renderIssuesSection(issues: MermaidNode[]): string {
        const renderedGraphIssues = issues.map(x => this.renderIssue(x)).join("\n\n");

        return `
%% <Issues>

${renderedGraphIssues}

%% </Issues>
`;
    }

    private renderIssue(issue: MermaidNode): string {
        const title = issue.getFormattedTitle();
        const linkedTitle = issue.url
            ? `<a href='${issue.url}' style='text-decoration:none;color: inherit;'>${title}</a>`
            : title;
        return `${issue.nodeId}("${linkedTitle}"):::${issue.status};`;
    }

    private renderDependencies(dependencies: GraphEdge[]): string {
        const renderedDependencies = dependencies.map(x => this.renderDependency(x)).join("\n");

        return `
%% <Dependencies>

${renderedDependencies}

%% </Dependencies>
`;
    }

    private renderDependency(dependency: GraphEdge): string {
        return `${dependency.from.nodeId} --> ${dependency.to.nodeId};`;
    }
}
