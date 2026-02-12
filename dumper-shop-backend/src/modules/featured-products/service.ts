import { MedusaService, QueryContext } from "@medusajs/framework/utils";
import FeaturedProduct from "./models/featured-product";

export interface region {
  region_id: string | undefined;
  currency_code: string | undefined;
}
class FeaturedProductsService extends MedusaService({
  FeaturedProduct,
}) {
  async listFeaturedProductsWithProducts(query) {
    return await query.graph({
      entity: "product_featured_product",
      fields: ["id", "product.*", "product.variants.*"],
      order: { position: "ASC" },
    });
  }
  async listFeaturedProductsWithProductsWithPrice(query, region: region) {
    return await query.graph({
      entity: "product_featured_product",
      fields: [
        "id",
        "product.*",
        "product.variants.*",
        "product.variants.calculated_price.*",
      ],
      order: { position: "ASC" },
      context: {
        product: {
          variants: {
            calculated_price: QueryContext({
              region_id: region.region_id,
              currency_code: region.currency_code,
            }),
          },
        },
      },
    });
  }
  async listAllfeaturedProductsPositions(query) {
    return await query.graph({
      entity: "featured_product",
      fields: ["id", "product.*"],
      order: { position: "ASC" },
    });
  }
}

export default FeaturedProductsService;
