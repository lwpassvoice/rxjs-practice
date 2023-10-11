"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaySubject = exports.Subject = exports.Observable = exports.Subscriber = exports.Observer = exports.Subscription = exports.createSafeObserver = exports.map = exports.isFunction = void 0;
function isFunction(value) {
    return typeof value === 'function';
}
exports.isFunction = isFunction;
function noop() { }
function pipeFromArray(fns) {
    if (fns.length === 0) {
        return function (x) { return x; };
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function (input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}
function map(project) {
    return function (observable) {
        return new Observable(function (subscriber) {
            var subcription = observable.subscribe({
                next: function (value) {
                    return subscriber.next(project(value));
                },
                error: function (err) {
                    subscriber.error(err);
                },
                complete: function () {
                    subscriber.complete();
                },
            });
            return subcription;
        });
    };
}
exports.map = map;
function createSafeObserver(observerOrNext, error, complete) {
    var observer;
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
exports.createSafeObserver = createSafeObserver;
var Subscription = /** @class */ (function () {
    function Subscription(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this._teardowns = [];
    }
    Subscription.prototype.unsubscribe = function () {
        this._teardowns.forEach(function (teardown) {
            if (isFunction(teardown)) {
                teardown();
            }
            else if (teardown && teardown.unsubscribe) {
                teardown.unsubscribe();
            }
        });
    };
    Subscription.prototype.add = function (teardown) {
        if (teardown) {
            this._teardowns.push(teardown);
        }
    };
    return Subscription;
}());
exports.Subscription = Subscription;
var Observer = /** @class */ (function () {
    function Observer(next, error, complete) {
        this.isStopped = false;
        this._next = next || noop;
        this._error = error || noop;
        this._complete = complete || noop;
    }
    Observer.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    Observer.prototype.error = function (err) {
        if (!this.isStopped) {
            this._error(err);
            this.unsubscribe();
        }
    };
    Observer.prototype.complete = function () {
        if (!this.isStopped) {
            this._complete();
            this.unsubscribe();
        }
    };
    Observer.prototype.onUnsubscribe = function (unsubscribeCb) {
        this.unsubscribeCb = unsubscribeCb;
    };
    Observer.prototype.unsubscribe = function () {
        this.isStopped = true;
        if (this.unsubscribeCb) {
            if (isFunction(this.unsubscribeCb)) {
                this.unsubscribeCb();
            }
        }
    };
    return Observer;
}());
exports.Observer = Observer;
var Subscriber = /** @class */ (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(observer) {
        var _this = _super.call(this) || this;
        _this.isStopped = false;
        _this.observer = observer;
        return _this;
    }
    Subscriber.prototype.next = function (value) {
        if (this.observer.next && !this.isStopped) {
            this.observer.next(value);
        }
    };
    Subscriber.prototype.error = function (value) {
        this.isStopped = true;
        if (this.observer.error) {
            this.observer.error(value);
        }
    };
    Subscriber.prototype.complete = function () {
        this.isStopped = true;
        if (this.observer.complete) {
            this.observer.complete();
        }
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    };
    return Subscriber;
}(Subscription));
exports.Subscriber = Subscriber;
var Observable = /** @class */ (function () {
    function Observable(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype._subscribe = function (_subscriber) {
        return;
    };
    Observable.prototype.subscribe = function (observerOrNext, // Partial<Observer<T>> | ((value: T) => void) | null,
    error, complete) {
        if (observerOrNext) {
            var observer = createSafeObserver(observerOrNext, error, complete);
            var subscriber = new Subscriber(observer);
            // 传递unsubscribe回调清理函数
            var unsubscribeCb = this._subscribe(subscriber);
            observer.onUnsubscribe(unsubscribeCb);
            return observer;
        }
        return new Observer();
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        return pipeFromArray(operations)(this);
    };
    return Observable;
}());
exports.Observable = Observable;
var Subject = /** @class */ (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.subscribers = [];
        _this.isStopped = false;
        return _this;
    }
    Subject.prototype.publish = function (observer) {
        if (this.isStopped) {
            observer.complete();
        }
        // 添加订阅item
        this.subscribers.push(observer);
    };
    Subject.prototype.next = function (value) {
        if (this.isStopped)
            return;
        // 分发数据
        this.subscribers.forEach(function (observer) {
            observer.next(value);
        });
    };
    Subject.prototype.error = function (error) {
        this.subscribers.forEach(function (observer) {
            observer.error(error);
        });
        this.isStopped = true;
        this.subscribers = [];
    };
    Subject.prototype.complete = function () {
        this.subscribers.forEach(function (observer) {
            observer.complete();
        });
        this.isStopped = true;
        this.subscribers = [];
    };
    return Subject;
}(Observable));
exports.Subject = Subject;
var ReplaySubject = /** @class */ (function (_super) {
    __extends(ReplaySubject, _super);
    function ReplaySubject(bufferSize) {
        if (bufferSize === void 0) { bufferSize = 1; }
        var _this = _super.call(this) || this;
        _this.buffer = [];
        _this.bufferSize = bufferSize;
        return _this;
    }
    ReplaySubject.prototype.next = function (value) {
        if (this.buffer.length >= this.bufferSize) {
            this.buffer.shift();
        }
        this.buffer.push(value);
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype.subscribe = function (observerOrNext, error, complete) {
        var subscription = _super.prototype.subscribe.call(this, observerOrNext, error, complete);
        var observer = createSafeObserver(observerOrNext, error, complete);
        this.buffer.forEach(function (value) { return observer.next(value); });
        return subscription;
    };
    return ReplaySubject;
}(Subject));
exports.ReplaySubject = ReplaySubject;
