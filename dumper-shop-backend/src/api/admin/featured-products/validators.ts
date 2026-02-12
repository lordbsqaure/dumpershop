import { z } from "zod";

export const createFeaturedProductSchema = z.object({
  position: z.number().int().min(1),
});

export const linkProductToFeaturedSchema = z.object({
  product_id: z.string(),
});

export const unlinkProductFromFeaturedSchema = z.object({
  product_id: z.string(),
});
export const region = z.object({
  region_id: z.string(),
  currency_code: z.string(),
});
