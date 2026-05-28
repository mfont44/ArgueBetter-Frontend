import type { TranslationKey, Translator } from "./i18n-core";
import {
  normalizeEndReason,
  normalizeShouldEnd,
} from "./sessionEnd";
import type {
  CreateConversationPayload,
  CreateConversationResponse,
  FinishConversationResponse,
  SendMessageResponse,
} from "./types";

const CONFIGURED_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Browser calls use same-origin proxy in local dev to avoid CORS issues. */
function getApiBaseUrl(): string {
  if (
    typeof window !== "undefined" &&
    CONFIGURED_API_URL === "http://localhost:8000"
  ) {
    return "/api/backend";
  }
  return CONFIGURED_API_URL;
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  return (
    err instanceof Error &&
    /failed to fetch|networkerror|load failed/i.test(err.message)
  );
}

export function formatApiError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (isNetworkError(err)) {
    return "Cannot reach the practice API. Is the backend running on port 8000?";
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function formatApiErrorI18n(
  err: unknown,
  t: Translator["t"],
  fallbackKey: TranslationKey = "api.requestFailed"
): string {
  if (err instanceof ApiError) return err.message || t(fallbackKey);
  if (isNetworkError(err)) return t("api.networkError");
  if (err instanceof Error && err.message) return err.message;
  return t(fallbackKey);
}

export function isConversationNotActiveError(err: unknown): boolean {
  return (
    err instanceof ApiError &&
    err.status === 400 &&
    err.message.toLowerCase().includes("conversation is not active")
  );
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    let code: string | undefined;
    let message = res.statusText;
    try {
      const body = await res.json();
      const detail = body.detail ?? body;
      if (typeof detail === "string") {
        message = detail;
      } else if (detail && typeof detail === "object") {
        if ("code" in detail) code = String(detail.code);
        if ("message" in detail) message = String(detail.message);
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(message || "Request failed", res.status, code);
  }

  return res.json() as Promise<T>;
}

export async function createConversation(
  token: string,
  payload: CreateConversationPayload
): Promise<CreateConversationResponse> {
  return apiFetch("/conversations", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function retryConversation(
  token: string,
  sourceConversationId: string
): Promise<CreateConversationResponse> {
  return createConversation(token, {
    retry_of_conversation_id: sourceConversationId,
  });
}

export async function sendMessage(
  token: string,
  conversationId: string,
  content: string
): Promise<SendMessageResponse> {
  const raw = await apiFetch<SendMessageResponse & Record<string, unknown>>(
    `/conversations/${conversationId}/messages`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  );
  const shouldEnd = normalizeShouldEnd(raw.should_end ?? raw.shouldEnd);
  const endReason = normalizeEndReason(raw.end_reason ?? raw.endReason);
  return {
    ...raw,
    should_end: shouldEnd,
    end_reason: endReason,
    exchange_count: raw.exchange_count ?? 0,
    turn_count: raw.turn_count ?? 0,
  };
}

export async function finishConversation(
  token: string,
  conversationId: string
): Promise<FinishConversationResponse> {
  return apiFetch(`/conversations/${conversationId}/finish`, token, {
    method: "POST",
  });
}

export async function deleteAccount(token: string): Promise<{ success: boolean }> {
  return apiFetch("/account", token, {
    method: "DELETE",
  });
}

export type BillingInterval = "month" | "year";

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}

export interface BillingStatusResponse {
  plan?: string;
  status?: string;
  current_period_end?: string;
}

export async function createCheckoutSession(
  token: string,
  interval: BillingInterval
): Promise<CheckoutResponse> {
  return apiFetch("/billing/checkout", token, {
    method: "POST",
    body: JSON.stringify({ interval }),
  });
}

export async function createPortalSession(
  token: string
): Promise<PortalResponse> {
  return apiFetch("/billing/portal", token, {
    method: "POST",
  });
}

export async function getBillingStatus(
  token: string
): Promise<BillingStatusResponse> {
  return apiFetch("/billing/status", token);
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${getApiBaseUrl()}/health`);
  return res.json();
}
