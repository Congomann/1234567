# RootEmbeddedApi.CreateBridgeLink201Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**bridgeId** | **String** | A unique identifier for this specific bridge link request. | 
**expiresAt** | **Date** | Expiration timestamp for the bridge link in ISO 8601 date-time format. See rfc 3339 section 5.6: https://www.rfc-editor.org/rfc/rfc3339#section-5.6. | 
**url** | **String** | The bridge url. | 
**token** | **String** | The bridge token included in the url. | 
**experience** | **String** | The experience the bridging user will be directed to. | [optional] 



## Enum: ExperienceEnum


* `agent` (value: `"agent"`)

* `default` (value: `"default"`)




