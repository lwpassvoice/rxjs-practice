import { BehaviorSubject, Observable, catchError, from, of, retry, switchMap, tap, throwError } from "rxjs";
import { ajax } from "rxjs/ajax";

interface RequestOptions {
  retryCount?: number;
}

const loginSubject = new BehaviorSubject<Observable<string>>(null);
const LOGIN_URL = 'https://example.com/login';
const REQUEST_URL = 'https://example.com/request';

function mockLogin() {
  const req$ = request(LOGIN_URL);
  // .pipe(
  //   tap((val) => console.log('mockLogin: ' + val)),
  //   retry(3),
  // );
  loginSubject.next(req$);
  return req$;
}

function mockRequestFailed() {
  request(REQUEST_URL).pipe(
    // switchMap(() => throwError(() => 'error'))
  ).subscribe({
    next: (val) => {
      loginSubject.next(null);
      console.log('next: ' + val);
    },
    error: (err) => console.error('error: ' + err),
  });
}

function request(url: string, options: RequestOptions = { retryCount: 3 }): Observable<any> {
  const req$ = ajax.get(url);
  return req$.pipe(
    tap({
      next: (val) => console.log('tap next: ' + val),
      error: (err) => console.error('tap error: ' + err),
    }),
    catchError((err, caught) => {
      // const retry$ = new Observable();
      // const sub = loginSubject.subscribe((token) => {

      // })
      const relogin$ = mockLogin();
      // loginSubject.next(relogin$);
      console.log('catchError');
      return caught.pipe(
        tap(() => console.log('of tap')),
        switchMap(() => {
          console.log('loginSubject', loginSubject.getValue());
          return loginSubject.getValue() ? loginSubject : relogin$;
        })
      )
      // return relogin$;
    })
  );
}

mockRequestFailed();
