import { redirect } from "next/navigation";
import { ResultsView } from "@/components/practice/ResultsView";
import { getProfile } from "@/lib/profile";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <ResultsView
      conversationId={conversationId}
      credits={profile.credits}
      plan={profile.plan}
    />
  );
}
