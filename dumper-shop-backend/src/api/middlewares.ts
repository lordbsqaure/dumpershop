import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import {
  createFeaturedProductSchema,
  linkProductToFeaturedSchema,
  unlinkProductFromFeaturedSchema,
} from "./admin/featured-products/validators";
import { z } from "zod";
export const GetFeaturedProductsSchema = z.object({
  region_id: z.string().optional(),
  currency_code: z.string().optional(),
});
export const GetBrandsSchema = createFindParams();

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/featured-products",
      method: "POST",
      middlewares: [validateAndTransformBody(createFeaturedProductSchema)],
    },
    {
      matcher: "/admin/featured-products/link-product",
      method: "POST",
      middlewares: [validateAndTransformBody(linkProductToFeaturedSchema)],
    },
    {
      matcher: "/admin/featured-products/unlink-product",
      method: "POST",
      middlewares: [validateAndTransformBody(unlinkProductFromFeaturedSchema)],
    },
    {
      matcher: "/store/featured-products",
      method: "GET",
      middlewares: [validateAndTransformQuery(GetFeaturedProductsSchema, {})],
    },
    {
      matcher: "/admin/products",
      method: ["POST"],
      additionalDataValidator: { featured_product_id: z.string().optional() },
    },
  ],
});
