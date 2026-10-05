const SERVICE_CHARGE_RATE = 0.05; // 5% of food cost
const TAX_RATE = 0.05; // 5% GST-style tax
const ADVANCE_RATE = 0.3; // 30% advance required

/**
 * Calculates the full price breakdown for a booking.
 * @param {number} guestCount
 * @param {Array<{pricePerPerson:number}>} selectedMenu
 * @param {Array<{price:number}>} additionalServices
 */
const calculatePrice = (guestCount, selectedMenu = [], additionalServices = []) => {
  const pricePerPerson = selectedMenu.reduce((sum, item) => sum + Number(item.pricePerPerson || 0), 0);
  const foodCost = pricePerPerson * guestCount;

  const additionalServicesCost = additionalServices.reduce(
    (sum, s) => sum + Number(s.price || 0),
    0
  );

  const serviceCharges = Math.round(foodCost * SERVICE_CHARGE_RATE) + additionalServicesCost;
  const taxableAmount = foodCost + serviceCharges;
  const taxes = Math.round(taxableAmount * TAX_RATE);

  const totalAmount = foodCost + serviceCharges + taxes;
  const advanceAmount = Math.round(totalAmount * ADVANCE_RATE);
  const remainingAmount = totalAmount - advanceAmount;

  return {
    pricePerPerson,
    foodCost,
    serviceCharges,
    taxes,
    totalAmount,
    advanceAmount,
    remainingAmount,
  };
};

module.exports = { calculatePrice, SERVICE_CHARGE_RATE, TAX_RATE, ADVANCE_RATE };
