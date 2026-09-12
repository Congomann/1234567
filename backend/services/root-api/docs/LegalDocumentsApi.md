# RootEmbeddedApi.LegalDocumentsApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getLegalDocument**](LegalDocumentsApi.md#getLegalDocument) | **GET** /v3/quoting/quote/{quote_id}/legal_documents/{id} | Get legal document
[**getLegalDocuments**](LegalDocumentsApi.md#getLegalDocuments) | **GET** /v3/quoting/quote/{quote_id}/legal_documents | Get all legal documents
[**postLegalDocumentAffirmation**](LegalDocumentsApi.md#postLegalDocumentAffirmation) | **POST** /v3/quoting/quote/{quote_id}/legal_documents | Affirm legal documents



## getLegalDocument

> GetLegalDocument202Response getLegalDocument(quoteId, id)

Get legal document

Gets legal document based on quote and legal document IDs.

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

let apiInstance = new RootEmbeddedApi.LegalDocumentsApi();
let quoteId = "quoteId_example"; // String | 
let id = "id_example"; // String | 
apiInstance.getLegalDocument(quoteId, id).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**|  | 
 **id** | **String**|  | 

### Return type

[**GetLegalDocument202Response**](GetLegalDocument202Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getLegalDocuments

> GetLegalDocuments200Response getLegalDocuments(quoteId)

Get all legal documents

Gets all legal documents associated with a quote.

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

let apiInstance = new RootEmbeddedApi.LegalDocumentsApi();
let quoteId = "quoteId_example"; // String | 
apiInstance.getLegalDocuments(quoteId).then((data) => {
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

[**GetLegalDocuments200Response**](GetLegalDocuments200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## postLegalDocumentAffirmation

> Object postLegalDocumentAffirmation(quoteId)

Affirm legal documents

Affirms legal documents associated with a quote.

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

let apiInstance = new RootEmbeddedApi.LegalDocumentsApi();
let quoteId = "quoteId_example"; // String | 
apiInstance.postLegalDocumentAffirmation(quoteId).then((data) => {
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

**Object**

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

