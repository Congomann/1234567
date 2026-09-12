# RootEmbeddedApi.PrefillDriver

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**dob** | **Date** | The driver&#39;s date of birth. This field is obfuscated to only show the birth year in ISO 8601 full-date format with month and day masked. See rfc 3339 section 5.6: https://www.rfc-editor.org/rfc/rfc3339#section-5.6.. | [optional] 
**firstName** | **String** | The driver&#39;s first name. | [optional] 
**id** | **String** | The prefill driver&#39;s ID to be used in the Quote API. When used in the Quote API, this ID should be provided as the prefillDriverId on the intended Driver object. | 
**isDenylistedDriver** | **Boolean** | Indicates whether this driver is on Root&#39;s denylist.Drivers on the denylist will not be underwritten by Root and cannot be included on the policy. | [optional] 
**isRequestedDriver** | **Boolean** | Indicates whether this driver matches the parameters provided during the creation of the prefill request. There will be at most 1 prefill driver with this set to true, and the requested driver (if present) will be the first prefill driver in the list. | 
**lastName** | **String** | The driver&#39;s last name. | [optional] 
**licenseNumber** | **String** | The driver&#39;s license number. This field is obfuscated to only show the last 3 characters. | [optional] 
**licenseState** | **String** | The driver&#39;s license state issuer. | [optional] 
**prefillReportIdentifiers** | [**[PrefillReportIdentifier]**](PrefillReportIdentifier.md) | The unique identifiers for the associated prefilled report. | [optional] 



## Enum: LicenseStateEnum


* `AK` (value: `"AK"`)

* `AL` (value: `"AL"`)

* `AR` (value: `"AR"`)

* `AZ` (value: `"AZ"`)

* `CA` (value: `"CA"`)

* `CO` (value: `"CO"`)

* `CT` (value: `"CT"`)

* `DC` (value: `"DC"`)

* `DE` (value: `"DE"`)

* `FL` (value: `"FL"`)

* `GA` (value: `"GA"`)

* `HI` (value: `"HI"`)

* `IA` (value: `"IA"`)

* `ID` (value: `"ID"`)

* `IL` (value: `"IL"`)

* `IN` (value: `"IN"`)

* `KS` (value: `"KS"`)

* `KY` (value: `"KY"`)

* `LA` (value: `"LA"`)

* `MA` (value: `"MA"`)

* `MD` (value: `"MD"`)

* `ME` (value: `"ME"`)

* `MI` (value: `"MI"`)

* `MN` (value: `"MN"`)

* `MO` (value: `"MO"`)

* `MS` (value: `"MS"`)

* `MT` (value: `"MT"`)

* `NC` (value: `"NC"`)

* `ND` (value: `"ND"`)

* `NE` (value: `"NE"`)

* `NH` (value: `"NH"`)

* `NJ` (value: `"NJ"`)

* `NM` (value: `"NM"`)

* `NV` (value: `"NV"`)

* `NY` (value: `"NY"`)

* `OH` (value: `"OH"`)

* `OK` (value: `"OK"`)

* `OR` (value: `"OR"`)

* `PA` (value: `"PA"`)

* `RI` (value: `"RI"`)

* `SC` (value: `"SC"`)

* `SD` (value: `"SD"`)

* `TN` (value: `"TN"`)

* `TX` (value: `"TX"`)

* `UT` (value: `"UT"`)

* `VA` (value: `"VA"`)

* `VT` (value: `"VT"`)

* `WA` (value: `"WA"`)

* `WI` (value: `"WI"`)

* `WV` (value: `"WV"`)

* `WY` (value: `"WY"`)




