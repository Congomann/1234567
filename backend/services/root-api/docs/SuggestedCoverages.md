# RootEmbeddedApi.SuggestedCoverages

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**coverages** | [**DisplayCoverages**](DisplayCoverages.md) |  | 
**_default** | **Boolean** | This coverage package is configured as the default package for your integration | [optional] 
**description** | **String** | A human readable description of this quote. | 
**derivedFromPriorCoverage** | **Boolean** | Was the customer&#39;s current coverages levels factored in generating this quote. | 
**fullTermPayment** | [**Payment**](Payment.md) |  | [optional] 
**monthlyTermPayments** | [**[Payment]**](Payment.md) | The payments required if the customer pays for the 6-month policy monthly. | [optional] 
**name** | **String** | A human readable name for this quote. | 
**priority** | **Number** | The relative order in which a coverage strategy is recommended, where lower numeric values indicate higher priority. | [optional] 


