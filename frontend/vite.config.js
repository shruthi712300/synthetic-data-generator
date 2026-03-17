// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/react-static/',          // <-- Correct: at root level
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/login': 'http://localhost:5000'
    }
  }
})
