declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

/** baidu subway */
declare global {
  interface Window {
    BMapSub: any
  }
}
declare const BMapSub: any
declare const baidu: any
declare const BMAPSUB_ANCHOR_BOTTOM_RIGHT: string
