import Vue, { PluginFunction } from 'vue'

declare const VueJsBridge:VueJsBridge
export default VueJsBridge
export interface VueJsBridge {
  install: PluginFunction<pluginOption>
  version: string
}

declare module "vue/types/vue" {
  export interface Vue {
    $bridge: VueJsBridgePlugin
  }
}

interface Bridge<P = any, R = any, Q = any> {
  registerHandler (name: string, fn: (request:Q) => void): void
  callHandler (nativeHandler: string, payload: P, callback:(response: R) => void): void
}

export interface pluginOption<P = any, R = any> {
  debug?: boolean
  delay?: number
  nativeHandlerName: string
  mock?: boolean
  mockHandler?: (payload: P, next:(response: R) => void) => void
}

export class VueJsBridgePlugin {
  constructor (options: pluginOption)
  private init (callback: (bridge: Bridge) => void)
  public registerHandler<D, P = any> (name: string, fn: (data:D, callback:(payload?:P) => void) => void): void
  public callHandler<P, R> (payload: P): Promise<R>
}

