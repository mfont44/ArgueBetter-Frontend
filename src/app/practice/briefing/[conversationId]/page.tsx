import { redirect } from "next/navigation";
import { BriefingView } from "@/components/practice/BriefingView";
import { getProfile } from "@/lib/profile";

export default async function BriefingPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <BriefingView
      conversationId={conversationId}
      credits={profile.credits}
      plan={profile.plan}
    />
  );
}
