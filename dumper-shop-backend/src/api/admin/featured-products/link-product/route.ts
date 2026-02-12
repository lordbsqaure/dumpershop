import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import { linkProductToFeaturedSchema } from "../validators";
import { linkProductToFeaturedWorkflow } from "../../../../workflows/link-product-to-featured";

type LinkProductToFeaturedInput = z.infer<typeof linkProductToFeaturedSchema>;

export const POST = async (
  req: MedusaRequest<LinkProductToFeaturedInput>,
  res: MedusaResponse,
) => {
  const { result } = await linkProductToFeaturedWorkflow(req.scope).run({
    input: req.validatedBody,
  });
  res.json({ link: result });
};
