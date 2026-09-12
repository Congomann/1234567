# RootEmbeddedApi.BridgeLinkApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authenticateBridgeLink**](BridgeLinkApi.md#authenticateBridgeLink) | **POST** /v3/quoting/authenticate_bridge_link | Authenticate bridge link
[**createBridgeLink**](BridgeLinkApi.md#createBridgeLink) | **POST** /v3/quoting/quote/{quote_id}/bridge_link | Create bridge link



## authenticateBridgeLink

> AuthenticateBridgeLink200Response authenticateBridgeLink(opts)

Authenticate bridge link

Authenticate a bridge link. This endpoint is used to validate a single-use token and return the bridge information. Once authenticated the token (and therefore bridge link) will be unusable.

### Example

```javascript
import RootEmbeddedApi from 'root_embedded_api';
let defaultClient = RootEmbeddedApi.ApiClient.instance;
// Configure Bearer access token for authorization: integration_secret_key
let integration_secret_key = defaultClient.authentications['integration_secret_key'];
integration_secret_key.accessToken = "YOUR ACCESS TOKEN"

let apiInstance = new RootEmbeddedApi.BridgeLinkApi();
let opts = {
  'authenticateBridgeLinkParameters': new RootEmbeddedApi.AuthenticateBridgeLinkParameters() // AuthenticateBridgeLinkParameters | 
};
apiInstance.authenticateBridgeLink(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authenticateBridgeLinkParameters** | [**AuthenticateBridgeLinkParameters**](AuthenticateBridgeLinkParameters.md)|  | [optional] 

### Return type

[**AuthenticateBridgeLink200Response**](AuthenticateBridgeLink200Response.md)

### Authorization

[integration_secret_key](../README.md#integration_secret_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## createBridgeLink

> CreateBridgeLink201Response createBridgeLink(quoteId, opts)

Create bridge link

Create a bridge link associated with the provided quote. This link will be used to redirect the user to Root&#39;s web application to complete the quoting process.

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

let apiInstance = new RootEmbeddedApi.BridgeLinkApi();
let quoteId = "quoteId_example"; // String | 
let opts = {
  'bridgeLinkParameters': new RootEmbeddedApi.BridgeLinkParameters() // BridgeLinkParameters | 
};
apiInstance.createBridgeLink(quoteId, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**|  | 
 **bridgeLinkParameters** | [**BridgeLinkParameters**](BridgeLinkParameters.md)|  | [optional] 

### Return type

[**CreateBridgeLink201Response**](CreateBridgeLink201Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

