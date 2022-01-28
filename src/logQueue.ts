interface QueuedLog {
  priority: number
  dispatchFunction: () => void
}

const queue: QueuedLog[] = []
let lastDispatched = 0

const dispatchLog = ({ priority, dispatchFunction }: QueuedLog) => {
  queue.push({ priority, dispatchFunction })
  queue.sort((first, second) => first.priority - second.priority)
  while (queue[0] && queue[0].priority === lastDispatched) {
    const dispatchFunction = queue.shift()?.dispatchFunction
    if (dispatchFunction)
      dispatchFunction()
    lastDispatched++
  }
}

export { dispatchLog }
