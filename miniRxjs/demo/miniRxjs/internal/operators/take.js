import { EMPTY } from '../observable/empty';
import { Observable } from '../Observable';
import { createOperatorSubscriber } from './OperatorSubscriber';
export function take(count) {
    return count <= 0
        ?
            () => EMPTY
        : (source) => new Observable((subscriber) => {
            let seen = 0;
            const operatorSubscriber = createOperatorSubscriber(subscriber, (value) => {
                if (++seen < count) {
                    subscriber.next(value);
                }
                else {
                    operatorSubscriber.unsubscribe();
                    subscriber.next(value);
                    subscriber.complete();
                }
            });
            source.subscribe(operatorSubscriber);
        });
}
