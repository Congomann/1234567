# RootEmbeddedApi.PolicyDisplayCoverage

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**attributes** | [**[DisplayCoverageAttribute]**](DisplayCoverageAttribute.md) | Attributes associated with this coverage such as limits or if it&#39;s declined. | 
**applyTo** | **String** | (Experimental) The entity this coverage applies to (&#39;policy&#39; or a specific vehicle identifier). Please see your Root representative to request access to this experimental endpoint. | 
**description** | **String** | A human readable version of the coverage and its attributes. | 
**longDescription** | **String** | (Experimental) A more detailed human readable version of the coverage and its attributes. Please see your Root representative to request access to this experimental endpoint. | 
**name** | **String** | A human readable version of the coverage symbol. | 
**pricedBy** | **String** | (Experimental) The level at which we price the coverage (&#39;policy&#39; or &#39;vehicle&#39;). Please see your Root representative to request access to this experimental endpoint. | 
**symbol** | **String** | A shorthand for the coverage kind such as &#39;umuim&#39; for Uninsured and Underinsured Motorist Bodily Injury. | 



## Enum: PricedByEnum


* `policy` (value: `"policy"`)

* `vehicle` (value: `"vehicle"`)





## Enum: SymbolEnum


* `adb` (value: `"adb"`)

* `bi` (value: `"bi"`)

* `bi_pd_combined` (value: `"bi_pd_combined"`)

* `coll` (value: `"coll"`)

* `cdw` (value: `"cdw"`)

* `comp` (value: `"comp"`)

* `custe` (value: `"custe"`)

* `fnrl` (value: `"fnrl"`)

* `med_exp` (value: `"med_exp"`)

* `med_pay` (value: `"med_pay"`)

* `pip` (value: `"pip"`)

* `pd` (value: `"pd"`)

* `rental` (value: `"rental"`)

* `roadside` (value: `"roadside"`)

* `uim` (value: `"uim"`)

* `uimpd` (value: `"uimpd"`)

* `umuim` (value: `"umuim"`)

* `um` (value: `"um"`)

* `umpd` (value: `"umpd"`)

* `wk_ls` (value: `"wk_ls"`)

* `wlb` (value: `"wlb"`)

* `tort` (value: `"tort"`)




