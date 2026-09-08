import { createFileRoute } from "@tanstack/react-router";
import AssignItemsPage from "../../pages/AssignItemsPage";

export const Route = createFileRoute("/new/assign")({
  component: AssignItemsPage,
});
