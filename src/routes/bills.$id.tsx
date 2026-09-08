import { createFileRoute } from "@tanstack/react-router";
import BillDetailsPage from "../pages/BillDetailsPage";

export const Route = createFileRoute("/bills/$id")({
  component: BillDetailWrapper,
});

function BillDetailWrapper() {
  const { id } = Route.useParams();
  return <BillDetailsPage billId={id} />;
}
