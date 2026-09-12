# RootEmbeddedApi.DocumentationApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**retrieveOpenApiSpec**](DocumentationApi.md#retrieveOpenApiSpec) | **GET** /docs/openapi/v3/swagger.yaml | Get v3 openapi spec



## retrieveOpenApiSpec

> retrieveOpenApiSpec()

Get v3 openapi spec

Retrieves the openApi spec file for the v3 carrier platform API

### Example

```javascript
import RootEmbeddedApi from 'root_embedded_api';

let apiInstance = new RootEmbeddedApi.DocumentationApi();
apiInstance.retrieveOpenApiSpec().then(() => {
  console.log('API called successfully.');
}, (error) => {
  console.error(error);
});

```

### Parameters

This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

