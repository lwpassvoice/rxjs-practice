import { map } from "rxjs/operators";
import Downloader from ".";

const downloader = new Downloader();

downloader.downloadAll().pipe(
  map((res) => (res as any).body),
).subscribe({
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
