## Implementing Interface Caching with RxJS to Solve Duplicate Interface Calls
### Example: Both Component A and B Require User Information
### Without Interface Caching:
Both A and B retrieve information from the interface, resulting in duplicate requests.

### With Interface Caching:
1. When there is no cached data, A calls the interface first. While waiting for the request to complete, B waits as well.
2. When there is no cached data, A calls the interface first. After the request is completed, B retrieves the data from the cache.
3. When there is cached data, A and B retrieve information from the cache respectively.
4. When there is cached data, the cache can be forcibly refreshed and A and B can be notified.
5. Cached data can be forcibly cleared. 