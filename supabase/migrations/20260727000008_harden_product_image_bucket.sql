-- ============================================================================
-- ReCoffee — constrain the public `products` storage bucket.
--
-- The bucket was created with `public = true` and nothing else: no
-- `allowed_mime_types`, no `file_size_limit`. Combined with an upload path that
-- took the file extension straight from the user's filename, an admin session —
-- or a stolen admin token — could put `.html` or `.svg` at a public URL on the
-- storage domain (stored XSS, on a different origin than the app but still
-- served under the project's name), or simply exhaust the storage quota.
--
-- `accept="image/*"` on the input is a picker hint, not a control. The client
-- checks added alongside this migration are for the error message; **these two
-- columns are the enforcement**, applied by the storage API regardless of what
-- the browser sends.
--
-- SVG is deliberately excluded from the allowlist. It is an image format that
-- can carry <script>, and these are product photos — nothing needs vectors.
--
-- Idempotent, like every file in this directory: re-running it is safe.
-- ============================================================================

update storage.buckets
set
  file_size_limit    = 5242880,   -- 5 MB; product photos are well under this
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
where id = 'products';
