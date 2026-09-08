import { createFileRoute } from "@tanstack/react-router";
import AddPeoplePage from "../../pages/AddPeoplePage";

export const Route = createFileRoute("/new/people")({
  component: AddPeoplePage,
});
