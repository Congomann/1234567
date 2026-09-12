# RootEmbeddedApi.RequestTelematicsProgram

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**consentedAt** | **Date** | The timestamp when the user consented to this telematics program, in ISO 8601 format. | [optional] 
**enrollment** | **String** | Whether the user has consented to this telematics program. | [optional] 
**program** | **String** | The telematics program identifier. While this list shows all possible programs, the available programs differ on a quote-by-quote basis, so a particular quote will only have a subset (or none) of these options. | [optional] 



## Enum: EnrollmentEnum


* `declined` (value: `"declined"`)

* `enrolled` (value: `"enrolled"`)





## Enum: ProgramEnum


* `root_test_drive` (value: `"root_test_drive"`)

* `root_ready_test_drive_cas` (value: `"root_ready_test_drive_cas"`)

* `root_ready_test_drive_arity` (value: `"root_ready_test_drive_arity"`)

* `no_test_drive` (value: `"no_test_drive"`)

* `continuous_connectivity` (value: `"continuous_connectivity"`)




