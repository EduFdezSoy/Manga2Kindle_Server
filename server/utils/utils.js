exports.isInQueue = (status, queue) => {
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].chapter_id === status.chapter_id) {
      return true
    }
  }
  return false
}
