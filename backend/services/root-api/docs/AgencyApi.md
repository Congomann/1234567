# RootEmbeddedApi.AgencyApi

All URIs are relative to *https://app.partner-testing.joinroot.com/bind_api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getAgencyAgents**](AgencyApi.md#getAgencyAgents) | **GET** /v3/agency/agents | Get agency agents
[**getAgencyPolicies**](AgencyApi.md#getAgencyPolicies) | **GET** /v3/agency/policies | Get policies for your agency
[**getAgencyQuotes**](AgencyApi.md#getAgencyQuotes) | **GET** /v3/agency/quotes | Get quotes for your agency
[**getAgent**](AgencyApi.md#getAgent) | **GET** /v3/agency/agents/{agent_id} | Get agent



## getAgencyAgents

> GetAgencyAgents200Response getAgencyAgents(opts)

Get agency agents

Retrieves a list of agents associated with your agency. Optionally, you can filter using email and/or national producer number within the query parameters.

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

let apiInstance = new RootEmbeddedApi.AgencyApi();
let opts = {
  'email': "email_example", // String | The email address of the agent
  'nationalProducerNumber': "nationalProducerNumber_example" // String | The national producer number of the agent
};
apiInstance.getAgencyAgents(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **email** | **String**| The email address of the agent | [optional] 
 **nationalProducerNumber** | **String**| The national producer number of the agent | [optional] 

### Return type

[**GetAgencyAgents200Response**](GetAgencyAgents200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getAgencyPolicies

> AgencyPolicies getAgencyPolicies(opts)

Get policies for your agency

Retrieves a list of policies associated with your agency. Optionally, you can provide parameters to limit and/or filter your query.

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

let apiInstance = new RootEmbeddedApi.AgencyApi();
let opts = {
  'active': true, // Boolean | Whether or not the found policies will be active.
  'agentId': "agentId_example", // String | The agent id the found policies will have.
  'policyholderEmail': "policyholderEmail_example", // String | The policyholder email to search for. Uses exact matching.
  'policyNumber': "policyNumber_example", // String | The policy number to search for. Uses exact matching.
  'firstName': "firstName_example", // String | The first name of the primary named insured. Uses fuzzy matching. Both first_name and last_name are required when searching by name.
  'lastName': "lastName_example", // String | The last name of the primary named insured. Uses fuzzy matching. Both first_name and last_name are required when searching by name.
  'limit': 56, // Number | The maximum number of policies to return. This defaults to unlimited.
  'offset': 56 // Number | The number of policies to offset before returning a number of policies up to the passed limit. This defaults to 0 and the offset is by created_at descending.
};
apiInstance.getAgencyPolicies(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **active** | **Boolean**| Whether or not the found policies will be active. | [optional] 
 **agentId** | **String**| The agent id the found policies will have. | [optional] 
 **policyholderEmail** | **String**| The policyholder email to search for. Uses exact matching. | [optional] 
 **policyNumber** | **String**| The policy number to search for. Uses exact matching. | [optional] 
 **firstName** | **String**| The first name of the primary named insured. Uses fuzzy matching. Both first_name and last_name are required when searching by name. | [optional] 
 **lastName** | **String**| The last name of the primary named insured. Uses fuzzy matching. Both first_name and last_name are required when searching by name. | [optional] 
 **limit** | **Number**| The maximum number of policies to return. This defaults to unlimited. | [optional] 
 **offset** | **Number**| The number of policies to offset before returning a number of policies up to the passed limit. This defaults to 0 and the offset is by created_at descending. | [optional] 

### Return type

[**AgencyPolicies**](AgencyPolicies.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getAgencyQuotes

> AgencyQuotes getAgencyQuotes(opts)

Get quotes for your agency

Retrieves a list of quotes associated with your agency. Optionally, you can provide parameters to limit and/or filter your query.

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

let apiInstance = new RootEmbeddedApi.AgencyApi();
let opts = {
  'agentId': "agentId_example", // String | The agent id associated to the found quotes.
  'bound': true, // Boolean | Whether or not the found quotes will be bound.
  'quoteReasons': ["null"], // [String] | Filter quotes by one or more reasons they may have been created for.
  'createdAfter': new Date("2013-10-20T19:20:30+01:00"), // Date | The date after which the found quotes will have been created.
  'createdBefore': new Date("2013-10-20T19:20:30+01:00"), // Date | The date before which the found quotes will have been created.
  'email': "email_example", // String | The email the found quotes will have.
  'firstName': "firstName_example", // String | The first name the found quotes will have. This query param has fuzzy find, so you can pass a partial name.
  'lastName': "lastName_example", // String | The first name the found quotes will have. This query param has fuzzy find, so you can pass a partial name.
  'offset': 56, // Number | The number of quotes to offset before returning a number of quotes up to the passed limit. This defaults to 0 and the offset is by created_at descending. We recommend you use this in combination with created_before for predictable paging.
  'limit': 56 // Number | The maximum number of quotes to return. This defaults to and caps at 10000.
};
apiInstance.getAgencyQuotes(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **agentId** | **String**| The agent id associated to the found quotes. | [optional] 
 **bound** | **Boolean**| Whether or not the found quotes will be bound. | [optional] 
 **quoteReasons** | [**[String]**](String.md)| Filter quotes by one or more reasons they may have been created for. | [optional] 
 **createdAfter** | **Date**| The date after which the found quotes will have been created. | [optional] 
 **createdBefore** | **Date**| The date before which the found quotes will have been created. | [optional] 
 **email** | **String**| The email the found quotes will have. | [optional] 
 **firstName** | **String**| The first name the found quotes will have. This query param has fuzzy find, so you can pass a partial name. | [optional] 
 **lastName** | **String**| The first name the found quotes will have. This query param has fuzzy find, so you can pass a partial name. | [optional] 
 **offset** | **Number**| The number of quotes to offset before returning a number of quotes up to the passed limit. This defaults to 0 and the offset is by created_at descending. We recommend you use this in combination with created_before for predictable paging. | [optional] 
 **limit** | **Number**| The maximum number of quotes to return. This defaults to and caps at 10000. | [optional] 

### Return type

[**AgencyQuotes**](AgencyQuotes.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## getAgent

> GetAgent200Response getAgent(agentId)

Get agent

Retrieves an agent by ID.

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

let apiInstance = new RootEmbeddedApi.AgencyApi();
let agentId = "agentId_example"; // String | 
apiInstance.getAgent(agentId).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **agentId** | **String**|  | 

### Return type

[**GetAgent200Response**](GetAgent200Response.md)

### Authorization

[agency_access_token](../README.md#agency_access_token), [legacy_api_key](../README.md#legacy_api_key)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

