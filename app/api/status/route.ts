import { handlers } from "../../../lib/server/runtime";
export const dynamic = "force-dynamic";
export async function GET() { return handlers().status(); }
