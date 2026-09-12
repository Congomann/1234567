# RootEmbeddedApi.CoverageAttribute

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**kind** | [**ApiOptionType**](ApiOptionType.md) |  | 
**type** | **String** | (Experimental) A discriminator indicating the true type of this attribute (declined, deductible, limits, or modifier), as &#x60;kind&#x60; may in the future be used as a more specific unique identifier. Please see your Root representative to request access to this experimental endpoint. | 
**description** | **String** | A human readable description of the coverage attribute. | 
**longDescription** | **String** | (Experimental) A more detailed human readable description of the coverage attribute. Please see your Root representative to request access to this experimental endpoint. | 
**name** | **String** | A human readable version of the kind. | 
**selectableBy** | **String** | (Experimental) The level at which a customer can select this coverage attribute (&#39;policy&#39;, &#39;vehicle&#39;, or &#39;none&#39;). Please see your Root representative to request access to this experimental endpoint. | 
**selection** | [**ApiCoverageOption**](ApiCoverageOption.md) |  | 
**selectionAlternatives** | [**[SelectionAlternative]**](SelectionAlternative.md) | (Experimental) An array of alternative attributes that could be selected for this kind. They may contain information indicating how their selection will likely affect the final price. Please see your Root representative to request access to this experimental endpoint. | 



## Enum: TypeEnum


* `deductible` (value: `"deductible"`)

* `limits` (value: `"limits"`)

* `modifier` (value: `"modifier"`)

* `declined` (value: `"declined"`)





## Enum: SelectableByEnum


* `policy` (value: `"policy"`)

* `vehicle` (value: `"vehicle"`)

* `none` (value: `"none"`)




