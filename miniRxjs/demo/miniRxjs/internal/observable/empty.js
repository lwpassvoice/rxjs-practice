import { Observable } from '../Observable';
export const EMPTY = new Observable((subscriber) => subscriber.complete());
