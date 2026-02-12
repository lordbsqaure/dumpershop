// Featured Product Toggle Widget for Admin Dashboard
//
// To integrate this widget into the products list:
// 1. Add this widget to your admin extension configuration
// 2. Place it in the "product.list.after" zone
// 3. Pass the product ID as a prop
//
// Example integration:
// ```tsx
// <FeaturedProductToggle productId={product.id} />
// ```
//
// The component handles:
// - Checking if a product is featured
// - Toggling featured status with API calls
// - Showing appropriate star icon (filled for featured, outline for not)
// - User feedback via toasts
