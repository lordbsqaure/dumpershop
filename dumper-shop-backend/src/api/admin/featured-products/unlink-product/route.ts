import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";
import { unlinkProductFromFeaturedSchema } from "../validators";
import { unlinkProductFromFeaturedWorkflow } from "../../../../workflows/unlink-product-from-featured";

type UnlinkProductFromFeaturedInput = z.infer<
  typeof unlinkProductFromFeaturedSchema
>;

export const POST = async (
  req: MedusaRequest<UnlinkProductFromFeaturedInput>,
  res: MedusaResponse,
) => {
  const { result } = await unlinkProductFromFeaturedWorkflow(req.scope).run({
    input: req.validatedBody,
  });
  res.json({ unlinked: result });
};
