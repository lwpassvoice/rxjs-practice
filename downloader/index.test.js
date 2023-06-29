"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
const _1 = __importDefault(require("."));
const downloader = new _1.default();
downloader.downloadAll().pipe((0, operators_1.map)((res) => res.body)).subscribe({
    next: (v) => {
        console.log('next ', v);
    },
    error: (e) => {
        console.error('error ', e);
    },
    complete: () => {
        console.log('complete');
    }
});
const task1 = downloader.addTask('https://himg.bdimg.com/sys/portraitn/item/public.1.6f42ce76.ARMUFuSrTp_AXDuhTVZBPA');
downloader.addTask('https://static.segmentfault.com/main_site_next/451a4258/_next/static/media/logo-b.1ef53c6e.svg');
// downloader.removeTask(task1);
