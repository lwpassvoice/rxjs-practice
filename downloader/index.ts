import { Observable, ReplaySubject, Subject, from, interval, of, timer } from 'rxjs';
import { buffer, bufferCount, catchError, concatMap, debounceTime, delay, delayWhen, filter, map, mapTo, mergeMap, retry, retryWhen, scan, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AjaxResponse, ajax } from 'rxjs/ajax';
import { retryAfterExponentialDelay } from '../custom-retry';

interface TaskStatus {
  progress: number;
  status: 'idle' | 'downloading' | 'successed' | 'failed' | 'canceled';
  error?: unknown;
  response?: Response;
}

interface Task {
  id: number;
  url: string;
  status: TaskStatus;
  filename?: string;
}

interface DownloaderConfig {
  isManual: boolean;
  concurrent: number;
}

export default class Downloader {

  private readonly defaultConfig: DownloaderConfig = {
    isManual: false,
    concurrent: Infinity,
  }

  private taskQueue: Task[] = [];

  private addTaskSubject: ReplaySubject<Task> = new ReplaySubject();

  private retrySubject: Subject<Task | number> = new Subject();

  private pauseSubject: Subject<Task | number> = new Subject();

  private cancelSubject: Subject<Task | number> = new Subject();

  private config: DownloaderConfig = this.defaultConfig;

  private task$: Observable<Task>;

  static instance: Downloader;

  constructor(config?: DownloaderConfig) {
    if (config) {
      this.config = config;
    }
    this.task$ = this.addTaskSubject.asObservable().pipe(
      tap(() => {
        console.log('add task');
      }),
      mergeMap((task) => {
        return this.downloadFile(task);
      }, this.config.concurrent)
    );
  }

  downloadFile(task: Task) {
    console.log('downloadFile', task);
    return from(fetch(task.url)).pipe(
      tap(() => {
        console.log('get ', task.url);
      }),
      retryWhen(() => this.retrySubject.pipe(
        filter((t) => {
          if (typeof t === 'number') {
            return t === task.id
          }
          if (t.id) {
            return t.id === task.id
          }
          return false;
        })
      )),
      retryAfterExponentialDelay(3),
      catchError((e) => of(e)),
      takeUntil(this.cancelSubject.pipe(
        filter((t) => {
          if (typeof t === 'number') {
            return t === task.id
          }
          if (t.id) {
            return t.id === task.id
          }
          return false;
        })
      ))
    );
  }

  addTask(url: string): number {
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

  removeTask(task: Task | number) {
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

  retry(task: Task) {
    this.retrySubject.next(task);
  }

  pause(task: Task) {
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