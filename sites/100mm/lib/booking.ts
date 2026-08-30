import { z } from "zod";
import { projectTypes, projectValueBands } from "./site";

/** Shared between the client form and the checkout route, so they cannot drift. */
export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email address").max(200),
  phone: z.string().trim().min(7, "Please enter a contact number").max(40),
  postcode: z.string().trim().min(4, "Please enter the property postcode").max(12),
  address: z.string().trim().min(4, "Please enter the property address").max(300),
  projectType: z.enum(projectTypes),
  valueBand: z.enum(projectValueBands),
  timing: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof bookingSchema>;
