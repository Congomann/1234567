# RootEmbeddedApi.DriverParameters

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**accidentPreventionCourse** | **Boolean** | Has this driver completed an accident prevent course. This may apply a discount. | [optional] 
**activeDutyMilitary** | **Boolean** | This driver is an active member of the US military. This may apply a discount. | [optional] 
**ageWhenLicensed** | **Number** | The age this driver licensed. | [optional] 
**collegeGraduate** | **Boolean** | This driver is a college graduate. This may apply a discount. | [optional] 
**credit** | [**DriverParametersCredit**](DriverParametersCredit.md) |  | [optional] 
**dob** | **Date** | The driver&#39;s date of birth in ISO 8601 full-date format. See RFC 3339 section 5.6: https://www.rfc-editor.org/rfc/rfc3339#section-5.6. | [optional] 
**firstName** | **String** | The driver&#39;s first name. | [optional] 
**gender** | **String** | The driver&#39;s gender. Note: \&quot;X\&quot; is only valid in certain markets. | [optional] 
**goodStudent** | **Boolean** | This driver is a full-time student with a B average or better. This may apply a discount. | [optional] 
**id** | **String** | The unique identifier (UUID) for this driver. See RFC 9562 section 4: https://www.rfc-editor.org/rfc/rfc9562#section-4. ID or prefillDriverId (when applicable) must be provided to uniquely identify a driver when updating a quote. | [optional] 
**lastName** | **String** | The driver&#39;s last name. | [optional] 
**licenseNumber** | **String** | The driver&#39;s license number. | [optional] 
**licenseState** | **String** | The driver&#39;s license state issuer. | [optional] 
**maritalStatus** | **String** | The driver&#39;s marital status. | [optional] 
**nameSuffix** | **String** | The driver&#39;s suffix such as Jr., Sr. or III. | [optional] 
**nationalGuardMember** | **Boolean** | This driver is an active member of the US national guard. This may apply a discount. | [optional] 
**occasionalDriver** | **Boolean** | This driver drives less than 50% of the time on all vehicles on the policy. | [optional] 
**prefillDriverId** | **String** | The unique identifier for the associated prefilled driver. ID or prefillDriverId (when applicable) must be provided to uniquely identify a driver when updating a quote. | [optional] 
**refresherPreventionCourse** | **Boolean** | Has this driver completed an refresher prevention course. This may apply a discount. | [optional] 
**status** | **String** | The status of the driver for this policy. | [optional] 
**yearsLicensedSelection** | **String** | Number of years this driver has had their driver&#39;s license. | [optional] 



## Enum: GenderEnum


* `M` (value: `"M"`)

* `F` (value: `"F"`)

* `X` (value: `"X"`)





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





## Enum: MaritalStatusEnum


* `Single` (value: `"Single"`)

* `Married` (value: `"Married"`)

* `Widowed` (value: `"Widowed"`)





## Enum: StatusEnum


* `Covered` (value: `"Covered"`)

* `Excluded` (value: `"Excluded"`)

* `Not in household` (value: `"Not in household"`)

* `Undecided` (value: `"Undecided"`)





## Enum: YearsLicensedSelectionEnum


* `Less than 1 year` (value: `"Less than 1 year"`)

* `Between 1 and 2 years` (value: `"Between 1 and 2 years"`)

* `Between 2 and 3 years` (value: `"Between 2 and 3 years"`)

* `More than 3 years` (value: `"More than 3 years"`)




