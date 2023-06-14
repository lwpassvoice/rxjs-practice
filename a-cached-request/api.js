import { requestUrl, token } from '../configs/const.js';

const { Observable } = rxjs;

export function getUserInfo() {
  return new Observable((sub) => {
    fetch(`${requestUrl}/user/userinfo`, {
      headers: { apifoxtoken: token }
    })
      .then(async (response) => {
        if (!response.ok) {
          sub.error('Network response was not ok');
        }
        sub.next(await response.json());
      })
      .catch((err) => {
        console.error(err);
        sub.error(err)
      });
  });
}