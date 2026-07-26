import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Windows raises EBUSY when another process (indexer, image preview, sync
      // client) holds a lock on a file the watcher opens, and the resulting
      // FSWatcher 'error' event kills the whole dev server. These are static
      // product images that never change during a dev session, so there is
      // nothing to gain from watching them.
      ignored: ['**/public/products/**'],
    },
  },
})
