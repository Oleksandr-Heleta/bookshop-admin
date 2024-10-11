import { z } from "zod";

export const phoneRegex = /^\+380\d{9}$/;

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.coerce.number().positive().min(1),
});

export const orderSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  orderStatus: z.string().min(1),
  orderState: z.string().min(1),
  phone: z.string().refine((value) => phoneRegex.test(value), {
    message: "Телефон повинен бути у форматі +380000000000",
  }),
  city: z.string().min(1),
  cityId: z.string().min(1),
  address: z.string().min(1),
  addressId: z.string().min(1).optional(),
  orderItems: z.array(orderItemSchema),
  isPaid: z.boolean().default(false),
  call: z.boolean().default(false),
  post: z.string().min(1),
  delivery: z.string().min(1),
});

export type OrderFormValues = z.infer<typeof orderSchema>;