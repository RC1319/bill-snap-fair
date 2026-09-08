import { createFileRoute } from "@tanstack/react-router";
import BillSummaryPage from "../../pages/BillSummaryPage";

export const Route = createFileRoute("/new/summary")({
  component: BillSummaryPage,
});
