import React from "react";
import { Star } from "@medusajs/icons";
import { Button, toast } from "@medusajs/ui";
import { sdk } from "../lib/sdk";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";

const FeaturedProductToggle: React.FC<DetailWidgetProps<AdminProduct>> = ({
  data: product,
}) => {
  const queryClient = useQueryClient();
  const productId = product.id;
  // Fetch featured products data
  const { data: queryResult } = useQuery({
    queryFn: () => sdk.client.fetch("/admin/featured-products"),
    queryKey: [["featured-products"]],
  });

  const isFeatured =
    (queryResult as any)?.featured_products?.some(
      (fp: any) => fp.product?.id === productId,
    ) || false;

  const linkMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/featured-products/link-product", {
        method: "POST",
        body: { product_id: productId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["featured-products"]] });
      toast.success("Product added to featured products");
    },
    onError: () => {
      toast.error("Failed to add product to featured products");
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/featured-products/unlink-product", {
        method: "POST",
        body: { product_id: productId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["featured-products"]] });
      toast.success("Product removed from featured products");
    },
    onError: () => {
      toast.error("Failed to remove product from featured products");
    },
  });

  const handleToggle = () => {
    if (isFeatured) {
      unlinkMutation.mutate();
    } else {
      linkMutation.mutate();
    }
  };

  const isLoading = linkMutation.isPending || unlinkMutation.isPending;

  return (
    <Button
      variant="transparent"
      size="small"
      onClick={handleToggle}
      disabled={isLoading}
      title={
        isFeatured
          ? "Remove from featured products"
          : "Add to featured products"
      }
    >
      <Star
        className={`w-5 h-5 ${
          isFeatured ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
        }`}
      />
    </Button>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.before",
});

export default FeaturedProductToggle;
