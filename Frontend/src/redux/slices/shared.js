export const getErrorMessage = (error) =>
  error.response?.data?.message || error.response?.data || error.message || "Authentication failed";