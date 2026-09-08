import { createFileRoute } from "@tanstack/react-router";
import BillHistoryPage from "../pages/BillHistoryPage";

export const Route = createFileRoute("/bills/")({
  component: BillHistoryPage,
});
