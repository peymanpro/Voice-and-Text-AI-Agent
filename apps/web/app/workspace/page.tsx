import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/workspace-shell";

export const metadata: Metadata = {
  title: "Workspace | Voice and Text AI Agent",
  description:
    "Preview the conversation workspace. Live model, speech, and retrieval processing are not connected yet.",
};

export default function WorkspacePage() {
  return <WorkspaceShell />;
}
