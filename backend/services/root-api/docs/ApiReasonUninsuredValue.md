# RootEmbeddedApi.ApiReasonUninsuredValue

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**message** | **String** | An error message if applicable. | 
**requirements** | [**[ApiBooleanValueRequirementsInner]**](ApiBooleanValueRequirementsInner.md) | A list of requirements that must be met for this value to be valid. | 
**valid** | **Boolean** | This value is valid. | 
**inferredValue** | **String** | The value inferred and used instead for pricing when value is invalid. | [optional] 
**value** | **String** | The current value. | 



## Enum: InferredValueEnum


* `cancelled` (value: `"cancelled"`)

* `never_insured` (value: `"never_insured"`)

* `overseas` (value: `"overseas"`)





## Enum: ValueEnum


* `cancelled` (value: `"cancelled"`)

* `never_insured` (value: `"never_insured"`)

* `overseas` (value: `"overseas"`)




