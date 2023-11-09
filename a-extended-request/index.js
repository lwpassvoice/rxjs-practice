import { ajax } from 'rxjs/ajax';
import { debounceTime, distinctUntilChanged, map, retryWhen, shareReplay, startWith, switchMap, tap, throttleTime } from 'rxjs/operators';
import { fromEvent, interval, merge, of } from 'rxjs';

export function createRequest(url, options) {
  const { auto = true, manual = false, poll = false, debounce = 0, throttle = 0, focus = false, retry = 0, loadingDelay = 0, swr = false, cache = false } = options || {};

  const request$ = ajax(url).pipe(
    map((res) => res.response),
    retryWhen((errors) => errors.pipe(
      tap((error) => console.error(error)),
      switchMap(() => interval(retry * 1000)),
    )),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  let requestTrigger$ = of(null);

  if (auto) {
    requestTrigger$ = requestTrigger$.pipe(
      startWith(null),
      switchMap(() => request$),
    );
  }

  if (manual) {
    requestTrigger$ = requestTrigger$.pipe(
      switchMap(() => fromEvent(document, 'click').pipe(
        map(() => request$),
      )),
    );
  }

  if (poll) {
    requestTrigger$ = requestTrigger$.pipe(
      switchMap(() => interval(poll * 1000).pipe(
        startWith(null),
        switchMap(() => request$),
      )),
    );
  }

  if (debounce > 0) {
    requestTrigger$ = requestTrigger$.pipe(
      debounceTime(debounce),
      switchMap(() => request$),
    );
  }

  if (throttle > 0) {
    requestTrigger$ = requestTrigger$.pipe(
      throttleTime(throttle),
      switchMap(() => request$),
    );
  }

  if (focus) {
    requestTrigger$ = requestTrigger$.pipe(
      switchMap(() => merge(
        of(null),
        fromEvent(window, 'focus'),
      ).pipe(
        switchMap(() => request$),
      )),
    );
  }

  if (loadingDelay > 0) {
    requestTrigger$ = requestTrigger$.pipe(
      tap(() => {
        setTimeout(() => {
          console.log('loading delay');
        }, loadingDelay * 1000);
      }),
    );
  }

  if (swr) {
    requestTrigger$ = requestTrigger$.pipe(
      switchMap(() => merge(
        request$,
        interval(swr * 1000).pipe(
          startWith(null),
          switchMap(() => request$),
        ),
      )),
    );
  }

  if (cache) {
    requestTrigger$ = requestTrigger$.pipe(
      switchMap(() => request$.pipe(
        startWith(null),
        distinctUntilChanged(),
      )),
    );
  }

  return requestTrigger$;
}


