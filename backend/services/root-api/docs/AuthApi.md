# RootEmbeddedApi.AuthApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createToken**](AuthApi.md#createToken) | **POST** /v3/auth/token | Create token
[**refreshToken**](AuthApi.md#refreshToken) | **POST** /v3/auth/token/refresh | Refresh token



## createToken

> AuthTokenResult createToken(opts)

Create token

This endpoint is used to create a temporary, Agency-specific, access token to be used in the Authentication header of subsequent requests to the rest of the API. The bearer token used for this endpoint is an integration secret key, if you do not have this key, please contact your Root representative. All the parameters to this endpoint are optional, choose the combination that works best for your integration. Using agent info while creating a token will default subsequent quotes as attributed to that agent.  If the parameters provided are not specific enough, you will receive the possible token references in the response and you should make a subsequent request with one of those tokenReferences to disambiguate what access is being granted.  If the parameters do not find any valid reference to create a token for, then an error response will be given. The successful response will contain your temporary token and describe when it will expire in epoch time. Note: Once the token expires, you will need to generate a new token the same way. It is possible the token can be invalidated early if misuse is suspected.

### Example

```javascript
import RootEmbeddedApi from 'root_embedded_api';
let defaultClient = RootEmbeddedApi.ApiClient.instance;
// Configure Bearer access token for authorization: integration_secret_key
let integration_secret_key = defaultClient.authentications['integration_secret_key'];
integration_secret_key.accessToken = "YOUR ACCESS TOKEN"

let apiInstance = new RootEmbeddedApi.AuthApi();
let opts = {
  'authTokenParameters': {"tokenReference":"6LKcegdY5GakJ1UHJ9SWpFpY"} // AuthTokenParameters | 
};
apiInstance.createToken(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authTokenParameters** | [**AuthTokenParameters**](AuthTokenParameters.md)|  | [optional] 

### Return type

[**AuthTokenResult**](AuthTokenResult.md)

### Authorization

[integration_secret_key](../README.md#integration_secret_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## refreshToken

> AuthTokenResult refreshToken(opts)

Refresh token

This endpoint is used to refresh a temporary, Agency-specific, access token to be used in the Authentication header of subsequent requests to the rest of the API. The bearer token used for this endpoint is an integration secret key, if you do not have this key, please contact your Root representative. Supply the token previously generated via Create token, this endpoint can refresh tokens that are both already expired and not yet expired. The successful response will contain your temporary token and describe when it will expire in epoch time. Note: Once the token expires, you will need to generate a new token the same way. It is possible the token can be invalidated early if misuse is suspected.

### Example

```javascript
import RootEmbeddedApi from 'root_embedded_api';
let defaultClient = RootEmbeddedApi.ApiClient.instance;
// Configure Bearer access token for authorization: integration_secret_key
let integration_secret_key = defaultClient.authentications['integration_secret_key'];
integration_secret_key.accessToken = "YOUR ACCESS TOKEN"

let apiInstance = new RootEmbeddedApi.AuthApi();
let opts = {
  'refreshTokenRequest': new RootEmbeddedApi.RefreshTokenRequest() // RefreshTokenRequest | 
};
apiInstance.refreshToken(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **refreshTokenRequest** | [**RefreshTokenRequest**](RefreshTokenRequest.md)|  | [optional] 

### Return type

[**AuthTokenResult**](AuthTokenResult.md)

### Authorization

[integration_secret_key](../README.md#integration_secret_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

