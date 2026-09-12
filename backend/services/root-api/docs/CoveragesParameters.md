# RootEmbeddedApi.CoveragesParameters

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**policy** | [**[PolicyCoverageParameters]**](PolicyCoverageParameters.md) | Coverages under this key apply to the whole policy. | [optional] 
**vehicles** | [**[VehicleCoveragesParameters]**](VehicleCoveragesParameters.md) | Coverages under this key apply to an individual vehicle and can be selected independently. | [optional] 
**automotive** | [**[PolicyCoverageParameters]**](PolicyCoverageParameters.md) | (Experimental) A flat array of all coverage selections, as a sibling to policy and vehicles. This is expected to eventually replace the policy/vehicles split. Please see your Root representative to request access to this experimental endpoint. | [optional] 


