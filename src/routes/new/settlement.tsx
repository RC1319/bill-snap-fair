import { createFileRoute } from "@tanstack/react-router";
import SettlementPage from "../../pages/SettlementPage";

export const Route = createFileRoute("/new/settlement")({
  component: SettlementPage,
});
