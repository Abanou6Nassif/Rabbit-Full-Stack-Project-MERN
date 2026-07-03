export const getAuthCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  if (isProduction) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
  }

  return {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  };
};
