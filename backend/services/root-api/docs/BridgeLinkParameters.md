# RootEmbeddedApi.BridgeLinkParameters

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**attributionParameters** | [**AttributionParameters**](AttributionParameters.md) |  | [optional] 
**experience** | **String** | The experience the bridging user will be directed to. | [optional] [default to &#39;default&#39;]
**cancelUrl** | **String** | The redirect URL when the user cancels. Consult your Root representative to see if this property applies to your integration. | [optional] 
**successUrl** | **String** | The redirect URL when the user successfully binds. Consult your Root representative to see if this property applies to your integration. | [optional] 
**ttlHours** | **Number** | Time in hours that the bridge link/token will remain valid after creation. Minimum 1 hour (60 minutes), maximum 48 hours (2880 minutes) inclusively. If a value is not provided or is outside of the acceptable bounds, then a default value of 24 hours will be used. | [optional] [default to 24]



## Enum: ExperienceEnum


* `agent` (value: `"agent"`)

* `default` (value: `"default"`)




