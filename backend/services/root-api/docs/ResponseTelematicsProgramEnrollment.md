# RootEmbeddedApi.ResponseTelematicsProgramEnrollment

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**value** | **String** | The enrollment status of the telematics program. Requires a valid consentedAt timestamp to enroll. | [optional] 
**inferredValue** | **String** | The value inferred and used instead for enrollment when value is invalid. | [optional] 
**valid** | **Boolean** | This value is valid. | [optional] 
**message** | **String** | An error message if applicable. | [optional] 
**requirements** | [**[ResponseTelematicsProgramEnrollmentRequirementsInner]**](ResponseTelematicsProgramEnrollmentRequirementsInner.md) | A list of requirements that must be met for this value to be valid. | [optional] 



## Enum: ValueEnum


* `declined` (value: `"declined"`)

* `enrolled` (value: `"enrolled"`)

* `unspecified` (value: `"unspecified"`)





## Enum: InferredValueEnum


* `declined` (value: `"declined"`)

* `enrolled` (value: `"enrolled"`)

* `unspecified` (value: `"unspecified"`)




