# RootEmbeddedApi.ApiVehiclePrimaryUsageValue

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**message** | **String** | An error message if applicable. | 
**requirements** | [**[AnyOfApiFactInvalidRequirementApiFactPresenceRequirementApiFactStringFormattingRequirementApiFactStringInclusionRequirement]**](AnyOfApiFactInvalidRequirementApiFactPresenceRequirementApiFactStringFormattingRequirementApiFactStringInclusionRequirement.md) | A list of requirements that must be met for this value to be valid. | 
**valid** | **Boolean** | This value is valid. | 
**inferredValue** | **String** | The value inferred and used instead for pricing when value is invalid. | [optional] 
**value** | **String** | The current value. | 



## Enum: InferredValueEnum


* `business` (value: `"business"`)

* `commute` (value: `"commute"`)

* `farm` (value: `"farm"`)

* `pleasure` (value: `"pleasure"`)

* `occasional` (value: `"occasional"`)

* `rideshare` (value: `"rideshare"`)

* `work` (value: `"work"`)





## Enum: ValueEnum


* `business` (value: `"business"`)

* `commute` (value: `"commute"`)

* `farm` (value: `"farm"`)

* `pleasure` (value: `"pleasure"`)

* `occasional` (value: `"occasional"`)

* `rideshare` (value: `"rideshare"`)

* `work` (value: `"work"`)




