import { createFileRoute } from "@tanstack/react-router";
import UploadBillPage from "../../pages/UploadBillPage";

export const Route = createFileRoute("/new/upload")({
  component: UploadBillPage,
});
