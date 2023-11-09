import { Observable, Observer, Subject, ReplaySubject } from '../src/observables';
import jest from 'jest-mock';

describe('Observable', () => {
  it('should create an Observable', () => {
    const observable = new Observable((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    const observer = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn(),
    };

    const subscription = observable.subscribe(observer);

    expect(observer.next).toHaveBeenCalledTimes(3);
    expect(observer.next).toHaveBeenCalledWith(1);
    expect(observer.next).toHaveBeenCalledWith(2);
    expect(observer.next).toHaveBeenCalledWith(3);
    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.complete).toHaveBeenCalled();
    expect(subscription.unsubscribe).toBeDefined();
  });

  it('should handle errors', () => {
    const observable = new Observable((subscriber) => {
      subscriber.next(1);
      subscriber.error('Oops!');
    });

    const observer = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn(),
    };

    const subscription = observable.subscribe(observer);

    expect(observer.next).toHaveBeenCalledTimes(1);
    expect(observer.next).toHaveBeenCalledWith(1);
    expect(observer.error).toHaveBeenCalledTimes(1);
    expect(observer.error).toHaveBeenCalledWith('Oops!');
    expect(observer.complete).not.toHaveBeenCalled();
    expect(subscription.unsubscribe).toBeDefined();
  });

  it('should handle completion', () => {
    const observable = new Observable((subscriber) => {
      subscriber.next(1);
      subscriber.complete();
    });

    const observer = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn(),
    };

    const subscription = observable.subscribe(observer);

    expect(observer.next).toHaveBeenCalledTimes(1);
    expect(observer.next).toHaveBeenCalledWith(1);
    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.complete).toHaveBeenCalled();
    expect(subscription.unsubscribe).toBeDefined();
  });
});

describe('Subject', () => {
  it('should create a Subject', () => {
    const subject = new Subject();

    const observer1 = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn(),
    };

    const observer2 = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn(),
    };

    subject.subscribe(observer1);
    subject.subscribe(observer2);

    subject.next(1);
    subject.next(2);
    subject.complete();

    expect(observer1.next).toHaveBeenCalledTimes(2);
    expect(observer1.next).toHaveBeenCalledWith(1);
    expect(observer1.next).toHaveBeenCalledWith(2);
    expect(observer1.error).not.toHaveBeenCalled();
    expect(observer1.complete).toHaveBeenCalled();

    expect(observer2.next).toHaveBeenCalledTimes(2);
    expect(observer2.next).toHaveBeenCalledWith(1);
    expect(observer2.next).toHaveBeenCalledWith(2);
    expect(observer2.error).not.toHaveBeenCalled();
    expect(observer2.complete).toHaveBeenCalled();
  });
});

describe('ReplaySubject', () => {
  it('should create a ReplaySubject', () => {
    const replaySubject = new ReplaySubject(2);

    const observer1 = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn(),
    };

    const observer2 = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn(),
    };

    replaySubject.subscribe(observer1);
    replaySubject.next(1);
    replaySubject.next(2);
    replaySubject.next(3);
    replaySubject.subscribe(observer2);

    expect(observer1.next).toHaveBeenCalledTimes(3);
    expect(observer1.next).toHaveBeenCalledWith(1);
    expect(observer1.next).toHaveBeenCalledWith(2);
    expect(observer1.next).toHaveBeenCalledWith(3);
    expect(observer1.error).not.toHaveBeenCalled();
    expect(observer1.complete).not.toHaveBeenCalled();

    expect(observer2.next).toHaveBeenCalledTimes(2);
    expect(observer2.next).toHaveBeenCalledWith(2);
    expect(observer2.next).toHaveBeenCalledWith(3);
    expect(observer2.error).not.toHaveBeenCalled();
    expect(observer2.complete).not.toHaveBeenCalled();
  });
});