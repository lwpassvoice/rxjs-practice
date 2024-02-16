import { BehaviorSubject, Observable, catchError, from, of, retry, switchMap, tap, throwError } from "rxjs";
import { ajax } from "rxjs/ajax";

interface RequestOptions {
  retryCount?: number;
}

const loginSubject = new BehaviorSubject<Observable<string> | null>(null);
const LOGIN_URL = 'https://example.com/login';
const REQUEST_URL = 'https://example.com/request';

let retryLoginCount = 0; // 用于跟踪重试登录的次数

function mockLogin() {
  // 检查是否已有登录请求正在进行
  if (loginSubject.getValue() !== null) {
    console.log('Login already in progress. Waiting for current login to complete.');
    return loginSubject.getValue();
  }

  console.log('Starting new login attempt.');
  const req$ = request(LOGIN_URL).pipe(
    tap((val) => console.log('mockLogin: ' + val)),
    retry(3),
  );
  loginSubject.next(req$);
  req$.subscribe({
    complete: () => {
      // 登录完成后，重置loginSubject以允许新的登录尝试
      loginSubject.next(null);
    },
    error: () => {
      // 登录失败也应重置，以便进行新的尝试
      loginSubject.next(null);
    }
  });
  return req$;
}

function mockRequestFailed() {
  request(REQUEST_URL).pipe(
    // switchMap(() => throwError(() => 'error'))
  ).subscribe({
    next: (val) => {
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
      if (retryLoginCount >= 3) {
        console.log('Max login attempts reached, not retrying.');
        return throwError(() => 'Max login attempts reached.');
      } else {
        retryLoginCount++; // 递增重试计数器
        console.log('Attempting to re-login, attempt number: ', retryLoginCount);
        return mockLogin().pipe(
          switchMap(() => {
            // 重置重试计数器，以便下次失败时可以再次尝试
            retryLoginCount = 0;
            return of('Logged in successfully after retry');
          })
        );
      }
    })
  );
}

mockRequestFailed();