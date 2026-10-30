export type InspectorTab = "evidence" | "activity";

export type WorkspaceState = {
  draft: string;
  inspector: InspectorTab;
};

export type WorkspaceAction =
  | { type: "set-draft"; value: string }
  | { type: "clear-draft" }
  | { type: "select-inspector"; value: InspectorTab };

export const initialWorkspaceState: Readonly<WorkspaceState>;

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState;
