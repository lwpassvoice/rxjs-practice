// import { ReplaySubject } from '../ts/index.js';

import { Observable, ReplaySubject, first, take } from '../src/index.js';

// const sb = new ReplaySubject(3);
// sb.next('1');
// sb.next('2');
// // sb.subscribe((v) => {
// //     console.log(v)
// // });
// sb.next('3');

// // const firstValue = sb.pipe(first());
// // firstValue.subscribe((v) => {
// //     console.log('First value: ', v);
// // });

// const firstValue = sb.pipe(take(2));
// firstValue.subscribe((v) => {
//     console.log('First 2 values: ', v);
// });

// sb.next('4');
// sb.next('5');

// const secondValue = sb.pipe(take(6));
// secondValue.subscribe((v) => {
//     console.log('Second 3 values: ', v);
// });

// sb.next('6');
// sb.next('7');

console.log('demo');
const timer$ = new Observable((observer) => {
    let i = 0;
    let itl = setInterval(() => {
        observer.next(i++);
        i > 10 ? clearInterval(itl) : null;
    }, 300);
})
const rp = new ReplaySubject(3);

timer$.subscribe((v) => {
    console.log('timer', v)
    rp.next(v);
});

setTimeout(() => {
    rp.subscribe((v) => {
        console.log('rp', v)
    })
}, 1000);

