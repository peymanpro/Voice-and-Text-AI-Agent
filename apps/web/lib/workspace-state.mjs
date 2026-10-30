export const initialWorkspaceState = Object.freeze({
  draft: "",
  inspector: "evidence",
});

export function workspaceReducer(state, action) {
  switch (action.type) {
    case "set-draft":
      return { ...state, draft: action.value };
    case "clear-draft":
      return { ...state, draft: "" };
    case "select-inspector":
      if (action.value !== "evidence" && action.value !== "activity") {
        return state;
      }
      return { ...state, inspector: action.value };
    default:
      return state;
  }
}
