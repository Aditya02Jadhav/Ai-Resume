from langgraph.graph import StateGraph, END
from .panel_state import PanelState
from .panel_nodes import hr_node, tech_node, manager_node

def build_panel_graph() -> StateGraph:
    graph = StateGraph(PanelState)
    
    graph.add_node("hr_node", hr_node)
    graph.add_node("tech_node", tech_node)
    graph.add_node("manager_node", manager_node)
    
    graph.set_entry_point("hr_node")
    graph.add_edge("hr_node", "tech_node")
    graph.add_edge("tech_node", "manager_node")
    
    def should_continue(state: PanelState):
        if state.get("turn_count", 0) >= 2:
            return "end"
        return "continue"
        
    graph.add_conditional_edges(
        "manager_node",
        should_continue,
        {
            "continue": "hr_node",
            "end": END
        }
    )
    
    return graph.compile()

compiled_panel_graph = build_panel_graph()
