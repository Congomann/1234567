# RootEmbeddedApi.Profile

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**address1** | [**ApiStringValue**](ApiStringValue.md) |  | 
**address2** | [**ApiStringValue**](ApiStringValue.md) |  | [optional] 
**city** | [**ApiStringValue**](ApiStringValue.md) |  | 
**customerConsentTimestamp** | [**ApiDateTimeValue**](ApiDateTimeValue.md) |  | 
**tcpaConsentTimestamp** | [**ApiDateTimeValue**](ApiDateTimeValue.md) |  | [optional] 
**drivers** | [**[Driver]**](Driver.md) | The drivers associated with this quote. | 
**driverVehicleAssignments** | [**[DriverVehicleAssignment]**](DriverVehicleAssignment.md) | The driver vehicle assignments associated with this quote. | 
**eDelivery** | [**ApiBooleanValue**](ApiBooleanValue.md) |  | 
**email** | [**ApiStringValue**](ApiStringValue.md) |  | 
**homeownerStatus** | [**ApiHomeownerStatusValue**](ApiHomeownerStatusValue.md) |  | 
**hasLienholders** | [**ApiBooleanValue**](ApiBooleanValue.md) |  | 
**incidentHistory** | [**IncidentHistory**](IncidentHistory.md) |  | 
**insuranceHistory** | [**InsuranceHistory**](InsuranceHistory.md) |  | 
**lienholders** | [**Lienholder**](Lienholder.md) |  | [optional] 
**phoneNumber** | [**ApiStringValue**](ApiStringValue.md) |  | 
**policyholderDriverId** | [**ApiUuidValue**](ApiUuidValue.md) |  | 
**ratingMunicipality** | [**ApiStringValue**](ApiStringValue.md) |  | [optional] 
**rideshare** | [**ApiBooleanValue**](ApiBooleanValue.md) |  | 
**state** | [**ApiMarketValue**](ApiMarketValue.md) |  | 
**underwritingRequirements** | [**[UnderwritingRequirement]**](UnderwritingRequirement.md) | The additional requirements that must be met before this policy can be fully underwritten. (Experimental) | [optional] 
**vehicles** | [**[Vehicle]**](Vehicle.md) | The vehicles associated with this quote. | 
**zip** | [**ApiStringValue**](ApiStringValue.md) |  | 


