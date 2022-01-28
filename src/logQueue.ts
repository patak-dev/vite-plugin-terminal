interface QueuedLog {
  priority: number
  dispatchFunction: () => void
}

let queue: QueuedLog[] = []
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

const restartQueue = () => {
  queue = []
  lastDispatched = 0
}

export { dispatchLog, restartQueue }
