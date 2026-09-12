# RootEmbeddedApi.ProfileParameters

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**address1** | **String** | The address line 1. | [optional] 
**address2** | **String** | The address line 2. | [optional] 
**city** | **String** | The address city. | [optional] 
**customerConsentTimestamp** | **Date** | The time that the customer consented to Root pulling third party reports in ISO 8601 date-time format. See rfc 3339 section 5.6: https://www.rfc-editor.org/rfc/rfc3339#section-5.6 | [optional] 
**tcpaConsentTimestamp** | **Date** | The time that the customer consented to calls or text from Root or its Agencies in ISO 8601 date-time format. See rfc 3339 section 5.6: https://www.rfc-editor.org/rfc/rfc3339#section-5.6 | [optional] 
**drivers** | [**[DriverParameters]**](DriverParameters.md) | The drivers associated with this quote. | [optional] 
**driverVehicleAssignments** | [**[DriverVehicleAssignmentParameters]**](DriverVehicleAssignmentParameters.md) | The driver vehicle assignments associated with this quote. | [optional] 
**eDelivery** | **Boolean** | Will this policy deliver documents electronically. This may apply a discount. | [optional] 
**email** | **String** | The contract email address for this policy. | [optional] 
**homeownerStatus** | **String** | The homeowner status of the policy holder. | [optional] 
**hasLienholders** | **Boolean** | Whether any lienholders are associated with the customer&#39;s vehicle financing. | [optional] 
**incidentHistory** | [**IncidentHistoryParameters**](IncidentHistoryParameters.md) |  | [optional] 
**insuranceHistory** | [**InsuranceHistoryParameters**](InsuranceHistoryParameters.md) |  | [optional] 
**lienholders** | [**[LienholderParameters]**](LienholderParameters.md) | The lienholders associated with this quote. | [optional] 
**phoneNumber** | **String** | The contract phone number for this policy. | [optional] 
**policyholderDriverId** | **String** | The ID of the driver who will be the primary named insured on the policy. | [optional] 
**ratingMunicipality** | **String** | The city in which this policy will be quoted. Typically the address city. | [optional] 
**rideshare** | **Boolean** | One or more vehicles on this policy will be used for rideshare services like Uber, Lyft or Doordash. | [optional] 
**state** | **String** | The address state. | [optional] 
**vehicles** | [**[VehicleParameters]**](VehicleParameters.md) | The vehicles associated with this quote. | [optional] 
**zip** | **String** | The address ZIP. | [optional] 



## Enum: HomeownerStatusEnum


* `own` (value: `"own"`)

* `rent` (value: `"rent"`)

* `other` (value: `"other"`)





## Enum: StateEnum


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




