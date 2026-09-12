# RootEmbeddedApi.BraintreePaymentsApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createBraintreeClientToken**](BraintreePaymentsApi.md#createBraintreeClientToken) | **POST** /v3/quoting/quote/{quote_id}/payment/braintree/client_token | Create Braintree client token
[**getBraintreeCustomer**](BraintreePaymentsApi.md#getBraintreeCustomer) | **GET** /v3/quoting/quote/{quote_id}/payment/braintree/customer | Get Braintree customer



## createBraintreeClientToken

> CreateBraintreeClientToken201Response createBraintreeClientToken(quoteId)

Create Braintree client token

Generate a Braintree client token. The client token will be used to initialize the Braintree client SDK for purchasing an auto policy with the quote. Please, refer to https://developer.paypal.com/braintree/docs/guides/authorization/client-token for more information.

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

let apiInstance = new RootEmbeddedApi.BraintreePaymentsApi();
let quoteId = "quoteId_example"; // String | 
apiInstance.createBraintreeClientToken(quoteId).then((data) => {
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

[**CreateBraintreeClientToken201Response**](CreateBraintreeClientToken201Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getBraintreeCustomer

> GetBraintreeCustomer200Response getBraintreeCustomer(quoteId)

Get Braintree customer

Attempt to retrieve a user&#39;s Braintree customer ID. This may be utilized with pre-authorization from Root to support server-to-server payments.

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

let apiInstance = new RootEmbeddedApi.BraintreePaymentsApi();
let quoteId = "quoteId_example"; // String | 
apiInstance.getBraintreeCustomer(quoteId).then((data) => {
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

[**GetBraintreeCustomer200Response**](GetBraintreeCustomer200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

