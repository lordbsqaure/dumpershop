import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { FEATURED_PRODUCTS_MODULE } from "../../../modules/featured-products";
import FeaturedProductsService from "../../../modules/featured-products/service";
import { logger } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");
  const featuredProductsService: FeaturedProductsService = req.scope.resolve(
    FEATURED_PRODUCTS_MODULE,
  );
  const { currency_code, region_id } = req.query as {
    currency_code?: string;
    region_id?: string;
  };
  logger.info(currency_code as string);
  const { data } =
    currency_code && region_id
      ? await featuredProductsService.listFeaturedProductsWithProductsWithPrice(
          query,
          {
            currency_code,
            region_id,
          },
        )
      : await featuredProductsService.listFeaturedProductsWithProducts(query);

  res.json({ featured_products: data });
};
