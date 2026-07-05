export const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const getAccessTokenSecret = () =>
  process.env.ACCESS_TOKEN_SECRET || process.env.TOKEN_SECRET;

export const getRefreshTokenSecret = () =>
  process.env.REFRESH_TOKEN_SECRET || process.env.TOKEN_SECRET;