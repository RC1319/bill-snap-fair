import { createFileRoute } from "@tanstack/react-router";
import ReviewBillPage from "../../pages/ReviewBillPage";

export const Route = createFileRoute("/new/review")({
  component: ReviewBillPage,
});
