const DISPATCH_DELAY_TIME_MS = 50

interface QueuedLog {
  time: number
  count: number
  run: () => void
}

const queue: QueuedLog[] = []

export const dispatchLog = (log: QueuedLog) => {
  addToOrderedQueue(log)
  setTimeout(() => {
    // Log everything until the current log in order
    while (queue.length && queue[0].time <= log.time)
      queue.shift()!.run()
  }, DISPATCH_DELAY_TIME_MS)
}

function addToOrderedQueue(log: QueuedLog) {
  const i = queue.findIndex((l) => {
    return l.time > log.time || (l.time === log.time && l.count > log.count)
  })
  if (i === -1)
    queue.push(log)
  else
    queue.splice(i, 0, log)
}
