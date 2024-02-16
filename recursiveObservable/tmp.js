"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var ajax_1 = require("rxjs/ajax");
var loginSubject = new rxjs_1.BehaviorSubject(null);
var LOGIN_URL = 'https://example.com/login';
var REQUEST_URL = 'https://example.com/request';
var retryLoginCount = 0; // 用于跟踪重试登录的次数
function mockLogin() {
    // 检查是否已有登录请求正在进行
    if (loginSubject.getValue() !== null) {
        console.log('Login already in progress. Waiting for current login to complete.');
        return loginSubject.getValue();
    }
    console.log('Starting new login attempt.');
    var req$ = request(LOGIN_URL).pipe((0, rxjs_1.tap)(function (val) { return console.log('mockLogin: ' + val); }), (0, rxjs_1.retry)(3));
    loginSubject.next(req$);
    req$.subscribe({
        complete: function () {
            // 登录完成后，重置loginSubject以允许新的登录尝试
            loginSubject.next(null);
        },
        error: function () {
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
        next: function (val) {
            console.log('next: ' + val);
        },
        error: function (err) { return console.error('error: ' + err); },
    });
}
function request(url, options) {
    if (options === void 0) { options = { retryCount: 3 }; }
    var req$ = ajax_1.ajax.get(url);
    return req$.pipe((0, rxjs_1.tap)({
        next: function (val) { return console.log('tap next: ' + val); },
        error: function (err) { return console.error('tap error: ' + err); },
    }), (0, rxjs_1.catchError)(function (err, caught) {
        if (retryLoginCount >= 3) {
            console.log('Max login attempts reached, not retrying.');
            return (0, rxjs_1.throwError)(function () { return 'Max login attempts reached.'; });
        }
        else {
            retryLoginCount++; // 递增重试计数器
            console.log('Attempting to re-login, attempt number: ', retryLoginCount);
            return mockLogin().pipe((0, rxjs_1.switchMap)(function () {
                // 重置重试计数器，以便下次失败时可以再次尝试
                retryLoginCount = 0;
                return (0, rxjs_1.of)('Logged in successfully after retry');
            }));
        }
    }));
}
mockRequestFailed();
