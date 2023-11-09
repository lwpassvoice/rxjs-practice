export function isFunction(value) {
    return typeof value === 'function';
}
function noop() { }
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
export function map(project) {
    return (observable) => new Observable((subscriber) => {
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
export function createSafeObserver(observerOrNext, error, complete) {
    let observer;
    if (observerOrNext instanceof Observer || observerOrNext instanceof Subject) {
        observer = observerOrNext;
    }
    else if (typeof observerOrNext === "function") {
        observer = new Observer(observerOrNext, error, complete);
    }
    else {
        observer = new Observer(observerOrNext.next, observerOrNext.error, observerOrNext.complete);
    }
    return observer;
}
export class Subscription {
    constructor(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this._teardowns = [];
    }
    unsubscribe() {
        this._teardowns.forEach((teardown) => {
            if (isFunction(teardown)) {
                teardown();
            }
            else if (teardown && teardown.unsubscribe) {
                teardown.unsubscribe();
            }
        });
    }
    add(teardown) {
        if (teardown) {
            this._teardowns.push(teardown);
        }
    }
}
export class Observer {
    constructor(next, error, complete) {
        this.isStopped = false;
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
        if (this.unsubscribeCb) {
            if (isFunction(this.unsubscribeCb)) {
                this.unsubscribeCb();
            }
        }
    }
}
export class Subscriber extends Subscription {
    constructor(observer) {
        super();
        this.isStopped = false;
        this.observer = observer;
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
export class Observable {
    _subscribe(_subscriber) {
        return;
    }
    constructor(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    subscribe(observerOrNext, // Partial<Observer<T>> | ((value: T) => void) | null,
    error, complete) {
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
    pipe(...operations) {
        return pipeFromArray(operations)(this);
    }
}
export class Subject extends Observable {
    constructor() {
        super(...arguments);
        this.observers = [];
        this.isStopped = false;
    }
    next(value) {
        if (this.isStopped) {
            return;
        }
        for (const observer of this.observers) {
            observer.next(value);
        }
    }
    error(err) {
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
    subscribe(observerOrNext, error, complete) {
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
    constructor(bufferSize = 1) {
        super();
        this.buffer = [];
        this.bufferSize = bufferSize;
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
