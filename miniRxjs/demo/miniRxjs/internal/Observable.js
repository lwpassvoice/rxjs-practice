import { Subscriber } from './Subscriber';
import { observable as Symbol_observable } from './symbol/observable';
import { pipeFromArray } from './util/pipe';
export class Observable {
    constructor(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    subscribe(observerOrNext) {
        const subscriber = observerOrNext instanceof Subscriber ? observerOrNext : new Subscriber(observerOrNext);
        subscriber.add(this._trySubscribe(subscriber));
        return subscriber;
    }
    _trySubscribe(sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.error(err);
        }
    }
    forEach(next) {
        return new Promise((resolve, reject) => {
            const subscriber = new Subscriber({
                next: (value) => {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscriber.unsubscribe();
                    }
                },
                error: reject,
                complete: resolve,
            });
            this.subscribe(subscriber);
        });
    }
    _subscribe(_subscriber) {
        return;
    }
    [Symbol_observable]() {
        return this;
    }
    pipe(...operations) {
        return pipeFromArray(operations)(this);
    }
}
