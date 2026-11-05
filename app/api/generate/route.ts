import { handlers } from "../../../lib/server/runtime";
export const dynamic = "force-dynamic";
export async function POST(request: Request) { return handlers().generate(request); }
