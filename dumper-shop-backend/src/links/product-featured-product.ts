import ProductModule from "@medusajs/medusa/product";
import { defineLink } from "@medusajs/framework/utils";
import FeaturedProduct from "../modules/featured-products/models/featured-product";
import FeaturedProductModule from "../modules/featured-products";
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: false,
  },
  FeaturedProductModule.linkable.featuredProduct,
);
