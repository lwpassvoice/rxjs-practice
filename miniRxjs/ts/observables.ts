
export type ObserverOrNext =
  | Observer
  | Subject
  | Function
  | { next?: Function; error?: Function; complete?: Function };

export interface Unsubscribable {
  unsubscribe(): void;
}

export type TeardownLogic = Subscription | Unsubscribable | (() => void) | void;

export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}

function noop() {}

function pipeFromArray(fns: Function[]) {
  if (fns.length === 0) {
    return (x: any) => x;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return (input: any) => {
    return fns.reduce((prev, fn) => fn(prev), input);
  };
}

export function map(project: Function) {
  return (observable: Observable) =>
    new Observable((subscriber: Subscriber) => {
      const subcription = observable.subscribe({
        next(value: any) {
          return subscriber.next(project(value));
        },
        error(err: any) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      });
      return subcription;
    });
}

export function createSafeObserver(
  observerOrNext: ObserverOrNext,
  error?: Function,
  complete?: Function
): Observer {
  let observer: Observer;
  if (observerOrNext instanceof Observer || observerOrNext instanceof Subject) {
    observer = observerOrNext as Observer;
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

export class Subscription {
  private _teardowns: TeardownLogic[] = [];
  constructor(private initialTeardown?: () => void) {}

  unsubscribe() {
    this._teardowns.forEach((teardown) => {
      if (isFunction(teardown)) {
        teardown();
      } else if (teardown && teardown.unsubscribe) {
        teardown.unsubscribe();
      }
    });
  }

  add(teardown: TeardownLogic) {
    if (teardown) {
      this._teardowns.push(teardown);
    }
  }
}

export class Observer<T = any> {
  private isStopped = false;
  unsubscribeCb?: TeardownLogic;
  private _next: Function;
  private _error: Function;
  private _complete: Function;
  constructor(next?: Function, error?: Function, complete?: Function) {
    this._next = next || noop;
    this._error = error || noop;
    this._complete = complete || noop;
  }
  next(value: any) {
    if (!this.isStopped) {
      this._next(value);
    }
  }
  error(err: any) {
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
  onUnsubscribe(unsubscribeCb: TeardownLogic) {
    this.unsubscribeCb = unsubscribeCb;
  }
  unsubscribe() {
    this.isStopped = true;
    if (this.unsubscribeCb) {
      if (isFunction(this.unsubscribeCb)) {
        this.unsubscribeCb();
      }
    }
  }
}

export class Subscriber<T = any> extends Subscription {
  private observer: Observer;
  public isStopped = false;
  constructor(observer: Observer) {
    super();
    this.observer = observer;
  }
  next(value: any) {
    if (this.observer.next && !this.isStopped) {
      this.observer.next(value);
    }
  }
  error(value: any) {
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

export class Observable<T = any> {
  protected _subscribe(_subscriber: Subscriber<any>): TeardownLogic {
    return;
  }

  constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  subscribe(
    observerOrNext?: ObserverOrNext, // Partial<Observer<T>> | ((value: T) => void) | null,
    error?: Function,
    complete?: Function
  ): Observer {
    if (observerOrNext) {
      const observer = createSafeObserver(observerOrNext, error, complete);
      const subscriber = new Subscriber(observer);
      // 传递unsubscribe回调清理函数
      const unsubscribeCb = this._subscribe(subscriber);
      observer.onUnsubscribe(unsubscribeCb);
      return observer;
    }
    return new Observer();
  }

  pipe(...operations: Function[]): Observable<any> {
    return pipeFromArray(operations)(this);
  }
}

export class Subject extends Observable {
  private observers: Observer[] = [];
  private isStopped = false;

  next(value: any) {
    if (this.isStopped) {
      return;
    }
    for (const observer of this.observers) {
      observer.next(value);
    }
  }

  error(err: any) {
    if (this.isStopped) {
      return;
    }
    for (const observer of this.observers) {
      observer.error(err);
    }
    this.observers = [];
    this.isStopped = true;
  }

  complete() {
    if (this.isStopped) {
      return;
    }
    for (const observer of this.observers) {
      observer.complete();
    }
    this.observers = [];
    this.isStopped = true;
  }

  subscribe(observerOrNext?: ObserverOrNext, error?: Function, complete?: Function): Observer {
    const observer = createSafeObserver(observerOrNext, error, complete);
    if (this.isStopped) {
      observer.complete();
      return;
    }
    this.observers.push(observer);
    return observer;
  }
}

export class ReplaySubject extends Subject {
  private bufferSize: number;
  private buffer: any[] = [];
  constructor(bufferSize = 1) {
    super();
    this.bufferSize = bufferSize;
  }

  next(value: any) {
    if (this.buffer.length >= this.bufferSize) {
      this.buffer.shift();
    }
    this.buffer.push(value);
    super.next(value);
  }

  subscribe(
    observerOrNext: ObserverOrNext,
    error?: Function,
    complete?: Function
  ): Observer {
    const subscription = super.subscribe(observerOrNext, error, complete);
    const observer = createSafeObserver(observerOrNext, error, complete);
    this.buffer.forEach((value) => observer.next(value));
    return subscription;
  }
}
