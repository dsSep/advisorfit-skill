import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../app/chatgpt-auth";
import { CASES } from "../cases";
import skill from "../skill-data.json";
import { createHandlers } from "./handlers.mjs";

export function handlers() {
  return createHandlers({
    db: env.DB,
    user: getChatGPTUser,
    cases: CASES,
    skill,
    apiKey: env.DEEPSEEK_API_KEY,
    model: env.DEEPSEEK_MODEL || "deepseek-flash",
  });
}

