# RootEmbeddedApi.Quote

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | The unique identifiers for this quote. | 
**agent** | [**Agent**](Agent.md) |  | 
**finalizable** | **Boolean** | Whether or not this quote is ready to be finalized. | [optional] 
**profile** | [**Profile**](Profile.md) |  | 
**options** | [**Options**](Options.md) |  | [optional] 
**kind** | **String** | The kind of quote currently being presented. | 
**invoicePeriod** | **String** | The invoice period for this quote. This determines the frequency at which the policy holder is billed. | 
**expiresOnOrBefore** | **Date** | The latest date and time at which this quote will expire. Quotes can expire sooner, but this is the maximum time it could be valid for. | [optional] 
**status** | **String** | The status of any background actions Root is currently performing in regards to this quote. | 
**quoteReason** | **String** | The reason this quote was created. | 
**fullTermPayment** | [**Payment**](Payment.md) |  | [optional] 
**monthlyTermPayments** | [**[Payment]**](Payment.md) | The payments required if the customer pays for the 6-month policy monthly. | [optional] 
**coverages** | [**Coverages**](Coverages.md) |  | 
**originatingPolicyNumber** | **String** | The policy number of the policy that this quote originated from, if applicable. | [optional] 
**boundPolicyNumber** | **String** | The policy number of the bound policy for this quote, if applicable. | [optional] 
**rateCallId** | **String** | A reference to the last created rate call, a unique indicator of a priced quote. This value is used to reference the created price/rate call as the quote is updated. | [optional] 
**rateCall** | [**QuoteRateCall**](QuoteRateCall.md) |  | [optional] 



## Enum: KindEnum


* `none` (value: `"none"`)

* `estimated_quote` (value: `"estimated_quote"`)

* `bindable_quote` (value: `"bindable_quote"`)

* `finalized_quote` (value: `"finalized_quote"`)





## Enum: InvoicePeriodEnum


* `monthly` (value: `"monthly"`)

* `full_term` (value: `"full_term"`)





## Enum: StatusEnum


* `collecting_data` (value: `"collecting_data"`)

* `quoted` (value: `"quoted"`)

* `quoting` (value: `"quoting"`)

* `errored` (value: `"errored"`)

* `estimate_not_available` (value: `"estimate_not_available"`)

* `requirements_not_met` (value: `"requirements_not_met"`)

* `underwriting_declined` (value: `"underwriting_declined"`)

* `underwriting_pending` (value: `"underwriting_pending"`)





## Enum: QuoteReasonEnum


* `endorsement` (value: `"endorsement"`)

* `new_business` (value: `"new_business"`)




