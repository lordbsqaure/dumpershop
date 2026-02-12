import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { LinkDefinition } from "@medusajs/framework/types";

import FeaturedProductsService from "../../modules/featured-products/service";
import { FEATURED_PRODUCTS_MODULE } from "../../modules/featured-products";

createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {
    if (!additional_data?.featured_product_id) {
      return new StepResponse([], []);
    }

    const featuredProductsService: FeaturedProductsService = container.resolve(
      FEATURED_PRODUCTS_MODULE,
    );
    // if the featured product doesn't exist, an error is thrown.
    await featuredProductsService.retrieveFeaturedProduct(
      additional_data.featured_product_id as string,
    );
    const link = container.resolve("link");
    const logger = container.resolve("logger");

    const links: LinkDefinition[] = [];

    for (const product of products) {
      links.push({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [FEATURED_PRODUCTS_MODULE]: {
          featured_product_id: additional_data.featured_product_id,
        },
      });
    }

    await link.create(links);

    logger.info("Linked featured product to products");

    return new StepResponse(links, links);
  },

  async (links, { container }) => {
    if (!links?.length) {
      return;
    }
    const link = container.resolve("link");
    await link.dismiss(links);
  },
);
