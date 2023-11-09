import { Observable } from '../Observable';
import { createOperatorSubscriber } from './OperatorSubscriber';
export function map(project) {
    return (source) => new Observable((subscriber) => {
        let index = 0;
        source.subscribe(createOperatorSubscriber(subscriber, (value) => {
            subscriber.next(project(value, index++));
        }));
    });
}
