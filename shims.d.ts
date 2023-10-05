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
