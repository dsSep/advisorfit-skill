import { getChatGPTUser, chatGPTSignInPath } from "./chatgpt-auth";
import { Demo } from "./components/demo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  return <Demo authenticated={Boolean(user)} signInPath={chatGPTSignInPath("/")} />;
}
