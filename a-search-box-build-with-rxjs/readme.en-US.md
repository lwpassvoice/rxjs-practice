### Implement a search box with the following requirements:

1. Contains a search input box, search button, reset button, search prompt box list, search result list, loading status, and request failure status.

2. Do not process when the input is empty.

3. Do not process when the input is the same as the last time.

4. After the user inputs, get the prompt content from the background based on the input after 300ms. If the request is successful, display the search prompt box list. If the request fails, do not display it.

5. After the user clicks on the search prompt box list, replace the search input box content with the prompt content and automatically trigger the search.

6. Trigger search when the mouse clicks the search button or the enter key is pressed.

7. Cancel the previous search request that is in progress before searching, and hide the search prompt box.

8. Throttle the mouse click search button and enter key press for 500ms.

9. If the request is successful, display the search result list. If the request fails, automatically retry up to 3 times. If it still fails, display the request failure status.

10. Display loading when the request is in progress. After the request is successful, cancel the loading. After the request fails and completes the retry, cancel the loading.

11. Click the reset button to reset the search box, reset the search result list, hide the loading status, cancel the current request, hide the request failure status, and hide the search prompt box list. 
