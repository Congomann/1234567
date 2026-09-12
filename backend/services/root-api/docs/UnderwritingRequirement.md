# RootEmbeddedApi.UnderwritingRequirement

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **String** | The kind of requirement. | [optional] 
**description** | **String** | A human readable description of what is required. | [optional] 
**actionRequired** | **String** | The timeframe in which action must be taken in order to satisfy the requirement. | [optional] 
**retryAt** | **Date** | The date and time at which the quote could be retried and potentially receive an updated status. | [optional] 



## Enum: TypeEnum


* `ineligible` (value: `"ineligible"`)

* `manual_review` (value: `"manual_review"`)

* `moratorium_coverages_not_available` (value: `"moratorium_coverages_not_available"`)

* `not_enough_data` (value: `"not_enough_data"`)

* `test_drive` (value: `"test_drive"`)

* `vehicle_inspection` (value: `"vehicle_inspection"`)





## Enum: ActionRequiredEnum


* `none` (value: `"none"`)

* `retry` (value: `"retry"`)

* `before_bind` (value: `"before_bind"`)

* `after_bind` (value: `"after_bind"`)




