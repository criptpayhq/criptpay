import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

/**
 * Extracts and toasts the most relevant error message from a Laravel API response.
 * Handles validation errors, standard error messages, and fallback generic messages.
 */
export const handleApiError = (error: unknown, fallbackMessage: string) => {
  console.error("API Error:", error);

  if (error instanceof AxiosError) {
    const data = error.response?.data;

    // 1. Check for Laravel Validation Errors (preferred)
    if (data?.errors && typeof data.errors === "object") {
      const firstErrorKey = Object.keys(data.errors)[0];
      const firstErrorMessage = data.errors[firstErrorKey][0];
      if (firstErrorMessage) {
        toast.error(firstErrorMessage);
        return;
      }
    }

    // 2. Check for standard 'message' field
    if (data?.message) {
      toast.error(data.message);
      return;
    }

    // 3. Check for direct string response (unlikely but possible)
    if (typeof data === "string") {
      toast.error(data);
      return;
    }
  }

  // 4. Fallback to generic message
  toast.error(fallbackMessage);
};
