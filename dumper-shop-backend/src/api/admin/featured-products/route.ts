// src/api/admin/featured-products/route.ts
import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { z } from "zod";
import { createLinksWorkflow } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { FEATURED_PRODUCTS_MODULE } from "../../../modules/featured-products";
import { createFeaturedProductSchema } from "./validators";
import { createFeaturedProductWorkflow } from "../../../workflows/create-featured-products";
import FeaturedProductsService from "../../../modules/featured-products/service";

type CreateFeaturedProductInput = z.infer<typeof createFeaturedProductSchema>;

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve("query");
  const featuredProductsService: FeaturedProductsService = req.scope.resolve(
    FEATURED_PRODUCTS_MODULE,
  );

  const { data } =
    await featuredProductsService.listFeaturedProductsWithProducts(query);

  res.json({ featured_products: data });
};

export const POST = async (
  req: MedusaRequest<CreateFeaturedProductInput>,
  res: MedusaResponse,
) => {
  const { result } = await createFeaturedProductWorkflow(req.scope).run({
    input: req.validatedBody,
  });
  res.json({ featured_product: result });
};
