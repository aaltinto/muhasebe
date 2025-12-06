import { payments } from "../../../db/paymentLines";
import { accountLine } from "../../../db/productLines";

export default function calculateTotals(
  combinedLines: Array<
    | ({ kind: "product" } & accountLine)
    | ({
        kind: "payment";
      } & payments)
  >
) {
    let totalnet_price = 0, totalDiscount = 0, totalTax = 0, totalGross = 0, totalPayment = 0;
    for (const lines of combinedLines) {
        if (lines.kind === "product") {
            const net_price = parseFloat(lines.net_price) || 0;
            const amount = parseFloat(lines.amount) || 0;
            const discount = parseFloat(lines.discount) || 0;
            const taxRate = parseFloat(lines.tax) || 0;
            const price = parseFloat(lines.price) || 0;

            totalnet_price += net_price * amount;
            totalDiscount += discount * amount;
            totalTax += (price - discount) * (taxRate / 100) * amount;
            totalGross += price * amount;

        } else if (lines.kind === "payment") {
            const payment = parseFloat(lines.payment) || 0;
            totalPayment += payment;
        }

    }

    return {
        totalnet_price,
        totalDiscount,
        totalTax,
        totalGross,
        totalPayment
    }
}
