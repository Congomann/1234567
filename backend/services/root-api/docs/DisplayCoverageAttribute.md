# RootEmbeddedApi.DisplayCoverageAttribute

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**kind** | **String** | A discriminator indicating what kind of attribute this describes. | 
**type** | **String** | (Experimental) A discriminator indicating the true type of this attribute (declined, deductible, limits, or modifier), as &#x60;kind&#x60; may in the future be used as a more specific unique identifier. Please see your Root representative to request access to this experimental endpoint. | 
**name** | **String** | A human readable version of the kind. | 
**description** | **String** | A human readable description of the coverage attribute. | 
**longDescription** | **String** | (Experimental) A more detailed human readable description of the coverage attribute. Please see your Root representative to request access to this experimental endpoint. | 
**selectableBy** | **String** | (Experimental) The level at which a customer can select this coverage attribute (&#39;policy&#39;, &#39;vehicle&#39;, or &#39;none&#39;). Please see your Root representative to request access to this experimental endpoint. | 
**selection** | [**CoverageAttributeParametersSelection**](CoverageAttributeParametersSelection.md) |  | 



## Enum: KindEnum


* `declined` (value: `"declined"`)

* `deductible` (value: `"deductible"`)

* `limits` (value: `"limits"`)

* `tort_selection` (value: `"tort_selection"`)

* `conversion_modifier` (value: `"conversion_modifier"`)

* `enhanced_modifier` (value: `"enhanced_modifier"`)

* `income_loss_modifier` (value: `"income_loss_modifier"`)

* `full_glass_modifier` (value: `"full_glass_modifier"`)

* `resident_relatives_included_modifier` (value: `"resident_relatives_included_modifier"`)

* `stacked_modifier` (value: `"stacked_modifier"`)

* `work_loss_excluded_modifier` (value: `"work_loss_excluded_modifier"`)

* `supplemental_modifier` (value: `"supplemental_modifier"`)

* `extra_ordinary_medical_benefits_modifier` (value: `"extra_ordinary_medical_benefits_modifier"`)





## Enum: TypeEnum


* `deductible` (value: `"deductible"`)

* `limits` (value: `"limits"`)

* `modifier` (value: `"modifier"`)

* `declined` (value: `"declined"`)





## Enum: SelectableByEnum


* `policy` (value: `"policy"`)

* `vehicle` (value: `"vehicle"`)

* `none` (value: `"none"`)




