# RootEmbeddedApi.VehicleCoverage

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**attributes** | [**[CoverageAttribute]**](CoverageAttribute.md) | Attributes associated with this coverage such as limits or if it&#39;s declined. | 
**applyTo** | [**ApiStringValue**](ApiStringValue.md) |  | 
**description** | **String** | A human readable version of the coverage and its attributes. | 
**longDescription** | **String** | (Experimental) A more detailed human readable version of the coverage and its attributes. Please see your Root representative to request access to this experimental endpoint. | 
**name** | **String** | A human readable version of the coverage symbol. | 
**priceDescription** | **String** | A human readable version of the coverage price. | [optional] 
**priceInCents** | **Number** | The price for the coverage in cents, depending on the currently selected invoice period (i.e. monthly vs full term). Note that due to taxes, fees, and other factors, these prices per coverage cannot be naively added together to arrive at the total due today when binding the policy. For that information, look at the breakdown of payments at the top level of the quote response.  If a coverage has a null priceInCents, this does not mean the coverage is free (0 is free). | [optional] 
**pricedBy** | **String** | (Experimental) The level at which we price the coverage (&#39;policy&#39; or &#39;vehicle&#39;). Please see your Root representative to request access to this experimental endpoint. | 
**symbol** | [**VehicleCoverageSymbol**](VehicleCoverageSymbol.md) |  | 



## Enum: PricedByEnum


* `policy` (value: `"policy"`)

* `vehicle` (value: `"vehicle"`)




