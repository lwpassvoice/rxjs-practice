import { isFunction } from './util/isFunction';
import { UnsubscriptionError } from './util/UnsubscriptionError';
export class Subscription {
    constructor(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this.closed = false;
        this._finalizers = null;
    }
    unsubscribe() {
        let errors;
        if (!this.closed) {
            this.closed = true;
            const { initialTeardown: initialFinalizer } = this;
            if (isFunction(initialFinalizer)) {
                try {
                    initialFinalizer();
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError ? e.errors : [e];
                }
            }
            const { _finalizers } = this;
            if (_finalizers) {
                this._finalizers = null;
                for (const finalizer of _finalizers) {
                    try {
                        execFinalizer(finalizer);
                    }
                    catch (err) {
                        errors = errors !== null && errors !== void 0 ? errors : [];
                        if (err instanceof UnsubscriptionError) {
                            errors.push(...err.errors);
                        }
                        else {
                            errors.push(err);
                        }
                    }
                }
            }
            if (errors) {
                throw new UnsubscriptionError(errors);
            }
        }
    }
    add(teardown) {
        var _a;
        if (teardown && teardown !== this) {
            if (this.closed) {
                execFinalizer(teardown);
            }
            else {
                if (teardown && 'add' in teardown) {
                    teardown.add(() => {
                        this.remove(teardown);
                    });
                }
                (_a = this._finalizers) !== null && _a !== void 0 ? _a : (this._finalizers = new Set());
                this._finalizers.add(teardown);
            }
        }
    }
    remove(teardown) {
        var _a;
        (_a = this._finalizers) === null || _a === void 0 ? void 0 : _a.delete(teardown);
    }
}
Subscription.EMPTY = (() => {
    const empty = new Subscription();
    empty.closed = true;
    return empty;
})();
function execFinalizer(finalizer) {
    if (isFunction(finalizer)) {
        finalizer();
    }
    else {
        finalizer.unsubscribe();
    }
}
