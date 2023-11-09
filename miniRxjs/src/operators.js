import { Observable } from "./index.js";
export function filter(predicate) {
    return function filterOperationFunction(source) {
        return new Observable((subscriber) => {
            const subscription = source.subscribe({
                next(value) {
                    if (predicate(value)) {
                        subscriber.next(value);
                    }
                },
                error(err) {
                    subscriber.error(err);
                },
                complete() {
                    subscriber.complete();
                },
            });
            return subscription;
        });
    };
}
export function first(predicate) {
    return function firstOperationFunction(source) {
        return new Observable((subscriber) => {
            const subscription = source.subscribe({
                next(value) {
                    if (!predicate || predicate(value)) {
                        subscriber.next(value);
                        subscriber.complete();
                        subscription.unsubscribe();
                    }
                },
                error(err) {
                    subscriber.error(err);
                },
                complete() {
                    subscriber.complete();
                },
            });
            return subscription;
        });
    };
}
export function take(count) {
    return function takeOperatorFunction(source) {
        return new Observable((observer) => {
            if (count <= 0) {
                observer.complete();
                return;
            }
            let taken = 0;
            let needToUnsubscribe = false;
            let subscription;
            subscription = source.subscribe({
                next(value) {
                    if (taken++ < count) {
                        observer.next(value);
                        if (taken === count) {
                            observer.complete();
                            if (subscription) {
                                subscription.unsubscribe();
                            }
                            else {
                                needToUnsubscribe = true;
                            }
                        }
                    }
                },
                error(err) { observer.error(err); },
                complete() { observer.complete(); }
            });
            if (needToUnsubscribe && subscription) {
                subscription.unsubscribe();
            }
            // const subscription = createOperatorSubscriber(source, observer, (value) => {
            //   if (++taken < count) {
            //     observer.next(value);
            //   } else {
            //     subscription.unsubscribe();
            //     observer.next(value);
            //     observer.complete();
            //   }
            // });
            // source.subscribe(subscription);
        });
    };
}
export function createOperatorSubscriber(source, observer, next) {
    return source.subscribe({
        next(value) {
            try {
                next(value);
            }
            catch (err) {
                observer.error(err);
            }
        },
        error(err) { observer.error(err); },
        complete() { observer.complete(); }
    });
}
