import { format } from "date-fns";

export const formatDate = (date: string) => format(new Date(date), "MMM d, yyyy");
