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

    {
      name: 'vite-style-tag',
      enforce: 'pre',
      transformIndexHtml(html) {
        // match </head> and insert a <style> tag before it
        html = html.replace(
          /<\/head>/,
          `
          <style type="text/css">
            #bd-DetailInfo .detailInfoContent .detailList {
              position: relative;
            }
            #bd-DetailInfo .detailInfoContent .detailList .bd-lineTime {
              display: flex;
              width: 7.2rem;
              gap: 0.1rem;
              justify-content: space-between;
            }
            #bd-DetailInfo .detailInfoContent .detailList .firstTime {
              flex: 1;
            }
            #bd-DetailInfo .detailInfoContent .detailList .lastTime {
              flex: 1;
            }
          </style>$&
          `,
        )
        return html
      },
    },
  ],

  server: {
    proxy: {
      '/baidu-map-subway': {
        target: BAIDU_MAP_SUBWAY_SOURCE,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/baidu-map-subway/, ''),
      },
    },
  },
})
