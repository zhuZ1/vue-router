import View from './components/view'
import Link from './components/link'

export let _Vue
// 当用户执行 Vue.use(Router) 的时候实际上就是在执行 install方法
export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true
 // 为了确保install逻辑只执行一次，用了install.installed做了标志位
  _Vue = Vue
// 用全局的 _Vue来接收参数 Vue，因为插件对 Vue是有依赖的
  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    // 将beforeCreate 和 destroyed钩子函数注入到每一个组件中
    // 每个组件在执行 beforeCreate钩子函数的时候都会执行init 方法
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this // 根 Vue实例
        this._router = this.$options.router // 实例 router
        this._router.init(this) // 初始化router
        Vue.util.defineReactive(this, '_route', this._router.history.current) // 将this._route转换成 响应式对象
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })
// 定义了 $router 和 $route的get方法，这就是为什么我们可以访问到 this.$router 和 this.$route
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })
// 定义了全局的 RouteView 和 RouterLink组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
