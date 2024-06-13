type Signal<T> = [() => T, (newValue: T) => void];
type Effect<T> = (fn: () => T) => void;
type Store<T> = [T];

let current: (() => void) | undefined;

function createSignal<T = any>(initialValue: T): Signal<T> {
  let value = initialValue;
  const observers: (() => void)[] = [];

  const getter = (): T => {
    if (current && !observers.includes(current)) {
      observers.push(current);
    }
    return value;
  };
  const setter = (newValue: T): void => {
    value = newValue;
    observers.forEach((fn) => fn());
  };

  return [getter, setter];
}

function createEffect<T = any>(fn: () => T): void {
  current = fn;
  fn();
  current = undefined;
}

function createStore<T extends object>(base: T): Store<T> {
  const observers: (() => void)[] = [];
  const storeHandler: ProxyHandler<T> = {
    get(target, prop): any {
      if (current && !observers.includes(current)) {
        observers.push(current);
      }
      return target[prop];
    },
    set(target, prop, value): boolean {
      target[prop] = value;
      observers.forEach((fn) => fn());
      return true;
    },
  };

  const value = new Proxy(base, storeHandler);
  return [value];
}
