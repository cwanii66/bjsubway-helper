import path from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'
import VueMacros from 'unplugin-vue-macros/vite'

const BAIDU_MAP_SUBWAY_SOURCE = 'https://api.map.baidu.com/api?type=subway&v=1.0&ak=aowd7kUD5soONt549QHZBGyLcZP7hVON'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    VueMacros({
      defineOptions: false,
      defineModels: false,
      plugins: {
        vue: Vue({
          script: {
            propsDestructure: true,
            defineModel: true,
          },
        }),
      },
    }),

    Pages(),

    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
      ],
      dts: true,
      dirs: [
        './src/composables',
      ],
      vueTemplate: true,
    }),

    Components({
      dts: true,
    }),

    UnoCSS(),
  ],

  server: {
    proxy: {
      '/baidu-map-subway': {
        target: BAIDU_MAP_SUBWAY_SOURCE,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/baidu-map-subway/, ''),
      }
    }
  }
})
