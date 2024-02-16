import { BehaviorSubject, Observable, catchError, from, of, retry, switchMap, tap, throwError } from "rxjs";
import { AjaxConfig, AjaxResponse, ajax } from "rxjs/ajax";

// interface RequestOptions extends AjaxConfig {
//   retryCount?: number;
// }

type RequestOptions = AjaxConfig & { retryCount?: number };

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const loginSubject = new BehaviorSubject<Observable<AjaxResponse<Tokens>> | null>(null);
const LOGIN_URL = 'https://example.com/login';
const REQUEST_URL = 'https://example.com/request';
const GET_TOKEN_URL = 'https://example.com/getToken';
const REFRESH_TOKEN_URL = 'https://example.com/refreshToken';

let retryLoginCount = 0; // 用于跟踪重试登录的次数

function mockGetToken(): Observable<AjaxResponse<Tokens>> {
  return request<Tokens>(GET_TOKEN_URL);
}

function mockRefreshToken(): Observable<AjaxResponse<Tokens>> {
  return request<Tokens>(REFRESH_TOKEN_URL);
}

function mockLogin(): Observable<AjaxResponse<Tokens>> {
  // 检查是否已有登录请求正在进行
  if (loginSubject.getValue() !== null) {
    console.log('Login already in progress. Waiting for current login to complete.');
    return loginSubject.getValue()!;
  }

  console.log('Starting new login attempt.');
  const req$ = request<Tokens>(LOGIN_URL);
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

function request<T = any>(
  urlOrOptions: string | RequestOptions,
): Observable<AjaxResponse<T>> {
  // const req$ = ajax(urlOrOptions);
  let req$: Observable<AjaxResponse<T>>;
  if (typeof urlOrOptions === 'string') {
    req$ = ajax.get(urlOrOptions);
  } else {
    const method = String.prototype.toLowerCase.call(urlOrOptions.method) || 'get';
    switch (method) {
      case 'get': {
        // req$ = 
        break;
      }
      // get
      // post
      // delete
      // put
      // patch
      // getJSON
    }
  }

  return req$.pipe(
    tap({
      next: (val) => console.log("tap next: " + val),
      error: (err) => console.error("tap error: " + err),
    }),
    catchError((err, caught) => {
      if (retryLoginCount >= options.retryCount!) {
        console.log("Max login attempts reached, not retrying.");
        return throwError(() => "Max login attempts reached.");
      } else {
        retryLoginCount++; // 递增重试计数器
        console.log(
          "Attempting to re-login, attempt number: ",
          retryLoginCount
        );
        return mockLogin().pipe(
          switchMap((v) => {
            // 重置重试计数器，以便下次失败时可以再次尝试
            retryLoginCount = 0;
            return of(v);
          })
        ) as Observable<AjaxResponse<T>>;
      }
    })
  );
}

mockRequestFailed();
mockRequestFailed();
mockRequestFailed();