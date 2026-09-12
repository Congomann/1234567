# RootEmbeddedApi.QuotingApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createQuote**](QuotingApi.md#createQuote) | **POST** /v3/quoting/quote | Create quote
[**getAvailableCoveragesByQuoteId**](QuotingApi.md#getAvailableCoveragesByQuoteId) | **GET** /v3/quoting/quote/{quote_id}/coverages/available | Get available coverages
[**getAvailableCoveragesByState**](QuotingApi.md#getAvailableCoveragesByState) | **GET** /v3/quoting/market/{state}/coverages/available | Get available coverages by state
[**getCoverageRulesByQuoteId**](QuotingApi.md#getCoverageRulesByQuoteId) | **GET** /v3/quoting/quote/{quote_id}/coverages/rules | Get coverage rules
[**getCoverageRulesByState**](QuotingApi.md#getCoverageRulesByState) | **GET** /v3/quoting/market/{state}/coverages/rules | Get coverage rules by state
[**getQuote**](QuotingApi.md#getQuote) | **GET** /v3/quoting/quote/{quote_id} | Get quote
[**getSuggestedCoverages**](QuotingApi.md#getSuggestedCoverages) | **GET** /v3/quoting/quote/{quote_id}/coverages/suggested | Get suggested coverages
[**patchQuote**](QuotingApi.md#patchQuote) | **PATCH** /v3/quoting/quote/{quote_id} | Patch quote
[**postBindQuote**](QuotingApi.md#postBindQuote) | **POST** /v3/quoting/quote/{quote_id}/bind | Bind policy
[**postFinalizeQuote**](QuotingApi.md#postFinalizeQuote) | **POST** /v3/quoting/quote/{quote_id}/finalize | Finalize quote
[**postViewQuote**](QuotingApi.md#postViewQuote) | **POST** /v3/quoting/quote/{quote_id}/view | View quote
[**updateQuote**](QuotingApi.md#updateQuote) | **PUT** /v3/quoting/quote/{quote_id} | Update quote



## createQuote

> CreateQuote201Response createQuote(opts)

Create quote

Creates a new quote. A quote can be created with no data. Data can be provided up to a full description of the profile and coverages. Updates to this quote should be made on the PUT /v3/quoting/quote/{quote_id} endpoint.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let opts = {
  'quoteCreateParameters': {"profile":{}} // QuoteCreateParameters | 
};
apiInstance.createQuote(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteCreateParameters** | [**QuoteCreateParameters**](QuoteCreateParameters.md)|  | [optional] 

### Return type

[**CreateQuote201Response**](CreateQuote201Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## getAvailableCoveragesByQuoteId

> GetAvailableCoveragesByQuoteId200Response getAvailableCoveragesByQuoteId(quoteId)

Get available coverages

Returns a comprehensive list of all possible coverages available for an existing quote, including key attributes such as a name, a description, deductibles and limits as well as declining options if the coverage is declinable. This response provides a detailed breakdown of each coverage&#39;s available attributes. Available coverages may change dynamically as profile information evolves. For instance, regulations in certain regions may require offering specific modifiers only to certain age groups or under specific conditions. Building a generalized UI that renders all the available coverage options will provide the basics of coverage customization without needing to encode state specific rules.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let quoteId = "quoteId_example"; // String | The quote ID for which to get available coverages.
apiInstance.getAvailableCoveragesByQuoteId(quoteId).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**| The quote ID for which to get available coverages. | 

### Return type

[**GetAvailableCoveragesByQuoteId200Response**](GetAvailableCoveragesByQuoteId200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getAvailableCoveragesByState

> GetAvailableCoveragesByQuoteId200Response getAvailableCoveragesByState(state)

Get available coverages by state

Returns a comprehensive list of all possible coverages available for a state, including key attributes such as a name, a description, deductibles and limits as well as declining options if the coverage is declinable. This response provides a detailed breakdown of each coverage&#39;s available attributes. Available coverages may change dynamically as profile information evolves, but this endpoint will not change as it is not aware of a &#39;current&#39; quote, you may prefer the available coverages path that uses quoteId rather than state. Building a generalized UI that renders all the available coverage options will provide the basics of coverage customization without needing to encode state specific rules.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let state = "state_example"; // String | A state abbreviation, like OH, for which to get available coverages.
apiInstance.getAvailableCoveragesByState(state).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **state** | **String**| A state abbreviation, like OH, for which to get available coverages. | 

### Return type

[**GetAvailableCoveragesByQuoteId200Response**](GetAvailableCoveragesByQuoteId200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getCoverageRulesByQuoteId

> GetCoverageRulesByQuoteId200Response getCoverageRulesByQuoteId(quoteId)

Get coverage rules

Gets coverage rules for an existing quote.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let quoteId = "quoteId_example"; // String | The quote ID for which to get coverage rules.
apiInstance.getCoverageRulesByQuoteId(quoteId).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**| The quote ID for which to get coverage rules. | 

### Return type

[**GetCoverageRulesByQuoteId200Response**](GetCoverageRulesByQuoteId200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getCoverageRulesByState

> GetCoverageRulesByQuoteId200Response getCoverageRulesByState(state)

Get coverage rules by state

Gets coverage rules for a state abbreviation.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let state = "state_example"; // String | A state abbreviation, like OH, for which to get coverage rules.
apiInstance.getCoverageRulesByState(state).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **state** | **String**| A state abbreviation, like OH, for which to get coverage rules. | 

### Return type

[**GetCoverageRulesByQuoteId200Response**](GetCoverageRulesByQuoteId200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getQuote

> GetQuote200Response getQuote(quoteId)

Get quote

Gets an existing quote. A quote must first be created with the POST /v3/quoting/quote endpoint.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let quoteId = "quoteId_example"; // String | 
apiInstance.getQuote(quoteId).then((data) => {
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

[**GetQuote200Response**](GetQuote200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getSuggestedCoverages

> GetSuggestedCoverages200Response getSuggestedCoverages(quoteId)

Get suggested coverages

Gets recommended coverage packages. A quote must first be created with the POST /v3/quoting/quote endpoint and an address state on the profile must be provided. The payments applicable for the suggested coverage packages will not be present by default; please contact your Root representative if you&#39;d like to enable this feature. It will add some latency to this particular endpoint. Payments for coverage packages are also unavailable if there is no current and completed RC1 or RC3.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let quoteId = "quoteId_example"; // String | 
apiInstance.getSuggestedCoverages(quoteId).then((data) => {
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

[**GetSuggestedCoverages200Response**](GetSuggestedCoverages200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## patchQuote

> GetQuote200Response patchQuote(quoteId, opts)

Patch quote

Sparsely updates an existing quote. A quote must first be created with the POST /v3/quoting/quote endpoint. Data can be provided up to a full description of the profile and coverages. Any previously-extant data that is not passed will be retained. If you attempt to update a finalized quote which still has status: quoting, you will receive a 425 \&quot;too early\&quot; response.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let quoteId = "quoteId_example"; // String | 
let opts = {
  'quotePatchParameters': {"profile":{"drivers":{"1":{"id":"db782c0d-0d7c-4675-af8d-28610f47d9d8","firstName":"John","lastName":"Doe","dob":"1990-01-01","licenseNumber":"SS415532","licenseState":"OH","status":"Covered","gender":"M","maritalStatus":"Married","collegeGraduate":true}},"lienholders":{"1":{"address1":"80 E Rich St","address2":"Apt 100","city":"Columbus","id":"ad782c0d-0d7c-4675-af8d-28610f47dfd3","name":"Professional Lienholder Business","state":"OH","vins":["JTHBW1GG8E2042488"],"zip":"43215"}},"vehicles":{"1":{"vin":"JTHBW1GG8E2042488","status":"Covered","make":"Honda","model":"Civic","year":2020,"garagingAddress1":"80 E Rich St","garagingCity":"Columbus","garagingState":"OH","garagingZip":"43215"}}},"coverages":{"policy":{"0":{"symbol":"umuim","attributes":{"0":{"kind":"limits","selection":{"perDay":250,"perOccurrence":500}}}}},"vehicles":{"1":{"vin":"JTHBW1GG8E2042488","coverages":{"0":{"symbol":"comp","attributes":{"0":{"kind":"deductible","selection":{"deductible":100}}}},"1":{"symbol":"rental","attributes":{"0":{"kind":"limits","selection":{"perDay":40,"perOccurrence":1200}}}}}}}}} // QuotePatchParameters | 
};
apiInstance.patchQuote(quoteId, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**|  | 
 **quotePatchParameters** | [**QuotePatchParameters**](QuotePatchParameters.md)|  | [optional] 

### Return type

[**GetQuote200Response**](GetQuote200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## postBindQuote

> BindResponse postBindQuote(quoteId, opts)

Bind policy

Bind a policy. A quote must be finalized prior to binding.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let quoteId = "quoteId_example"; // String | 
let opts = {
  'bindRequestParameters': new RootEmbeddedApi.BindRequestParameters() // BindRequestParameters | 
};
apiInstance.postBindQuote(quoteId, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**|  | 
 **bindRequestParameters** | [**BindRequestParameters**](BindRequestParameters.md)|  | [optional] 

### Return type

[**BindResponse**](BindResponse.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## postFinalizeQuote

> PostFinalizeQuote202Response postFinalizeQuote(quoteId, opts)

Finalize quote

Finalize a quote to bind a policy. A quote must first be created with the POST /v3/quoting/quote endpoint and an address state on the profile must be provided.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let quoteId = "quoteId_example"; // String | 
let opts = {
  'finalizeParameters': new RootEmbeddedApi.FinalizeParameters() // FinalizeParameters | 
};
apiInstance.postFinalizeQuote(quoteId, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**|  | 
 **finalizeParameters** | [**FinalizeParameters**](FinalizeParameters.md)|  | [optional] 

### Return type

[**PostFinalizeQuote202Response**](PostFinalizeQuote202Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## postViewQuote

> Object postViewQuote(quoteId)

View quote

Mark a quote as viewed. A quote must first be created with the POST /v3/quoting/quote endpoint and an address state on the profile must be provided.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let quoteId = "quoteId_example"; // String | 
apiInstance.postViewQuote(quoteId).then((data) => {
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


## updateQuote

> GetQuote200Response updateQuote(quoteId, opts)

Update quote

Updates an existing quote. A quote must first be created with the POST /v3/quoting/quote endpoint. Data can be provided up to a full description of the profile and coverages. Any previously-extant data that is not passed will be dropped. If you attempt to update a finalized quote which still has status: quoting, you will receive a 425 \&quot;too early\&quot; response. There are special considerations around the prefill_driver_id: this field cannot be changed or deleted once set, it must be unique among all drivers, and a driver with this field cannot be deleted.

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

let apiInstance = new RootEmbeddedApi.QuotingApi();
let quoteId = "quoteId_example"; // String | 
let opts = {
  'quoteParameters': {"profile":{}} // QuoteParameters | 
};
apiInstance.updateQuote(quoteId, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quoteId** | **String**|  | 
 **quoteParameters** | [**QuoteParameters**](QuoteParameters.md)|  | [optional] 

### Return type

[**GetQuote200Response**](GetQuote200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

