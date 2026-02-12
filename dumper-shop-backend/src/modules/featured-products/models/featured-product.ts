import { model } from "@medusajs/framework/utils";

const FeaturedProduct = model.define("featured_product", {
  id: model.id().primaryKey(),
  position: model.number().unique(),
});

export default FeaturedProduct;
