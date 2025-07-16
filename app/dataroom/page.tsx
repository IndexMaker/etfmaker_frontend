import { redirect } from "next/navigation";

export default function DataroomPage() {
  redirect("/brand-book.pdf"); // this must be in /public folder
}
