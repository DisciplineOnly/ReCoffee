/**
 * Barrel for the admin dashboard, existing purely to shape the bundle.
 *
 * App.jsx lazy-imports every admin route through this one module, so the
 * bundler emits a single `admin` chunk instead of one per route. Importing the
 * routes individually cost twelve chunks and made entering /admin/orders a
 * three-deep request waterfall — ProtectedRoute, then AdminLayout, then the
 * page — because each only starts loading once its parent has rendered.
 *
 * Do not import this from anything on the public side. It is reached only
 * through the dynamic imports in App.jsx; a static import from a public module
 * would pull the whole dashboard back into the bundle shop visitors download,
 * which is the thing this file exists to prevent.
 *
 * The gate and the layout live under components/admin but belong to the same
 * chunk, so they are re-exported here too.
 */

export { default as ProtectedRoute } from '../../components/admin/ProtectedRoute';
export { default as AdminLayout } from '../../components/admin/AdminLayout';

export { default as AdminLogin } from './Login';
export { default as AdminOrders } from './Orders';
export { default as ProductList } from './Products';
export { default as ProductForm } from './ProductForm';
export { default as ServiceList } from './Services';
export { default as ServiceForm } from './ServiceForm';
export { default as AdminInquiries } from './Inquiries';
export { default as AdminReviews } from './Reviews';
