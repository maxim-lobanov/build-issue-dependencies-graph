import { Graph, GraphBuilder } from "../src/graph-builder";
import { MermaidNode } from "../src/mermaid-node";

function extractNodeIdFromGraph(graph: Graph) {
    return {
        vertices: graph.vertices.map(x => x.nodeId),
        edges: graph.edges.map(x => ({ from: x.from.nodeId, to: x.to.nodeId })),
    };
}

describe("GraphBuilder", () => {
    it("graph without edges", () => {
        const graphBuilder = new GraphBuilder();

        graphBuilder.addIssue(
            { repoOwner: "A", repoName: "B", issueNumber: 1 },
            new MermaidNode("issue1", "Test issue 1", "started")
        );
        graphBuilder.addIssue(
            { repoOwner: "A", repoName: "B", issueNumber: 2 },
            new MermaidNode("issue2", "Test issue 2", "started")
        );

        const actual = extractNodeIdFromGraph(graphBuilder.getGraph());
        expect(actual.vertices).toEqual(["start", "issue1", "issue2", "finish"]);
        expect(actual.edges).toEqual([
            { from: "start", to: "issue1" },
            { from: "start", to: "issue2" },
            { from: "issue1", to: "finish" },
            { from: "issue2", to: "finish" },
        ]);
    });

    it("graph with edges", () => {
        const graphBuilder = new GraphBuilder();

        graphBuilder.addIssue(
            { repoOwner: "A", repoName: "B", issueNumber: 1 },
            new MermaidNode("issue1", "Test issue 1", "started")
        );
        graphBuilder.addIssue(
            { repoOwner: "A", repoName: "B", issueNumber: 2 },
            new MermaidNode("issue2", "Test issue 2", "started")
        );
        graphBuilder.addIssue(
            { repoOwner: "A", repoName: "B", issueNumber: 3 },
            new MermaidNode("issue3", "Test issue 3", "started")
        );
        graphBuilder.addIssue(
            { repoOwner: "A", repoName: "B", issueNumber: 4 },
            new MermaidNode("issue4", "Test issue 4", "started")
        );
        graphBuilder.addIssue(
            { repoOwner: "A", repoName: "B", issueNumber: 5 },
            new MermaidNode("issue5", "Test issue 5", "started")
        );
        graphBuilder.addDependency(
            { repoOwner: "A", repoName: "B", issueNumber: 1 },
            { repoOwner: "A", repoName: "B", issueNumber: 2 }
        );
        graphBuilder.addDependency(
            { repoOwner: "A", repoName: "B", issueNumber: 2 },
            { repoOwner: "A", repoName: "B", issueNumber: 3 }
        );
        graphBuilder.addDependency(
            { repoOwner: "A", repoName: "B", issueNumber: 2 },
            { repoOwner: "A", repoName: "B", issueNumber: 4 }
        );
        graphBuilder.addDependency(
            { repoOwner: "A", repoName: "B", issueNumber: 4 },
            { repoOwner: "A", repoName: "B", issueNumber: 5 }
        );

        const actual = extractNodeIdFromGraph(graphBuilder.getGraph());
        expect(actual.vertices).toEqual(["start", "issue1", "issue2", "issue3", "issue4", "issue5", "finish"]);
        expect(actual.edges).toEqual([
            { from: "start", to: "issue1" },
            { from: "issue1", to: "issue2" },
            { from: "issue2", to: "issue3" },
            { from: "issue2", to: "issue4" },
            { from: "issue4", to: "issue5" },
            { from: "issue3", to: "finish" },
            { from: "issue5", to: "finish" },
        ]);
    });

    it("graph with invalid edges", () => {
        const graphBuilder = new GraphBuilder();

        graphBuilder.addIssue(
            { repoOwner: "A", repoName: "B", issueNumber: 1 },
            new MermaidNode("issue1", "Test issue 1", "started")
        );
        graphBuilder.addIssue(
            { repoOwner: "A", repoName: "B", issueNumber: 2 },
            new MermaidNode("issue2", "Test issue 2", "started")
        );
        graphBuilder.addIssue(
            { repoOwner: "A", repoName: "B", issueNumber: 3 },
            new MermaidNode("issue3", "Test issue 3", "started")
        );
        graphBuilder.addDependency(
            { repoOwner: "A", repoName: "B", issueNumber: 1 },
            { repoOwner: "A", repoName: "B", issueNumber: 3 }
        );
        graphBuilder.addDependency(
            { repoOwner: "A", repoName: "B", issueNumber: 2 },
            { repoOwner: "A", repoName: "B", issueNumber: 3 }
        );
        graphBuilder.addDependency(
            { repoOwner: "A", repoName: "B", issueNumber: 2 },
            { repoOwner: "A", repoName: "B", issueNumber: 4 }
        );
        graphBuilder.addDependency(
            { repoOwner: "A", repoName: "B", issueNumber: 6 },
            { repoOwner: "A", repoName: "B", issueNumber: 5 }
        );

        const actual = extractNodeIdFromGraph(graphBuilder.getGraph());
        expect(actual.vertices).toEqual(["start", "issue1", "issue2", "issue3", "finish"]);
        expect(actual.edges).toEqual([
            { from: "start", to: "issue1" },
            { from: "start", to: "issue2" },
            { from: "issue1", to: "issue3" },
            { from: "issue2", to: "issue3" },
            { from: "issue3", to: "finish" },
        ]);
    });
});
