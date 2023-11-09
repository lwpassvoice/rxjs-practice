import { Observable, Subscriber, map } from "./index.js";

export function filter<T>(predicate: (value: T) => boolean) {
  return function filterOperationFunction(source: Observable<T>): Observable<T> {
    return new Observable((subscriber: Subscriber<T>) => {
      const subscription = source.subscribe({
        next(value: T) {
          if (predicate(value)) {
            subscriber.next(value);
          }
        },
        error(err: any) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      });
      return subscription;
    });    
  }
}


export function first<T>(predicate?: (value: T) => boolean) {
  return function firstOperationFunction(source: Observable<T>): Observable<T> {
    return new Observable((subscriber: Subscriber<T>) => {
      const subscription = source.subscribe({
        next(value: T) {
          if (!predicate || predicate(value)) {
            subscriber.next(value);
            subscriber.complete();
            subscription.unsubscribe();
          }
        },
        error(err: any) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      });
      return subscription;
    });    
  }
}

export function take<T>(count: number) {
  return function takeOperatorFunction(source: Observable<T>): Observable<T> {
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
              } else {
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

export function createOperatorSubscriber<T>(source: Observable<T>, observer: any, next: (value: T) => void) {
  return source.subscribe({
    next(value) {
      try {
        next(value);
      } catch (err) {
        observer.error(err);
      }
    },
    error(err) { observer.error(err); },
    complete() { observer.complete(); }
  });
}

