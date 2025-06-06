export class WorkerWrapper {
  constructor(worker) {
    this.worker = worker;
    this.promises = {};
    this.currentId = 0;

    this.worker.onmessage = (e) => {
      const { id, ...data } = e.data;
      if (this.promises[id]) {
        this.promises[id](data);
        delete this.promises[id];
      }
    };
  }

  postMessage(message) {
    const id = ++this.currentId;
    this.worker.postMessage({ ...message, id });
    return new Promise((resolve) => {
      this.promises[id] = resolve;
    });
  }

  terminate() {
    this.worker.terminate();
  }
}

export function createApiWorker() {
  if (typeof window !== 'undefined') {
    const worker = new Worker(new URL('../workers/api.worker.js', import.meta.url));
    return new WorkerWrapper(worker);
  }
  return null;
}