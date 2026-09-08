import { createFileRoute } from "@tanstack/react-router";
import BillChargesPage from "../../pages/BillChargesPage";

export const Route = createFileRoute("/new/charges")({
  component: BillChargesPage,
});
