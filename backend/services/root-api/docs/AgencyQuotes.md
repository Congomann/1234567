# RootEmbeddedApi.AgencyQuotes

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**currentOffset** | **Number** | The query offset passed in this request. Defaults to 0. | [optional] 
**error** | **String** | The error message. | [optional] 
**quotes** | [**[AgentQuote]**](AgentQuote.md) | A collection of quotes associated with the agency, which may be filtered based on specified criteria. | [optional] 
**totalQuotes** | **Number** | The number of quotes matching the query. This count is capped for performance, so for very large result sets it may be lower than the true total. Use it for pagination: when it is greater than &#x60;offset&#x60; plus the number of quotes returned in this response, more results are available, so increase &#x60;offset&#x60; to fetch the next page. | [optional] 


