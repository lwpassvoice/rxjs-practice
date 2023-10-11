// import { ReplaySubject } from '../ts/index.js';

const { ReplaySubject } = require('../ts/index.js');

const sb = new ReplaySubject(2);
sb.next('sd');
sb.next('sdeqe');
sb.subscribe((v) => {
    console.log(v)
});
sb.next('sqwqd');
