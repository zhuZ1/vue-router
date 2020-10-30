/* @flow */
// 经典的异步函数队列化执行模式
export function runQueue (queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
  // queue是一个 NavigationGuard类型的数组
  const step = index => {
    if (index >= queue.length) {
      cb()
    } else { // 每次根据index从 queue中取出一个 guard
      if (queue[index]) {
        fn(queue[index], () => {
          step(index + 1)
        })
      } else {
        step(index + 1)
      }
    }
  }
  step(0)
}
