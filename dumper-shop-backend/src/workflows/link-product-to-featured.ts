import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { FEATURED_PRODUCTS_MODULE } from "../modules/featured-products";
import FeaturedProductsService from "../modules/featured-products/service";
import { LinkDefinition } from "@medusajs/framework/types";
import { createFeaturedProductWorkflow } from "./create-featured-products";

export interface LinkProductToFeaturedInput {
  product_id: string;
}

export interface FindOrCreateFeaturedPositionInput {
  product_id: string;
}

export interface FindOrCreateFeaturedPositionOutput {
  featured_product_id: string;
  position: number;
}

export const findOrCreateFeaturedPositionStep = createStep(
  "find-or-create-featured-position-step",
  async (input: FindOrCreateFeaturedPositionInput, { container }) => {
    const query = container.resolve("query");

    // Always auto-assign position - find the least free position
    // Get all featured products
    const { data: allFeaturedProducts } = await query.graph({
      entity: FEATURED_PRODUCTS_MODULE,
      fields: ["id", "position"],
    });

    // Get all linked featured products
    const { data: linkedProducts } = await query.graph({
      entity: "product_featured_product",
      fields: ["featured_product_id"],
    });

    const linkedIds = new Set(
      linkedProducts.map((link) => link.featured_product_id),
    );
    const availablePositions = allFeaturedProducts
      .filter((fp) => !linkedIds.has(fp.id))
      .map((fp) => fp.position)
      .sort((a, b) => a - b);

    let position: number;
    let featuredProductId: string;

    if (availablePositions.length > 0) {
      // Use the smallest available position
      position = availablePositions[0];
      const fp = allFeaturedProducts.find((fp) => fp.position === position);
      featuredProductId = fp!.id;
    } else {
      // No free positions, create a new one
      const maxPosition =
        allFeaturedProducts.length > 0
          ? Math.max(...allFeaturedProducts.map((fp) => fp.position))
          : 0;
      position = maxPosition + 1;

      // Create new featured product
      const { result: newFeaturedProduct } =
        await createFeaturedProductWorkflow(container).run({
          input: { position },
        });

      featuredProductId = newFeaturedProduct.id;
    }

    return new StepResponse({
      featured_product_id: featuredProductId,
      position,
    });
  },
);

export const linkProductToFeaturedStep = createStep(
  "link-product-to-featured-step",
  async (
    input: {
      product_id: string;
      featured_position: FindOrCreateFeaturedPositionOutput;
    },
    { container },
  ) => {
    const link = container.resolve("link");
    const query = container.resolve("query");

    const { product_id, featured_position } = input;

    // Check if the product exists
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { id: product_id },
    });

    if (!products.length) {
      throw new Error(`Product with id ${product_id} not found`);
    }

    // Check if product is already linked to a featured product
    const { data: existingProductLinks } = await query.graph({
      entity: "product_featured_product",
      fields: ["product_id", "featured_product_id"],
      filters: { product_id },
    });

    if (existingProductLinks.length > 0) {
      throw new Error(
        `Product ${product_id} is already linked to a featured product`,
      );
    }

    // Create the link
    const linkDefinition = {
      [Modules.PRODUCT]: {
        product_id,
      },
      [FEATURED_PRODUCTS_MODULE]: {
        featured_product_id: featured_position.featured_product_id,
      },
    } as any;

    const createdLinks = await link.create([linkDefinition]);

    return new StepResponse(createdLinks[0], (createdLinks[0] as any).id);
  },
  async (linkId: any, { container }) => {
    const link = container.resolve("link");
    await link.dismiss([linkId]);
  },
);

export const linkProductToFeaturedWorkflow = createWorkflow(
  "link-product-to-featured",
  (input: LinkProductToFeaturedInput) => {
    const featuredPosition = findOrCreateFeaturedPositionStep({
      product_id: input.product_id,
    });

    const link = linkProductToFeaturedStep({
      product_id: input.product_id,
      featured_position: featuredPosition,
    });

    return new WorkflowResponse(link);
  },
);
