interface QueuedLog {
  priority: number
  queueOrder: number
  dispatchFunction: () => void
}

const queue: QueuedLog[] = []
let lastDispatched = Number.MAX_SAFE_INTEGER

const dispatchLog = ({ priority, queueOrder, dispatchFunction }: QueuedLog) => {
  queue.push({ priority, queueOrder, dispatchFunction })
  queue.sort((first, second) => {
    if (first.priority !== second.priority)
      return first.priority - second.priority
    else
      return first.queueOrder - second.queueOrder
  })
  if (priority < lastDispatched) {
    setTimeout(() => {
      while (queue[0] && queue[0].priority < lastDispatched) {
        const dispatchFunction = queue.shift()?.dispatchFunction
        if (dispatchFunction)
          dispatchFunction()
      }
    }, 50)
  }
  lastDispatched++
}

export { dispatchLog }
