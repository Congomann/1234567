# RootEmbeddedApi.AgencyPolicies

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**currentOffset** | **Number** | The query offset passed in this request. Defaults to 0. | [optional] 
**error** | **String** | The error message. | [optional] 
**policies** | [**[AgentPolicy]**](AgentPolicy.md) | A collection of policies associated with the agency, which may be filtered based on specified criteria. | [optional] 
**totalPolicies** | **Number** | The number of policies matching the query. This count is capped for performance, so for very large result sets it may be lower than the true total. Use it for pagination: when it is greater than &#x60;offset&#x60; plus the number of policies returned in this response, more results are available, so increase &#x60;offset&#x60; to fetch the next page. | [optional] 


