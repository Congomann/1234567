# RootEmbeddedApi.PrefillApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createPrefill**](PrefillApi.md#createPrefill) | **POST** /v3/quoting/quote/{quote_id}/prefill | Create prefill report
[**getPrefill**](PrefillApi.md#getPrefill) | **GET** /v3/quoting/quote/{quote_id}/prefill | Get prefill report



## createPrefill

> createPrefill(quoteId, opts)

Create prefill report

Create a prefill report request associated with the provided quote. Data for the prefill uses the request body instead of data associated with the quote. After the prefill report is created, the associated prefill drivers will be automatically added to the quote with a status of Undecided. The quote will remain unbindable until the status for these drivers is set to either Covered or Excluded.

### Example

```javascript
import RootEmbeddedApi from 'root_embedded_api';
let defaultClient = RootEmbeddedApi.ApiClient.instance;
// Configure Bearer access token for authorization: agency_access_token
let agency_access_token = defaultClient.authentications['agency_access_token'];
agency_access_token.accessToken = "YOUR ACCESS TOKEN"
// Configure Bearer access token for authorization: legacy_api_key
let legacy_api_key = defaultClient.authentications['legacy_api_key'];
legacy_api_key.accessToken = "YOUR ACCESS TOKEN"

let apiInstance = new RootEmbeddedApi.PrefillApi();
let quoteId = "quoteId_example"; // String | 
let opts = {
  'createPrefillRequest': {"dob":"1985-01-25","firstName":"Root","lastName":"Rooterson","address1":"80 E Rich St","city":"Columbus","state":"OH","zip":"43215"} // CreatePrefillRequest | 
};
apiInstance.createPrefill(quoteId, opts).then(() => {
  console.log('API called successfully.');
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**|  | 
 **createPrefillRequest** | [**CreatePrefillRequest**](CreatePrefillRequest.md)|  | [optional] 

### Return type

null (empty response body)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getPrefill

> GetPrefill200Response getPrefill(quoteId)

Get prefill report

Attempt to retrieve a prefill report. The associated quote must exist and a prefill request must have been previously created on /v3/quoting/quote/{quote_id}/prefill in order to receive a success response. This operation is async and it is recommended to be polled until completion. This operation can take up to 35 seconds to complete.

### Example

```javascript
import RootEmbeddedApi from 'root_embedded_api';
let defaultClient = RootEmbeddedApi.ApiClient.instance;
// Configure Bearer access token for authorization: agency_access_token
let agency_access_token = defaultClient.authentications['agency_access_token'];
agency_access_token.accessToken = "YOUR ACCESS TOKEN"
// Configure Bearer access token for authorization: legacy_api_key
let legacy_api_key = defaultClient.authentications['legacy_api_key'];
legacy_api_key.accessToken = "YOUR ACCESS TOKEN"

let apiInstance = new RootEmbeddedApi.PrefillApi();
let quoteId = "quoteId_example"; // String | 
apiInstance.getPrefill(quoteId).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**|  | 

### Return type

[**GetPrefill200Response**](GetPrefill200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

