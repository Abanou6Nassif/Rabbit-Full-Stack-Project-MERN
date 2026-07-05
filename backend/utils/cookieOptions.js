import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
} from "./tokenConfig.js";

const getBaseAuthCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};

export const getAccessTokenCookieOptions = () => ({
  ...getBaseAuthCookieOptions(),
  maxAge: ACCESS_TOKEN_TTL_MS,
});

export const getRefreshTokenCookieOptions = () => ({
  ...getBaseAuthCookieOptions(),
  maxAge: REFRESH_TOKEN_TTL_MS,
});
