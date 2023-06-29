"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryAfterExponentialDelay = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const itv$ = (0, rxjs_1.interval)(1000);
function retryAfterExponentialDelay(times = Infinity) {
    return (obs$) => {
        return obs$.pipe((0, operators_1.retryWhen)((err) => {
            return err.pipe((0, operators_1.scan)((acc, val) => {
                if (acc > times)
                    throw val;
                return acc + 1;
            }, 1), (0, operators_1.delayWhen)((n) => (0, rxjs_1.timer)(n ** 2 * 1000)));
        }));
    };
}
exports.retryAfterExponentialDelay = retryAfterExponentialDelay;
const rty$ = itv$.pipe((0, operators_1.concatMap)((v, idx) => {
    return new rxjs_1.Observable((sub) => {
        if (idx === 2 && Math.random() > 0.5) {
            sub.error('emit an error');
        }
        sub.next(v);
        sub.complete();
    });
}), retryAfterExponentialDelay(2));
// rty$.subscribe((v) => {
//   console.log('subscribe ', v);
// }, (e) => {
//   console.error(e);
// });
