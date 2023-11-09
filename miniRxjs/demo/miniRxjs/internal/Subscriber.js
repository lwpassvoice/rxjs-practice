import { isFunction } from './util/isFunction';
import { Subscription } from './Subscription';
import { config } from './config';
import { reportUnhandledError } from './util/reportUnhandledError';
import { nextNotification, errorNotification, COMPLETE_NOTIFICATION } from './NotificationFactories';
import { timeoutProvider } from './scheduler/timeoutProvider';
export class Subscriber extends Subscription {
    constructor(destination) {
        super();
        this.isStopped = false;
        this.destination = destination instanceof Subscriber ? destination : createSafeObserver(destination);
        if (hasAddAndUnsubscribe(destination)) {
            destination.add(this);
        }
    }
    next(value) {
        if (this.isStopped) {
            handleStoppedNotification(nextNotification(value), this);
        }
        else {
            this._next(value);
        }
    }
    error(err) {
        if (this.isStopped) {
            handleStoppedNotification(errorNotification(err), this);
        }
        else {
            this.isStopped = true;
            this._error(err);
        }
    }
    complete() {
        if (this.isStopped) {
            handleStoppedNotification(COMPLETE_NOTIFICATION, this);
        }
        else {
            this.isStopped = true;
            this._complete();
        }
    }
    unsubscribe() {
        if (!this.closed) {
            this.isStopped = true;
            super.unsubscribe();
            this.destination = null;
        }
    }
    _next(value) {
        this.destination.next(value);
    }
    _error(err) {
        try {
            this.destination.error(err);
        }
        finally {
            this.unsubscribe();
        }
    }
    _complete() {
        try {
            this.destination.complete();
        }
        finally {
            this.unsubscribe();
        }
    }
}
class ConsumerObserver {
    constructor(partialObserver) {
        this.partialObserver = partialObserver;
    }
    next(value) {
        const { partialObserver } = this;
        if (partialObserver.next) {
            try {
                partialObserver.next(value);
            }
            catch (error) {
                reportUnhandledError(error);
            }
        }
    }
    error(err) {
        const { partialObserver } = this;
        if (partialObserver.error) {
            try {
                partialObserver.error(err);
            }
            catch (error) {
                reportUnhandledError(error);
            }
        }
        else {
            reportUnhandledError(err);
        }
    }
    complete() {
        const { partialObserver } = this;
        if (partialObserver.complete) {
            try {
                partialObserver.complete();
            }
            catch (error) {
                reportUnhandledError(error);
            }
        }
    }
}
function createSafeObserver(observerOrNext) {
    return new ConsumerObserver(!observerOrNext || isFunction(observerOrNext) ? { next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : undefined } : observerOrNext);
}
function handleStoppedNotification(notification, subscriber) {
    const { onStoppedNotification } = config;
    onStoppedNotification && timeoutProvider.setTimeout(() => onStoppedNotification(notification, subscriber));
}
function hasAddAndUnsubscribe(value) {
    return value && isFunction(value.unsubscribe) && isFunction(value.add);
}
