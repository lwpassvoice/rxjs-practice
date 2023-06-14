import { getSuggestions, getSearchResult } from './api.js';
const { fromEvent, catchError, debounceTime, throttleTime, distinctUntilChanged, filter, map, retry, switchMap, tap, withLatestFrom, merge, takeUntil, Subject, of } = rxjs;

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resetBtn = document.getElementById('reset-btn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const suggestions = document.getElementById('suggestions');
const results = document.getElementById('results');

// input输入流
const search$ = fromEvent(searchInput, 'input').pipe(
  map(e => e.target.value),
  debounceTime(300),
  distinctUntilChanged()
);

// 搜索按钮点击
const searchClick$ = fromEvent(searchBtn, 'click').pipe(
  throttleTime(500),
  withLatestFrom(search$, (_, query) => query)
);

// 搜索框中按回车
const searchEnter$ = fromEvent(searchInput, 'keydown').pipe(
  filter(e => e.key === 'Enter'),
  throttleTime(500),
  withLatestFrom(search$, (_, query) => query)
);

// 搜索流
const searchTrigger$ = new Subject();

// 合并流，触发搜索
merge(searchClick$, searchEnter$).subscribe(searchTrigger$);

// 重置按钮点击流
const reset$ = new Subject();

// 关闭搜索提示
const hideSuggestions$ = new Subject();

// 订阅input流，获取suggestion
search$.pipe(
  filter(query => query.trim().length > 0),
  switchMap(query => getSuggestions(query).pipe(
    // 获取失败直接返回空
    catchError(() => of([])),
    takeUntil(reset$)
  ))
).subscribe(suggestionData => {
  suggestions.innerHTML = '';
  suggestions.style.display = 'block';
  suggestionData.forEach(suggestion => {
    const li = document.createElement('li');
    li.textContent = suggestion;
    suggestions.appendChild(li);

    // 对每个li注册事件
    fromEvent(li, 'click').pipe(
      // hideSuggestions$、reset$时取消订阅
      takeUntil(hideSuggestions$),
      takeUntil(reset$),
    ).subscribe(() => {
      searchInput.value = li.textContent;
      hideSuggestions();
      searchTrigger$.next(li.textContent); // Trigger search
    });
  });
});

// 搜索结果流
const searchResults$ = searchTrigger$.pipe(
  filter(query => query.trim().length > 0),
  // 重置状态
  tap(() => {
    loading.style.display = 'block';
    error.style.display = 'none';
    hideSuggestions();
  }),
  // 切换流到api调用
  switchMap(query => getSearchResult(query).pipe(
    retry(3),
    catchError(err => {
      error.style.display = 'block';
      return of([]);
    }),
    takeUntil(reset$)
  )),
  tap(() => {
    loading.style.display = 'none';
  })
);

searchResults$.subscribe(data => {
  results.innerHTML = '';
  data.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    results.appendChild(li);
  });
});

fromEvent(resetBtn, 'click').subscribe(() => {
  searchInput.value = '';
  searchInput.dispatchEvent(new InputEvent('input'));
  results.innerHTML = '';
  loading.style.display = 'none';
  error.style.display = 'none';
  hideSuggestions();
  reset$.next();
});

function hideSuggestions() {
  suggestions.style.display = 'none';
  hideSuggestions$.next();
}
