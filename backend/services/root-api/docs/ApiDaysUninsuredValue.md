# RootEmbeddedApi.ApiDaysUninsuredValue

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**message** | **String** | An error message if applicable. | 
**requirements** | [**[ApiBooleanValueRequirementsInner]**](ApiBooleanValueRequirementsInner.md) | A list of requirements that must be met for this value to be valid. | 
**valid** | **Boolean** | This value is valid. | 
**inferredValue** | **String** | The value inferred and used instead for pricing when value is invalid. | [optional] 
**value** | **String** | The current value. | 



## Enum: InferredValueEnum


* `0-31` (value: `"0-31"`)

* `32-90` (value: `"32-90"`)

* `91-180` (value: `"91-180"`)

* `180+` (value: `"180+"`)





## Enum: ValueEnum


* `0-31` (value: `"0-31"`)

* `32-90` (value: `"32-90"`)

* `91-180` (value: `"91-180"`)

* `180+` (value: `"180+"`)




