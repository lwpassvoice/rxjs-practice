const { ReplaySubject } = require('..');

const rSubject = new ReplaySubject(2);

rSubject.next(5);
rSubject.next(7);

rSubject.subscribe({
  next: (v) => {
    console.log(v);
  }
});

rSubject.subscribe((v) => {
  console.log(v);
});
