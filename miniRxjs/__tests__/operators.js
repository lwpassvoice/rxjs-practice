import { first, take } from "../src/operators.js";
import { Observable } from "../src/index.js";

describe("operators", () => {
  describe("first", () => {
    it("should emit the first value that satisfies the predicate", () => {
      const source = new Observable((observer) => {
        observer.next(1);
        observer.next(2);
        observer.next(3);
        observer.complete();
      });

      const predicate = (value) => value > 1;

      const result = [];
      source.pipe(first(predicate)).subscribe({
        next(value) {
          result.push(value);
        },
      });

      expect(result).toEqual([2]);
    });

    it("should emit the first value if no predicate is provided", () => {
      const source = new Observable((observer) => {
        observer.next(1);
        observer.next(2);
        observer.next(3);
        observer.complete();
      });

      const result = [];
      source.pipe(first()).subscribe({
        next(value) {
          result.push(value);
        },
      });

      expect(result).toEqual([1]);
    });
  });

  describe("take", () => {
    it("should emit the specified number of values from the source", () => {
      const source = new Observable((observer) => {
        observer.next(1);
        observer.next(2);
        observer.next(3);
        observer.complete();
      });

      const count = 2;

      const result = [];
      source.pipe(take(count)).subscribe({
        next(value) {
          result.push(value);
        },
      });

      expect(result).toEqual([1, 2]);
    });

    it("should emit all values if the count is greater than the number of values in the source", () => {
      const source = new Observable((observer) => {
        observer.next(1);
        observer.next(2);
        observer.next(3);
        observer.complete();
      });

      const count = 5;

      const result = [];
      source.pipe(take(count)).subscribe({
        next(value) {
          result.push(value);
        },
      });

      expect(result).toEqual([1, 2, 3]);
    });

    it("should not emit any values if the count is 0", () => {
      const source = new Observable((observer) => {
        observer.next(1);
        observer.next(2);
        observer.next(3);
        observer.complete();
      });

      const count = 0;

      const result = [];
      source.pipe(take(count)).subscribe({
        next(value) {
          result.push(value);
        },
      });

      expect(result).toEqual([]);
    });

    it("should complete immediately if count is less than 0", () => {
      const source = new Observable((observer) => {
        observer.next(1);
        observer.next(2);
        observer.next(3);
        observer.complete();
      });

      const count = -1;

      const result = [];
      source.pipe(take(count)).subscribe({
        next(value) {
          result.push(value);
        },
      });

      expect(result).toEqual([]);
    });
  });
});