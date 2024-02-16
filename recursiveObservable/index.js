"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var ajax_1 = require("rxjs/ajax");
var loginSubject = new rxjs_1.BehaviorSubject(null);
var LOGIN_URL = 'https://example.com/login';
var REQUEST_URL = 'https://example.com/request';
function mockLogin() {
    var req$ = request(LOGIN_URL).pipe((0, rxjs_1.tap)(function (val) { return console.log('mockLogin: ' + val); }), (0, rxjs_1.retry)(3));
    loginSubject.next(req$);
    return req$;
}
function mockRequestFailed() {
    request(REQUEST_URL).pipe(
    // switchMap(() => throwError(() => 'error'))
    ).subscribe({
        next: function (val) {
            loginSubject.next(null);
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
        // const retry$ = new Observable();
        // const sub = loginSubject.subscribe((token) => {
        // })
        var relogin$ = mockLogin();
        // loginSubject.next(relogin$);
        console.log('catchError');
        return caught.pipe((0, rxjs_1.tap)(function () { return console.log('of tap'); }), (0, rxjs_1.switchMap)(function () {
            console.log('loginSubject', loginSubject.getValue());
            return loginSubject.getValue() ? loginSubject : relogin$;
        }));
        // return relogin$;
    }));
}
mockRequestFailed();
