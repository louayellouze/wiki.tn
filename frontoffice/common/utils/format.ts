/**
 * Formats a price number into the format: "1 509,00 TND"
 * Uses 'fr-FR' locale for comma decimal separator and space as thousands separator.
 */
export const formatPrice = (price: number): string => {
    if (price === undefined || price === null) return "0,00 TND";

    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price).replace(/\u00a0/g, ' ') + ' TND';
};
