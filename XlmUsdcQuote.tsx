import { useMemo } from "react";

type XlmUsdcQuoteProps = {
  /** Amount of XLM to value. */
  xlmAmount: number;
  /** Reflector's latest USDC-per-XLM quote (not the inverse rate). */
  usdcPerXlm: number | null;
  /** Unix timestamp in seconds when Reflector published the quote. */
  quoteTimestamp?: number | null;
  /** Set when the parent is loading or has failed to load the oracle quote. */
  loading?: boolean;
  error?: string | null;
};

const xlmFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 7,
});

const usdcFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

/**
 * Displays an XLM amount alongside the latest Reflector USDC/XLM quote and
 * the corresponding USDC value. Fetch and validate the quote in the parent;
 * pass the price as USDC per 1 XLM.
 */
export function XlmUsdcQuote({
  xlmAmount,
  usdcPerXlm,
  quoteTimestamp,
  loading = false,
  error = null,
}: XlmUsdcQuoteProps) {
  const validQuote =
    usdcPerXlm !== null && Number.isFinite(usdcPerXlm) && usdcPerXlm >= 0;
  const validAmount = Number.isFinite(xlmAmount) && xlmAmount >= 0;

  const totalUsdc = useMemo(
    () => (validQuote && validAmount ? xlmAmount * usdcPerXlm : null),
    [validAmount, validQuote, xlmAmount, usdcPerXlm],
  );

  const updatedAt =
    quoteTimestamp != null && Number.isFinite(quoteTimestamp)
      ? new Date(quoteTimestamp * 1000).toLocaleString()
      : null;

  return (
    <section
      aria-label="XLM to USDC quote"
      style={{
        display: "grid",
        gap: "0.75rem",
        maxWidth: "28rem",
        padding: "1rem",
        border: "1px solid #d0d7de",
        borderRadius: "0.75rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <span style={{ color: "#57606a" }}>XLM amount</span>
        <strong>{validAmount ? `${xlmFormatter.format(xlmAmount)} XLM` : "— XLM"}</strong>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid #d8dee4",
        }}
      >
        <span style={{ color: "#57606a" }}>Reflector quote</span>
        <strong>
          {validQuote ? `${usdcFormatter.format(usdcPerXlm)} USDC / XLM` : "— USDC / XLM"}
        </strong>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <span style={{ color: "#57606a" }}>Estimated value</span>
        <strong style={{ color: "#0969da" }}>
          {totalUsdc === null ? "— USDC" : `${usdcFormatter.format(totalUsdc)} USDC`}
        </strong>
      </div>

      <p aria-live="polite" style={{ margin: 0, color: "#57606a", fontSize: "0.875rem" }}>
        {loading
          ? "Loading latest Reflector quote…"
          : error
            ? `Unable to load Reflector quote: ${error}`
            : !validQuote
              ? "Reflector quote unavailable"
              : updatedAt
                ? `Source: Reflector · Updated ${updatedAt}`
                : "Source: Reflector"}
      </p>
    </section>
  );
}
