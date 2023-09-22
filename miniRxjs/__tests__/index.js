const { Observable, Subject, ReplaySubject } = require('../index.js');

describe('Test miniRxjs', () => {
  test('Observable', done => {
    const observable = new Observable(observer => {
      observer.next('Hello');
      observer.complete();
    });

    observable.subscribe({
      next: value => {
        expect(value).toBe('Hello');
      },
      complete: () => {
        done();
      }
    });
  });

  test('Subject', done => {
    const subject = new Subject();

    subject.subscribe({
      next: value => {
        expect(value).toBe('Hello');
      },
      complete: () => {
        done();
      }
    });

    subject.next('Hello');
    subject.complete();
  });

//   test('BehaviorSubject', done => {
//     const behaviorSubject = new BehaviorSubject('Initial');

//     behaviorSubject.subscribe({
//       next: value => {
//         expect(value).toBe('Initial');
//       }
//     });

//     behaviorSubject.next('Hello');

//     behaviorSubject.subscribe({
//       next: value => {
//         expect(value).toBe('Hello');
//       },
//       complete: () => {
//         done();
//       }
//     });

//     behaviorSubject.complete();
//   });

  test('ReplaySubject', done => {
    const replaySubject = new ReplaySubject(2);
    const expects = [2, 3];
    const results = [];
    let vIdx = 0;

    replaySubject.next(1);
    replaySubject.next(2);
    replaySubject.next(3);

    replaySubject.subscribe({
      next: value => {
        results.push(value);
      },
      complete: () => {
        done();
      }
    });
    expect(results).toEqual(expects);

    replaySubject.subscribe((v) => {
      expect(v).toBe(2 + vIdx);
      vIdx++;
    });

    replaySubject.complete();
  });



});
