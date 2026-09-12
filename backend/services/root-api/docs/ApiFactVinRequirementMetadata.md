# RootEmbeddedApi.ApiFactVinRequirementMetadata

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**pattern** | **String** | The Ruby regular expression used to evaluate the provided VIN. This is not the ultimate source of truth as some VIN validation cannot be handled by a regular expression. Please use the fulfilled status of this requirement to determine if the VIN is valid. | [optional] 
**required** | **String** | The kind of vin required for this operation | 



## Enum: RequiredEnum


* `full` (value: `"full"`)

* `partial` (value: `"partial"`)




