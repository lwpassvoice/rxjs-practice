import { Observable } from './Observable';
import { Subscription } from './Subscription';
export class Subject extends Observable {
    get closed() {
        return this._closed;
    }
    get observers() {
        var _a;
        return ((_a = this.observerSnapshot) !== null && _a !== void 0 ? _a : (this.observerSnapshot = Array.from(this.currentObservers.values())));
    }
    constructor() {
        super();
        this._closed = false;
        this._observerCounter = 0;
        this.currentObservers = new Map();
        this.hasError = false;
        this.thrownError = null;
    }
    _clearObservers() {
        this.currentObservers.clear();
        this.observerSnapshot = undefined;
    }
    next(value) {
        if (!this._closed) {
            const { observers } = this;
            const len = observers.length;
            for (let i = 0; i < len; i++) {
                observers[i].next(value);
            }
        }
    }
    error(err) {
        if (!this._closed) {
            this.hasError = this._closed = true;
            this.thrownError = err;
            const { observers } = this;
            const len = observers.length;
            for (let i = 0; i < len; i++) {
                observers[i].error(err);
            }
            this._clearObservers();
        }
    }
    complete() {
        if (!this._closed) {
            this._closed = true;
            const { observers } = this;
            const len = observers.length;
            for (let i = 0; i < len; i++) {
                observers[i].complete();
            }
            this._clearObservers();
        }
    }
    unsubscribe() {
        this._closed = true;
        this._clearObservers();
    }
    get observed() {
        return this.currentObservers.size > 0;
    }
    _subscribe(subscriber) {
        this._checkFinalizedStatuses(subscriber);
        return this._innerSubscribe(subscriber);
    }
    _innerSubscribe(subscriber) {
        if (this.hasError || this._closed) {
            return Subscription.EMPTY;
        }
        const { currentObservers } = this;
        const observerId = this._observerCounter++;
        currentObservers.set(observerId, subscriber);
        this.observerSnapshot = undefined;
        subscriber.add(() => {
            currentObservers.delete(observerId);
            this.observerSnapshot = undefined;
        });
        return subscriber;
    }
    _checkFinalizedStatuses(subscriber) {
        const { hasError, thrownError, _closed } = this;
        if (hasError) {
            subscriber.error(thrownError);
        }
        else if (_closed) {
            subscriber.complete();
        }
    }
    asObservable() {
        return new Observable((subscriber) => this.subscribe(subscriber));
    }
}
Subject.create = (destination, source) => {
    return new AnonymousSubject(destination, source);
};
export class AnonymousSubject extends Subject {
    constructor(destination, _source) {
        super();
        this.destination = destination;
        this._source = _source;
    }
    next(value) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
    }
    error(err) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    }
    complete() {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    _subscribe(subscriber) {
        var _a, _b;
        return (_b = (_a = this._source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : Subscription.EMPTY;
    }
}
