import { Observable, Subject, interval, timer } from 'rxjs';
import { buffer, bufferCount, concatMap, debounceTime, delay, delayWhen, map, mapTo, retry, retryWhen, scan, switchMap, tap } from 'rxjs/operators';

const itv$ = interval(1000);

export function retryAfterExponentialDelay<T>(times: number = Infinity) {
  return (obs$: Observable<T>) => {
    return obs$.pipe(
      retryWhen((err) => {
        return err.pipe(
          scan((acc, val) => {
            if (acc > times) throw val;
            return acc + 1;
          }, 1),
          delayWhen((n) => timer(n ** 2 * 1000))
        )
      })
    )    
  }
}

const rty$ = itv$.pipe(
  concatMap((v, idx) => {
    return new Observable((sub) => {
      if (idx === 2 && Math.random() > 0.5) {
        sub.error('emit an error');
      }
      sub.next(v);
      sub.complete();
    });
  }),
  retryAfterExponentialDelay(2)
)

// rty$.subscribe((v) => {
//   console.log('subscribe ', v);
// }, (e) => {
//   console.error(e);
// });
