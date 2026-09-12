# RootEmbeddedApi.PolicyApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createQuoteFromPolicy**](PolicyApi.md#createQuoteFromPolicy) | **POST** /v3/policies/policy/{policy_identifier}/quote | Create quote from policy
[**getPolicy**](PolicyApi.md#getPolicy) | **GET** /v3/policies/policy/{policy_identifier} | Get policy summary
[**getPolicyDocuments**](PolicyApi.md#getPolicyDocuments) | **GET** /v3/policies/policy/{policy_identifier}/documents | Get policy documents
[**getPolicyPayment**](PolicyApi.md#getPolicyPayment) | **GET** /v3/policies/policy/{policy_identifier}/payment | Get payment information
[**getPolicyQuote**](PolicyApi.md#getPolicyQuote) | **GET** /v3/policies/policy/{policy_identifier}/quote | Get policy quote with payment data



## createQuoteFromPolicy

> CreateQuoteFromPolicy201Response createQuoteFromPolicy(policyIdentifier)

Create quote from policy

Creates an endorsement quote from an existing policy. Please note that this endpoint is currently under development.

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

let apiInstance = new RootEmbeddedApi.PolicyApi();
let policyIdentifier = "ABC123"; // String | The policy number.
apiInstance.createQuoteFromPolicy(policyIdentifier).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **policyIdentifier** | **String**| The policy number. | 

### Return type

[**CreateQuoteFromPolicy201Response**](CreateQuoteFromPolicy201Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getPolicy

> GetPolicy200Response getPolicy(policyIdentifier)

Get policy summary

Gets a high level summary of policy information

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

let apiInstance = new RootEmbeddedApi.PolicyApi();
let policyIdentifier = new RootEmbeddedApi.GetPolicyPaymentPolicyIdentifierParameter(); // GetPolicyPaymentPolicyIdentifierParameter | The policy identifier, which can be either the policy ID or the policy number.
apiInstance.getPolicy(policyIdentifier).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **policyIdentifier** | [**GetPolicyPaymentPolicyIdentifierParameter**](.md)| The policy identifier, which can be either the policy ID or the policy number. | 

### Return type

[**GetPolicy200Response**](GetPolicy200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getPolicyDocuments

> GetPolicyDocuments200Response getPolicyDocuments(policyIdentifier)

Get policy documents

Gets insurance card and policy document URLs

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

let apiInstance = new RootEmbeddedApi.PolicyApi();
let policyIdentifier = new RootEmbeddedApi.GetPolicyDocumentsPolicyIdentifierParameter(); // GetPolicyDocumentsPolicyIdentifierParameter | 
apiInstance.getPolicyDocuments(policyIdentifier).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **policyIdentifier** | [**GetPolicyDocumentsPolicyIdentifierParameter**](.md)|  | 

### Return type

[**GetPolicyDocuments200Response**](GetPolicyDocuments200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getPolicyPayment

> GetPolicyPayment200Response getPolicyPayment(policyIdentifier)

Get payment information

Returns information about the provided policy&#39;s payment information

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

let apiInstance = new RootEmbeddedApi.PolicyApi();
let policyIdentifier = new RootEmbeddedApi.GetPolicyPaymentPolicyIdentifierParameter(); // GetPolicyPaymentPolicyIdentifierParameter | The policy identifier, which can be either the policy ID or the policy number.
apiInstance.getPolicyPayment(policyIdentifier).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **policyIdentifier** | [**GetPolicyPaymentPolicyIdentifierParameter**](.md)| The policy identifier, which can be either the policy ID or the policy number. | 

### Return type

[**GetPolicyPayment200Response**](GetPolicyPayment200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getPolicyQuote

> GetPolicyQuote200Response getPolicyQuote(policyIdentifier)

Get policy quote with payment data

Returns read-only quote payment information for the provided policy.

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

let apiInstance = new RootEmbeddedApi.PolicyApi();
let policyIdentifier = new RootEmbeddedApi.GetPolicyPaymentPolicyIdentifierParameter(); // GetPolicyPaymentPolicyIdentifierParameter | The policy identifier, which can be either the policy ID or the policy number.
apiInstance.getPolicyQuote(policyIdentifier).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **policyIdentifier** | [**GetPolicyPaymentPolicyIdentifierParameter**](.md)| The policy identifier, which can be either the policy ID or the policy number. | 

### Return type

[**GetPolicyQuote200Response**](GetPolicyQuote200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

