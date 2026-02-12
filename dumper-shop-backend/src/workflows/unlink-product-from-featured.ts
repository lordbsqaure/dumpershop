import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { FEATURED_PRODUCTS_MODULE } from "../modules/featured-products";

export interface UnlinkProductFromFeaturedInput {
  product_id: string;
}

export const unlinkProductFromFeaturedStep = createStep(
  "unlink-product-from-featured-step",
  async (input: UnlinkProductFromFeaturedInput, { container }) => {
    const link = container.resolve("link");
    const query = container.resolve("query");

    // Check if the product exists
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { id: input.product_id },
    });

    if (!products.length) {
      throw new Error(`Product with id ${input.product_id} not found`);
    }

    // Find existing link
    const { data: existingLinks } = await query.graph({
      entity: "product_featured_product",
      fields: ["product_id", "featured_product_id"],
      filters: { product_id: input.product_id },
    });

    if (!existingLinks.length) {
      throw new Error(
        `Product ${input.product_id} is not linked to any featured product`,
      );
    }

    // Dismiss the link using the same definition used for creation
    const linkDefinition = {
      product: {
        product_id: input.product_id,
      },
      [FEATURED_PRODUCTS_MODULE]: {
        featured_product_id: existingLinks[0].featured_product_id,
      },
    };

    await link.dismiss([linkDefinition]);

    return new StepResponse({
      product_id: input.product_id,
      featured_product_id: existingLinks[0].featured_product_id,
    });
  },
);

export const unlinkProductFromFeaturedWorkflow = createWorkflow(
  "unlink-product-from-featured",
  (input: UnlinkProductFromFeaturedInput) => {
    const unlink = unlinkProductFromFeaturedStep(input);
    return new WorkflowResponse(unlink);
  },
);
