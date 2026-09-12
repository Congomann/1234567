# RootEmbeddedApi.VehicleParameters

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**annualizedMileage** | **Number** | The distance in miles that this vehicle is expected to be driven in a year. | [optional] 
**antiTheftEquipment** | **Boolean** | This vehicle is equipped with anti theft equipment. This may apply a discount. | [optional] 
**commuteDistance** | **Number** | The distance in miles that this vehicle is driven during your commute. | [optional] 
**garagingAddress1** | **String** | The address line 1 of this vehicle&#39;s garaging location. | [optional] 
**garagingAddress2** | **String** | The address line 2 of this vehicle&#39;s garaging location. | [optional] 
**garagingCity** | **String** | The address city of this vehicle&#39;s garaging location. | [optional] 
**garagingState** | **String** | The address state of this vehicle&#39;s garaging location. | [optional] 
**garagingZip** | **String** | The address ZIP of this vehicle&#39;s garaging location. | [optional] 
**make** | **String** | The vehicle make. | [optional] 
**model** | **String** | The vehicle model. | [optional] 
**primaryUsage** | **String** | The primary usage of this vehicle. | [optional] 
**purchaseDate** | **Date** | The date this vehicle was purchased in ISO 8601 full-date format. See rfc 3339 section 5.6: https://www.rfc-editor.org/rfc/rfc3339#section-5.6 | [optional] 
**status** | **String** | The status of the vehicle for this policy. | [optional] 
**vin** | **String** | The vehicle identification number. | [optional] 
**vinEtching** | **Boolean** | The VIN is etched into the vehicle windows. This may apply a discount. | [optional] 
**year** | **Number** | The vehicle model year. | [optional] 



## Enum: GaragingStateEnum


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





## Enum: PrimaryUsageEnum


* `business` (value: `"business"`)

* `commute` (value: `"commute"`)

* `farm` (value: `"farm"`)

* `pleasure` (value: `"pleasure"`)

* `occasional` (value: `"occasional"`)

* `rideshare` (value: `"rideshare"`)

* `work` (value: `"work"`)





## Enum: StatusEnum


* `Covered` (value: `"Covered"`)

* `Excluded` (value: `"Excluded"`)




