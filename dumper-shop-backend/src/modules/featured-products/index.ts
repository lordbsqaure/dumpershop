import FeaturedProductsService from "./service";
import { Module } from "@medusajs/framework/utils";

export const FEATURED_PRODUCTS_MODULE = "featured_products";

export default Module(FEATURED_PRODUCTS_MODULE, {
  service: FeaturedProductsService,
});
