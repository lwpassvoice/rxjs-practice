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

export * from './operators.js';
// { Observable, Observer, ObserverOrNext, ReplaySubject, Subject, Subscriber, Subscription }
export * from './observables.js';