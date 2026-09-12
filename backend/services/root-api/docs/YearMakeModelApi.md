# RootEmbeddedApi.YearMakeModelApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getYearMakeModel**](YearMakeModelApi.md#getYearMakeModel) | **GET** /v3/ymm_for_vin/{vin} | Get YearMakeModel



## getYearMakeModel

> GetYearMakeModel200Response getYearMakeModel(vin)

Get YearMakeModel

Get the YearMakeModel associated with the provided vin.

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

let apiInstance = new RootEmbeddedApi.YearMakeModelApi();
let vin = "vin_example"; // String | The vin to get the YearMakeModel for.
apiInstance.getYearMakeModel(vin).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **vin** | **String**| The vin to get the YearMakeModel for. | 

### Return type

[**GetYearMakeModel200Response**](GetYearMakeModel200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

