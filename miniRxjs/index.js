/**
 * miniRxjs 使用方法
  const source = new Observable((observer) => {
    let i = 0;
    const timer = setInterval(() => {
        observer.next(++i);
    }, 1000);
    return function unsubscribe() {
        clearInterval(timer);
    };
  });
  const subscription = source.pipe(
    map((i) => ++i),
    map((i) => i * 10)
  ).subscribe({
    next: (v) => console.log(v),
    error: (err) => console.error(err),
    complete: () => console.log('complete'),
  });

  setTimeout(() => {
    subscription.unsubscribe();
  }, 4500);
 */

function createSafeObserver(observerOrNext, error, complete) {
  let observer;
  if (
    observerOrNext instanceof Observer ||
    observerOrNext instanceof Subject
  ) {
    observer = observerOrNext;
  } else if (typeof observerOrNext === "function") {
    observer = new Observer(observerOrNext, error, complete);
  } else {
    observer = new Observer(
      observerOrNext.next,
      observerOrNext.error,
      observerOrNext.complete
    );
  }
  return observer;
}

class Subscription {
  constructor() {
    this._teardowns = [];
  }
  unsubscribe() {
    this._teardowns.forEach((teardown) => {
      typeof teardown === "function" ? teardown() : teardown.unsubscribe();
    });
  }
  add(teardown) {
    if (teardown) {
      this._teardowns.push(teardown);
    }
  }
}

class Observer {
  isStopped = false;
  unsubscribeCb;
  constructor(next, error, complete) {
    this._next = next || noop;
    this._error = error || noop;
    this._complete = complete || noop;
  }
  next(value) {
    if (!this.isStopped) {
      this._next(value);
    }
  }
  error(err) {
    if (!this.isStopped) {
      this._error(err);
      this.unsubscribe();
    }
  }
  complete() {
    if (!this.isStopped) {
      this._complete();
      this.unsubscribe();
    }
  }
  onUnsubscribe(unsubscribeCb) {
    this.unsubscribeCb = unsubscribeCb;
  }
  unsubscribe() {
    this.isStopped = true;
    this.unsubscribeCb && this.unsubscribeCb();
  }
}

class Subscriber extends Subscription {
  constructor(observer) {
    super();
    this.observer = observer;
    this.isStopped = false;
  }
  next(value) {
    if (this.observer.next && !this.isStopped) {
      this.observer.next(value);
    }
  }
  error(value) {
    this.isStopped = true;
    if (this.observer.error) {
      this.observer.error(value);
    }
  }
  complete() {
    this.isStopped = true;
    if (this.observer.complete) {
      this.observer.complete();
    }
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

class Observable {
  constructor(publishFn) {
    if (publishFn) {
      this.publish = publishFn;
    }
  }

  subscribe(observerOrNext, error, complete) {
    // 封装observer
    const observer = createSafeObserver(observerOrNext, error, complete);

    // 传递unsubscribe回调清理函数
    const unsubscribeCb = this.publish(observer);
    observer.onUnsubscribe(unsubscribeCb);
    return observer;
  }

  pipe(...operations) {
    return pipeFromArray(operations)(this);
  }
}

class Subject extends Observable {
  subscribers = [];
  isStopped = false;
  constructor() {
    super();
  }

  publish(observer) {
    if (this.isStopped) {
      observer.complete();
    }
    // 添加订阅item
    this.subscribers.push(observer);
  }

  next(value) {
    if (this.isStopped) return;
    // 分发数据
    this.subscribers.forEach((observer) => {
      observer.next(value);
    });
  }

  error(error) {
    this.subscribers.forEach((observer) => {
      observer.error(error);
    });
    this.isStopped = true;
    this.subscribers = [];
  }

  complete() {
    this.subscribers.forEach((observer) => {
      observer.complete();
    });
    this.isStopped = true;
    this.subscribers = [];
  }
}

function noop() {}

function pipeFromArray(fns) {
  if (fns.length === 0) {
    return (x) => x;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return (input) => {
    return fns.reduce((prev, fn) => fn(prev), input);
  };
}

function map(project) {
  return (observable) =>
    new Observable((subscriber) => {
      const subcription = observable.subscribe({
        next(value) {
          return subscriber.next(project(value));
        },
        error(err) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      });
      return subcription;
    });
}

class ReplaySubject extends Subject {
  constructor(bufferSize = 1) {
    super();
    this.bufferSize = bufferSize;
    this.buffer = [];
  }

  next(value) {
    if (this.buffer.length >= this.bufferSize) {
      this.buffer.shift();
    }
    this.buffer.push(value);
    super.next(value);
  }

  subscribe(observerOrNext, error, complete) {
    const subscription = super.subscribe(observerOrNext, error, complete);
    const observer = createSafeObserver(observerOrNext, error, complete);
    this.buffer.forEach((value) => observer.next(value));
    return subscription;
  }
}

module.exports = {
  Subscription,
  Subscriber,
  Observable,
  Subject,
  ReplaySubject,
  map,
};





