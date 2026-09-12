# RootEmbeddedApi.CoveragesPatchParameters

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**policy** | [**{String: PolicyCoveragePatchParameters}**](PolicyCoveragePatchParameters.md) | The object&#39;s key is the index of the coverage within the policy array, and the value is an object with the parameters to be updated. If value is null, the coverage will be deleted. | [optional] 
**vehicles** | [**{String: VehicleCoveragesPatchParameters}**](VehicleCoveragesPatchParameters.md) | The object&#39;s key is the index of the vehicle within the vehicles array, and the value is an object with the parameters to be updated. If value is null, the coverages for that vehicle will be deleted. | [optional] 
**automotive** | [**{String: PolicyCoveragePatchParameters}**](PolicyCoveragePatchParameters.md) | (Experimental) The object&#39;s key is the index of the coverage within the automotive array, and the value is an object with the parameters to be updated. If value is null, the coverage will be deleted. Please see your Root representative to request access to this experimental endpoint. | [optional] 


