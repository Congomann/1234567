# RootEmbeddedApi.ApiDateTimeValue

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**message** | **String** | An error message if applicable. | 
**requirements** | [**[ApiBooleanValueRequirementsInner]**](ApiBooleanValueRequirementsInner.md) | A list of requirements that must be met for this value to be valid. | 
**valid** | **Boolean** | This value is valid. | 
**inferredValue** | **Date** | The value inferred and used instead for pricing when value is invalid. | [optional] 
**value** | **Date** | The current value in ISO 8601 date-time format. See rfc 3339 section 5.6: https://www.rfc-editor.org/rfc/rfc3339#section-5.6 | 


