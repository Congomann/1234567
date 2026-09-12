# RootEmbeddedApi.AddressApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**validateAddress**](AddressApi.md#validateAddress) | **POST** /v3/quoting/quote/{quote_id}/address/validate | Validate address



## validateAddress

> ValidateAddress201Response validateAddress(quoteId, opts)

Validate address

The validate address endpoint can be hit to check that your address is deliverable. If we detect a similar deliverable address it will be returned using the suggested fields. It is possible an address is deliverable despite receiving deliverable: false, so we recommend letting the user have the final say on their address. Please see your Root representative to request access to this optional endpoint.

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

let apiInstance = new RootEmbeddedApi.AddressApi();
let quoteId = "quoteId_example"; // String | 
let opts = {
  'addressParameters': {"address1":"80 E Rich St","city":"Columbus","state":"OH","zip":"43215"} // AddressParameters | 
};
apiInstance.validateAddress(quoteId, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**|  | 
 **addressParameters** | [**AddressParameters**](AddressParameters.md)|  | [optional] 

### Return type

[**ValidateAddress201Response**](ValidateAddress201Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

