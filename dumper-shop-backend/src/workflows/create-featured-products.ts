import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { FEATURED_PRODUCTS_MODULE } from "../modules/featured-products";
import FeaturedProductsService from "../modules/featured-products/service";

export interface FeaturedProduct {
  position: number;
}

export const createFeaturedProductStep = createStep(
  "create-featured-product-step",
  async (input: FeaturedProduct, { container }) => {
    const featuredProductsService: FeaturedProductsService = container.resolve(
      FEATURED_PRODUCTS_MODULE,
    );

    const featuredProduct =
      await featuredProductsService.createFeaturedProducts(input);

    return new StepResponse(featuredProduct, featuredProduct.id);
  },
  async (id: string, { container }) => {
    const featuredProductsService: FeaturedProductsService = container.resolve(
      FEATURED_PRODUCTS_MODULE,
    );
    await featuredProductsService.deleteFeaturedProducts(id);
  },
);

export const createFeaturedProductWorkflow = createWorkflow(
  "create-featured-product",
  (input: FeaturedProduct) => {
    const featured_product = createFeaturedProductStep(input);
    return new WorkflowResponse(featured_product);
  },
);
