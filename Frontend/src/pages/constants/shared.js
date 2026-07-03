import { toast } from "sonner";

export function toastError(message) {
  toast.error(message, {
    position: "top-center",
    style: {
      border: "1px solid #ff4d4f",
      padding: "16px",
      color: "#ff4d4f",
      background: "#fff1f0",
    },
    icon: "⚠️",
  });
}
export function toastSuccess(message) {
  toast.success(message, {
    position: "top-center",
    style: {
      border: "1px solid #66ff00",
      padding: "16px",
      color: "#66ff00",
      background: "#fff1f0",
    },
    icon: "✅",
  });
}



export const emailRegex = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;
export const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;
export const passErrorMsg =
  "Minimum eight characters, at least one upper case English letter, one lower case English letter, one number and one special character";

export const nameRegex = /^[a-zA-Z]{3,15}$/;
