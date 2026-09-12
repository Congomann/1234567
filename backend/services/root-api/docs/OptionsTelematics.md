# RootEmbeddedApi.OptionsTelematics

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **String** | The availability of the programs. | [optional] 
**programs** | [**[ResponseTelematicsProgram]**](ResponseTelematicsProgram.md) | DEPRECATED: Use testDrives and electives instead. This field will be removed in an upcoming release. | [optional] 
**testDrives** | [**[ResponseTelematicsProgram]**](ResponseTelematicsProgram.md) | The primary telematics programs available to the user. One must be chosen. | [optional] 
**electives** | [**[ResponseTelematicsProgram]**](ResponseTelematicsProgram.md) | The secondary telematics programs available to the user. These are optional. | [optional] 



## Enum: StatusEnum


* `available` (value: `"available"`)

* `checking_availability` (value: `"checking_availability"`)

* `insufficient_data` (value: `"insufficient_data"`)

* `unavailable` (value: `"unavailable"`)




