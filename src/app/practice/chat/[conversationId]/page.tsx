import { redirect } from "next/navigation";
import { ChatView } from "@/components/practice/ChatView";
import { getProfile } from "@/lib/profile";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <ChatView
      conversationId={conversationId}
      credits={profile.credits}
      plan={profile.plan}
    />
  );
}
