import { defineConfig, loadEnv } from 'vite'
import createVitePlugins from './vite/plugins'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [createVitePlugins(env, command === 'build')]
  }
})
