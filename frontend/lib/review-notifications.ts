import { toast } from "sonner"

export function notifyNoReviewCards(message: string) {
  toast.error(message)
}
