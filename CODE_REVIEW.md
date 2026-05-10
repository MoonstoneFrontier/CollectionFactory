# Full Code Review (May 10, 2026)

## Scope Reviewed
- Solidity contracts in `smartcontract/contracts`
- Smart contract test suite in `smartcontract/test`
- High-level repo/tooling checks

## Findings

### 1) **High** — Unbounded royalty value can permanently break sales/auction finalization
**Files:** `smartcontract/contracts/Marketplace.sol`

`buy()` and `finalizeAuction()` compute seller proceeds as:
- `msg.value - royaltyAmount - platformFee`
- `a.highestBid - royaltyAmount - platformFee`

If a malicious or non-compliant NFT contract reports a royalty above the sale amount (or above amount minus platform fee), subtraction underflows and the transaction reverts. Since the NFT is already escrowed in the marketplace, this can create a stuck listing.

**Recommendation:**
- Enforce `royaltyAmount <= salePrice` and `royaltyAmount + platformFee <= salePrice` before computing proceeds.
- Consider explicit custom errors for easier debugging.

---

### 2) **Medium** — Auction duration is not validated
**Files:** `smartcontract/contracts/Marketplace.sol`

`listAuction()` allows `duration == 0`. This creates auctions that end immediately (`endTime = block.timestamp`), causing confusing UX and enabling accidental unusable listings.

**Recommendation:**
- Require a minimum duration (e.g., `duration >= 5 minutes` or configurable floor).

---

### 3) **Medium** — No explicit check that the listing is an auction in `bid()`
**Files:** `smartcontract/contracts/Marketplace.sol`

`bid()` checks activity and `endTime` but does not assert `l.saleType == SaleType.AUCTION`. For fixed listings, `auctions[listingId]` has default `endTime = 0`, so bids revert with the same generic message. This is not a direct exploit but reduces clarity and maintainability.

**Recommendation:**
- Add `require(l.saleType == SaleType.AUCTION, "Not auction listing");`.

---

### 4) **Low** — `withdrawPlatformFees()` is not guarded by `nonReentrant`
**Files:** `smartcontract/contracts/Marketplace.sol`

Although owner-only and state is updated before external call, consistency with other withdrawal functions and defense-in-depth would be improved by adding `nonReentrant`.

**Recommendation:**
- Add `nonReentrant` to `withdrawPlatformFees()`.

---

### 5) **Low** — Marketplace assumes ERC2981 support for all listed NFTs
**Files:** `smartcontract/contracts/Marketplace.sol`

The code directly calls `IERC2981(...).royaltyInfo(...)`. For non-ERC2981 collections this call may revert. Depending on product goals, this may be intended, but it currently isn't documented or enforced at listing time.

**Recommendation:**
- Either enforce ERC2981 support at listing time using `supportsInterface`, or gracefully handle non-royalty NFTs by treating royalty as zero.

## Positive Notes
- Reentrancy protection is present on sensitive user-facing fund paths (`buy`, `bid`, `finalizeAuction`, `withdraw`).
- Pull-payment model for bidder refunds and proceeds is safer than immediate push transfers in most paths.
- Factory and collection ownership semantics are straightforward and understandable.

## Validation Notes
- `npm test` is not configured in `smartcontract/package.json`.
- `npx hardhat test` could not run in this environment due to compiler download proxy restriction (`HH502`, HTTP tunneling `403`).
