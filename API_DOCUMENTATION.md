# Criptpay Public API Documentation (v1)

Welcome to the Criptpay Public API. This API allows businesses to integrate Criptpay's offramping services directly into their own applications.

## Base URL
`https://your-domain.com/api/v1`

## Authentication
All requests to the public API must include the `x-api-key` header.

| Header | Description |
| :--- | :--- |
| `x-api-key` | Your business API key (obtained from the Criptpay dashboard) |

---

## Endpoints

### 1. Account Information
Verify your API key and retrieve business details.

**URL:** `GET /me`

**Response (200 OK):**
```json
{
  "message": "Authentication successful",
  "business": {
    "name": "My Business",
    "type": "To Customer",
    "website": "https://example.com",
    "status": "active",
    "owner": "Mubaraq"
  }
}
```

---

### 2. Utility Endpoints

#### Get Networks
List supported blockchains.
**URL:** `GET /utils/networks`

#### Get Tokens
List supported crypto tokens.
**URL:** `GET /utils/tokens`

#### Get Banks
List supported banks for offramping.
**URL:** `GET /utils/banks?country=NG`

---

### 3. Transfer Endpoints

#### Get Quote
Get a real-time quote for an offramp (rates + fees).
**URL:** `POST /transfers/quote`
**Body:** `{ "amount": 100, "asset": "base:usdc", "country": "NG", "currency": "NGN" }`

#### Initiate Transfer
Start an offramp transaction and get a deposit address.
**URL:** `POST /transfers/initiate`
**Body:** `{ "amount": 100, "fromCurrency": "USDC", "toCurrency": "NGN", "network": "Base", "bankCode": "044", "accountNumber": "1234567890", "accountName": "John Doe", "bankName": "Access Bank" }`

#### Track Status
Track the progress of a specific transaction.
**URL:** `GET /transfers/status/:transactionId`
