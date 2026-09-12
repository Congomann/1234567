# RootEmbeddedApi.Policy

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**address** | [**PolicyAddress**](PolicyAddress.md) |  | 
**agentOfRecordId** | **String** | The agent of record for this policy. | 
**coverages** | [**BoundTotalCoverages**](BoundTotalCoverages.md) |  | 
**coverageStatus** | **String** | The coverages status of this policy. | 
**drivers** | [**[PolicyDriver]**](PolicyDriver.md) | The drivers covered under this policy. | 
**endDate** | **Date** | The end date of the policy in ISO 8601 date-time format. See rfc 3339 section 5.6: https://www.rfc-editor.org/rfc/rfc3339#section-5.6 | 
**homeownerStatus** | **String** | The homeowner status of the policy holder. | 
**initialLegalDocumentsAffirmedAt** | **Date** | The date the customer affirmed the legal documents presented at bind in ISO 8601 date-time format. See rfc 3339 section 5.6: https://www.rfc-editor.org/rfc/rfc3339#section-5.6 | 
**number** | **String** | The customer facing unique identifier for this policy. | 
**remainingPayments** | [**[PolicyPaymentObligation]**](PolicyPaymentObligation.md) | Future policy payment obligations. dueDate is the obligation date, not a guaranteed payment-attempt date. | [optional] 
**startDate** | **Date** | The start date of the policy in ISO 8601 date-time format. See rfc 3339 section 5.6: https://www.rfc-editor.org/rfc/rfc3339#section-5.6 | 
**totalPremium** | [**Payment**](Payment.md) |  | 
**underwritingCompany** | [**PolicyUnderwritingCompany**](PolicyUnderwritingCompany.md) |  | 
**vehicles** | [**[PolicyVehicle]**](PolicyVehicle.md) | The vehicles covered under this policy. | 



## Enum: CoverageStatusEnum


* `canceled` (value: `"canceled"`)

* `covered` (value: `"covered"`)

* `expired` (value: `"expired"`)

* `future_dated` (value: `"future_dated"`)





## Enum: HomeownerStatusEnum


* `own` (value: `"own"`)

* `rent` (value: `"rent"`)

* `other` (value: `"other"`)




