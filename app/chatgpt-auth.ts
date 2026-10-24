import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

const USER_ID_HEADER = "oai-authenticated-user-id";
const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/signin-with-chatgpt";
const SIGN_OUT_PATH = "/signout-with-chatgpt";
const CALLBACK_PATH = "/callback";

export function parseGoogleSession(cookieHeader: string | null): ChatGPTUser | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/pc_google_auth=([^;]+)/);
  if (!match) return null;
  try {
    const raw = decodeURIComponent(match[1]);
    let jsonStr: string;
    try {
      jsonStr = typeof atob === "function" ? atob(raw) : Buffer.from(raw, "base64").toString("utf-8");
    } catch {
      jsonStr = raw;
    }
    const data = JSON.parse(jsonStr);
    if (data && data.email) {
      const email = String(data.email).trim().toLowerCase();
      const displayName = data.displayName || data.fullName || (email === 'vihan.agrawal4@gmail.com' ? 'Vihan Agrawal' : email.split('@')[0]);
      return {
        userId: data.userId || 'google_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
        displayName,
        email,
        fullName: displayName,
      };
    }
  } catch {
    try {
      const email = decodeURIComponent(match[1]).trim().toLowerCase();
      if (email.includes('@')) {
        return {
          userId: 'google_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
          displayName: email === 'vihan.agrawal4@gmail.com' ? 'Vihan Agrawal' : email.split('@')[0],
          email,
          fullName: email === 'vihan.agrawal4@gmail.com' ? 'Vihan Agrawal' : email.split('@')[0],
        };
      }
    } catch {}
  }
  return null;
}

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();

  const googleUser = parseGoogleSession(requestHeaders.get("cookie"));
  if (googleUser) return googleUser;

  const userId = requestHeaders.get(USER_ID_HEADER);
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (!userId || !email) return null;

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const fullName =
    encodedFullName &&
    requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
      ? safeDecodeURIComponent(encodedFullName)
      : null;

  return {
    userId,
    displayName: fullName ?? email,
    email,
    fullName,
  };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (isReservedAuthPath(url.pathname)) return "/";

  return `${url.pathname}${url.search}${url.hash}`;
}

function isReservedAuthPath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH ||
    pathname === SIGN_OUT_PATH ||
    pathname === CALLBACK_PATH
  );
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
