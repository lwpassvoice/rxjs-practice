import { getUserInfo as fetchUserInfo } from './api.js';

const { BehaviorSubject, from, take, filter, switchMap, fromEvent, throttleTime } = rxjs;

// 创建一个BehaviorSubject来存储和更新userInfo
let userInfo$ = null;

// 获取用户信息的函数
function getUserInfo(forceUpdate = false) {
  const getInfo = () => {
    from(fetchUserInfo()).subscribe((userInfo) => {
      userInfo$.next(userInfo);
      console.log('getUserInfo', userInfo);
    }, (err) => {
      console.error('getUserInfo', err);
      // TODO: 根据需求清除前值
      if (!userInfo$.getValue()) {
        resetUserInfo();
      }
    });
  }
  if (!userInfo$) {
    userInfo$ = new BehaviorSubject(null);
    getInfo();
  } else if (forceUpdate) {
    getInfo();
  }
  return userInfo$;
}

function resetUserInfo() {
  if (userInfo$) {
    userInfo$.complete();
  }
  userInfo$ = null;
  userInfoView.textContent = '';
}

// 组件A和B的按钮和显示框
const getUserInfoButtonA = document.getElementById('getUserInfoA');
const userInfoDisplayA = document.getElementById('userInfoA');
const getUserInfoButtonB = document.getElementById('getUserInfoB');
const userInfoDisplayB = document.getElementById('userInfoB');
const resetButton = document.getElementById('reset');
const forceUpdateButton = document.getElementById('forceUpdate');
const userInfoView = document.getElementById('userInfo');

// 组件A的按钮点击事件
fromEvent(getUserInfoButtonA, 'click').pipe(
  throttleTime(500),
  switchMap(() => getUserInfo().pipe(
    filter((v) => v),
    take(1)
  ))
).subscribe((userInfo) => {
  if (userInfo) {
    userInfoDisplayA.textContent = JSON.stringify(userInfo);
    userInfoView.textContent = JSON.stringify(userInfo);
  }
});

// 组件B的按钮点击事件
fromEvent(getUserInfoButtonB, 'click').pipe(
  throttleTime(500),
  switchMap(() => getUserInfo().pipe(
    filter((v) => v),
    take(1)
  ))
).subscribe((userInfo) => {
  if (userInfo) {
    userInfoDisplayB.textContent = JSON.stringify(userInfo);
    userInfoView.textContent = JSON.stringify(userInfo);
  }
});

// 强制更新
fromEvent(forceUpdateButton, 'click').pipe(
  throttleTime(500),
  switchMap(() => getUserInfo(true))
).subscribe((userInfo) => {
  if (userInfo) {
    userInfoView.textContent = JSON.stringify(userInfo);
  }
});

// 重置
fromEvent(resetButton, 'click').subscribe(() => {
  resetUserInfo();
});
