import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base 指向 GitHub Pages 的项目子路径（仓库名 Observability0.1），
// 部署后静态资源才能按 /Observability0.1/ 正确解析。
export default defineConfig({
  base: '/Observability0.1/',
  plugins: [react()],
})
