from langgraph.graph import StateGraph, END
from .state import AgentState
from .nodes import parser_node, scoring_node, critique_node, finalizer_node


def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    graph.add_node("parser_node", parser_node)
    graph.add_node("scoring_node", scoring_node)
    graph.add_node("critique_node", critique_node)
    graph.add_node("finalizer_node", finalizer_node)

    graph.set_entry_point("parser_node")
    graph.add_edge("parser_node", "scoring_node")
    graph.add_edge("scoring_node", "critique_node")
    graph.add_edge("critique_node", "finalizer_node")
    graph.add_edge("finalizer_node", END)

    return graph.compile()


compiled_graph = build_graph()
