import { createFileRoute } from "@tanstack/react-router";
import ManualEntryPage from "../../pages/ManualEntryPage";

export const Route = createFileRoute("/new/manual")({
  component: ManualEntryPage,
});
