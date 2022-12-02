import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { antdDayjs } from 'antd-dayjs-vite-plugin'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import { createStyleImportPlugin as styleImport } from 'vite-plugin-style-import'

const packageJson = JSON.parse(
  readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'),
)

export default defineConfig({
  define: {
    __APP_NAME__: `"${packageJson.name}"`,
    __APP_VERSION__: `"${packageJson.version}"`,
  },
  plugins: [
    react(),
    antdDayjs(),
    unocss(),
    eslint({
      fix: true,
    }),
    styleImport({
      libs: [
        {
          libraryName: 'antd',
          esModule: true,
          resolveStyle: (name) => `antd/es/${name}/style/index`,
        },
        {
          libraryName: '@formily/antd',
          esModule: true,
          resolveStyle: (name) => `@formily/antd/esm/${name}/style`,
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~antd/': 'antd/', // fix @ant-design/pro-layout
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
})
