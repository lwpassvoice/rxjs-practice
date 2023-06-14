import { requestUrl, token } from '../configs/const.js';

const { Observable } = rxjs;

export function getSearchResult(query) {
  return new Observable((sub) => {
    fetch(`${requestUrl}/search/searchResult?query=${query}`, {
      headers: { apifoxtoken: token }
    })
      .then(async (response) => {
        if (!response.ok) {
          sub.error('Network response was not ok');
        }
        sub.next(await response.json());
      })
      .catch((e) => sub.error(e));
  });
}

export function getSuggestions(query) {
  return new Observable((sub) => {
    fetch(`${requestUrl}/search/suggestions?query=${query}`, {
      headers: { apifoxtoken: token }
    })
      .then(async (response) => {
        if (!response.ok) {
          sub.error('Network response was not ok');
        }
        sub.next(await response.json());
      })
      .catch((e) => sub.error(e));
  });
}
