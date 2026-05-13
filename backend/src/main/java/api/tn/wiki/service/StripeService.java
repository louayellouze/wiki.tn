package api.tn.wiki.service;

import api.tn.wiki.entity.Order;
import api.tn.wiki.entity.RepairQuote;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String secretKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Value("${stripe.currency:eur}")
    private String currency;

    private final OrderService orderService;
    private final RepairQuoteService repairQuoteService;

    public StripeService(@Lazy OrderService orderService, @Lazy RepairQuoteService repairQuoteService) {
        this.orderService = orderService;
        this.repairQuoteService = repairQuoteService;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public String createCheckoutSession(Order order) throws Exception {
        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/order-success?orderId=" + order.getId())
                .setCancelUrl(frontendUrl + "/checkout?order_cancel=true")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(currency)
                                                .setUnitAmount((long) (order.getTotalAmount() * 100))
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Commande Wiki.tn #" + order.getId())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .setClientReferenceId(order.getId().toString())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    public String createRepairQuoteCheckoutSession(RepairQuote quote) throws Exception {
        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/profile?repair_payment=success&quoteId=" + quote.getId())
                .setCancelUrl(frontendUrl + "/profile?repair_payment=cancel")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(currency)
                                                .setUnitAmount((long) (quote.getTotalPrice() * 100))
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Réparation Wiki.tn — Devis #" + quote.getId())
                                                                .setDescription("Appareil : " + quote.getRepairRequest().getBrand() + " " + quote.getRepairRequest().getModel())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .setClientReferenceId("REPAIR_" + quote.getId())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    public void handleWebhookEvent(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            System.err.println("Webhook signature verification failed: " + e.getMessage());
            return;
        }

        System.out.println("Stripe Webhook received: " + event.getType());

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                String refId = session.getClientReferenceId();
                if (refId != null) {
                    try {
                        if (refId.startsWith("REPAIR_")) {
                            Long quoteId = Long.parseLong(refId.substring(7));
                            repairQuoteService.markQuoteAsPaid(quoteId, session.getId());
                            System.out.println("Repair Quote #" + quoteId + " marked as PAID via Stripe Webhook");
                        } else {
                            Long orderId = Long.parseLong(refId);
                            orderService.markOrderAsPaid(orderId, session.getId());
                            System.out.println("Order #" + orderId + " marked as PAID via Stripe Webhook");
                        }
                    } catch (Exception e) {
                        System.err.println("Error processing webhook for ref: " + refId + " - " + e.getMessage());
                    }
                }
            }
        }
    }
}
