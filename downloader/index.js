"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const custom_retry_1 = require("../custom-retry");
class Downloader {
    constructor(config) {
        this.defaultConfig = {
            isManual: false,
            concurrent: Infinity,
        };
        this.taskQueue = [];
        this.addTaskSubject = new rxjs_1.ReplaySubject();
        this.retrySubject = new rxjs_1.Subject();
        this.pauseSubject = new rxjs_1.Subject();
        this.cancelSubject = new rxjs_1.Subject();
        this.config = this.defaultConfig;
        if (config) {
            this.config = config;
        }
        this.task$ = this.addTaskSubject.asObservable().pipe((0, operators_1.tap)(() => {
            console.log('add task');
        }), (0, operators_1.mergeMap)((task) => {
            return this.downloadFile(task);
        }, this.config.concurrent));
    }
    downloadFile(task) {
        console.log('downloadFile', task);
        return (0, rxjs_1.from)(fetch(task.url)).pipe((0, operators_1.tap)(() => {
            console.log('get ', task.url);
        }), (0, operators_1.retryWhen)(() => this.retrySubject.pipe((0, operators_1.filter)((t) => {
            if (typeof t === 'number') {
                return t === task.id;
            }
            if (t.id) {
                return t.id === task.id;
            }
            return false;
        }))), (0, custom_retry_1.retryAfterExponentialDelay)(3), (0, operators_1.catchError)((e) => (0, rxjs_1.of)(e)), (0, operators_1.takeUntil)(this.cancelSubject.pipe((0, operators_1.filter)((t) => {
            if (typeof t === 'number') {
                return t === task.id;
            }
            if (t.id) {
                return t.id === task.id;
            }
            return false;
        }))));
    }
    addTask(url) {
        const id = Date.now();
        this.addTaskSubject.next({
            id,
            url,
            status: {
                progress: 0,
                status: 'idle'
            }
        });
        // this.taskQueue.push();
        return id;
    }
    removeTask(task) {
        // this.taskQueue.splice(idx, 1);
        this.cancelSubject.next(task);
    }
    downloadAll() {
        // if (!this.config.isManual) {
        //   this.task$.subscribe((resp) => {
        //     console.log(resp);
        //   });
        // }
        return this.task$;
    }
    retry(task) {
        this.retrySubject.next(task);
    }
    pause(task) {
        this.pauseSubject.next(task);
    }
    pauseAll() {
    }
    stop() {
    }
    stopAll() {
    }
    clearAll() {
    }
}
exports.default = Downloader;
