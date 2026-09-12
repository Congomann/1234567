# RootEmbeddedApi.PaymentMethodsApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createPaymentMethod**](PaymentMethodsApi.md#createPaymentMethod) | **POST** /v3/quoting/quote/{quote_id}/payment/methods | Create partner payment method
[**listPaymentMethods**](PaymentMethodsApi.md#listPaymentMethods) | **GET** /v3/quoting/quote/{quote_id}/payment | List payment methods
[**setDefaultPaymentMethod**](PaymentMethodsApi.md#setDefaultPaymentMethod) | **PATCH** /v3/billing/{billing_id}/payment_methods/default | Set default payment method



## createPaymentMethod

> CreatePaymentMethod201Response createPaymentMethod(quoteId, opts)

Create partner payment method

Create a payment method for a quote.

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

let apiInstance = new RootEmbeddedApi.PaymentMethodsApi();
let quoteId = "quoteId_example"; // String | 
let opts = {
  'paymentMethodCreateParameters': new RootEmbeddedApi.PaymentMethodCreateParameters() // PaymentMethodCreateParameters | 
};
apiInstance.createPaymentMethod(quoteId, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**|  | 
 **paymentMethodCreateParameters** | [**PaymentMethodCreateParameters**](PaymentMethodCreateParameters.md)|  | [optional] 

### Return type

[**CreatePaymentMethod201Response**](CreatePaymentMethod201Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## listPaymentMethods

> ListPaymentMethods200Response listPaymentMethods(quoteId)

List payment methods

List payment methods submitted for a quote and the selected method.

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

let apiInstance = new RootEmbeddedApi.PaymentMethodsApi();
let quoteId = "quoteId_example"; // String | 
apiInstance.listPaymentMethods(quoteId).then((data) => {
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

[**ListPaymentMethods200Response**](ListPaymentMethods200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## setDefaultPaymentMethod

> setDefaultPaymentMethod(billingId, kind, paymentMethodId)

Set default payment method

Set a payment method as the default for a billing account.

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

let apiInstance = new RootEmbeddedApi.PaymentMethodsApi();
let billingId = "billingId_example"; // String | 
let kind = "kind_example"; // String | 
let paymentMethodId = "paymentMethodId_example"; // String | 
apiInstance.setDefaultPaymentMethod(billingId, kind, paymentMethodId).then(() => {
  console.log('API called successfully.');
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **billingId** | **String**|  | 
 **kind** | **String**|  | 
 **paymentMethodId** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

