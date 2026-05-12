package api.tn.wiki.service;

import api.tn.wiki.dto.request.RepairQuoteLineRequest;
import api.tn.wiki.dto.request.RepairQuoteRequest;
import api.tn.wiki.entity.*;
import api.tn.wiki.repository.RepairItemRepository;
import api.tn.wiki.repository.RepairQuoteRepository;
import api.tn.wiki.repository.RepairRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.annotation.Lazy;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RepairQuoteService {

    private final RepairQuoteRepository quoteRepository;
    private final RepairRequestRepository requestRepository;
    private final RepairItemRepository itemRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final StripeService stripeService;
    private final api.tn.wiki.repository.UserRepository userRepository;

    public RepairQuoteService(RepairQuoteRepository quoteRepository,
                              RepairRequestRepository requestRepository,
                              RepairItemRepository itemRepository,
                              EmailService emailService,
                              NotificationService notificationService,
                              api.tn.wiki.repository.UserRepository userRepository,
                              @org.springframework.context.annotation.Lazy StripeService stripeService) {
        this.quoteRepository = quoteRepository;
        this.requestRepository = requestRepository;
        this.itemRepository = itemRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
    }

    @Transactional
    public RepairQuote sendQuote(Long repairRequestId, RepairQuoteRequest request) {
        RepairRequest repairRequest = requestRepository.findById(repairRequestId)
                .orElseThrow(() -> new RuntimeException("Demande de réparation introuvable : " + repairRequestId));

        // Vérifier si un devis existe déjà
        RepairQuote existingQuote = quoteRepository.findByRepairRequestId(repairRequestId).orElse(null);
        
        // REGLE METIER : Empêcher la modification si déjà accepté
        if (existingQuote != null && "ACCEPTED".equals(existingQuote.getStatus())) {
            throw new RuntimeException("Impossible de modifier un devis déjà accepté par le client.");
        }

        RepairQuote quote = (existingQuote != null) ? existingQuote : new RepairQuote();
        quote.setRepairRequest(repairRequest);
        quote.setAdminNote(request.getAdminNote());
        quote.setStatus("SENT");

        // Gérer les lignes (remplacement complet)
        if (quote.getLines() == null) {
            quote.setLines(new ArrayList<>());
        } else {
            quote.getLines().clear();
        }

        double total = 0.0;

        for (RepairQuoteLineRequest lineReq : request.getLines()) {
            RepairQuoteLine line = new RepairQuoteLine();
            line.setQuote(quote);
            line.setQuantity(lineReq.getQuantity() != null ? lineReq.getQuantity() : 1);

            if (lineReq.getRepairItemId() != null) {
                RepairItem item = itemRepository.findById(lineReq.getRepairItemId())
                        .orElseThrow(() -> new RuntimeException("Pièce introuvable : " + lineReq.getRepairItemId()));
                line.setRepairItem(item);
                line.setDescription(item.getTitle());
                double price = (lineReq.getUnitPrice() != null)
                        ? lineReq.getUnitPrice()
                        : (item.getPrice() != null ? item.getPrice() : 0.0);
                line.setUnitPrice(price);
            } else {
                line.setDescription(lineReq.getDescription());
                line.setUnitPrice(lineReq.getUnitPrice() != null ? lineReq.getUnitPrice() : 0.0);
            }

            line.setTotalPrice(line.getQuantity() * line.getUnitPrice());
            total += line.getTotalPrice();
            quote.getLines().add(line);
        }

        quote.setTotalPrice(total);

        RepairQuote saved = quoteRepository.save(quote);

        // Si la demande n'est pas déjà "IN_PROGRESS", on la met à jour
        if (!"IN_PROGRESS".equals(repairRequest.getStatus())) {
            repairRequest.setStatus("IN_PROGRESS");
            requestRepository.save(repairRequest);
        }

        emailService.sendRepairQuoteEmail(repairRequest, saved);

        notificationService.createNotification(
                "Devis de " + String.format("%.3f TND", total) + " envoyé à "
                        + repairRequest.getFirstName() + " " + repairRequest.getLastName(),
                "REPAIR_QUOTE_SENT",
                saved.getId()
        );

        return saved;
    }

    public RepairQuote getQuoteByRequestId(Long repairRequestId) {
        return quoteRepository.findByRepairRequestId(repairRequestId).orElse(null);
    }

    public RepairQuote getMyQuoteByRequestId(Long repairRequestId, String username) {
        RepairRequest repairRequest = requestRepository.findById(repairRequestId)
                .orElseThrow(() -> new RuntimeException("Demande de réparation introuvable"));

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérification de propriété
        boolean isEmailOwner = repairRequest.getEmail().equalsIgnoreCase(user.getEmail());
        boolean isPhoneOwner = user.getPhone() != null && repairRequest.getPhone().equals(user.getPhone());
        boolean isNameOwner = repairRequest.getFirstName().equalsIgnoreCase(user.getFirstName()) 
                             && repairRequest.getLastName().equalsIgnoreCase(user.getLastName());
        boolean isDirectOwner = repairRequest.getUser() != null && repairRequest.getUser().getId().equals(user.getId());

        if (!isEmailOwner && !isPhoneOwner && !isNameOwner && !isDirectOwner) {
            throw new RuntimeException("Vous n'êtes pas autorisé à consulter ce devis.");
        }

        return quoteRepository.findByRepairRequestId(repairRequestId).orElse(null);
    }

    public RepairQuote getQuoteById(Long id) {
        return quoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis introuvable : " + id));
    }

    @Transactional
    public RepairQuote respondToQuote(Long quoteId, String response) {
        RepairQuote quote = getQuoteById(quoteId);

        if (!quote.getStatus().equals("SENT")) {
            throw new RuntimeException("Ce devis a déjà reçu une réponse");
        }

        String status = "ACCEPTED".equalsIgnoreCase(response) ? "ACCEPTED" : "REJECTED";
        quote.setStatus(status);
        quote.setRespondedAt(LocalDateTime.now());

        RepairRequest repairRequest = quote.getRepairRequest();

        if ("ACCEPTED".equals(status)) {
            repairRequest.setStatus("IN_PROGRESS");
            notificationService.createNotification(
                    "✅ Devis accepté par " + repairRequest.getFirstName() + " " + repairRequest.getLastName(),
                    "REPAIR_QUOTE_ACCEPTED",
                    quoteId
            );
        } else {
            repairRequest.setStatus("CANCELLED");
            notificationService.createNotification(
                    "❌ Devis refusé par " + repairRequest.getFirstName() + " " + repairRequest.getLastName(),
                    "REPAIR_QUOTE_REJECTED",
                    quoteId
            );
        }

        emailService.sendRepairQuoteResponseToAdminEmail(quote);
        requestRepository.save(repairRequest);
        return quoteRepository.save(quote);
    }

    @Transactional
    public String initiatePayment(Long quoteId, String method) throws Exception {
        RepairQuote quote = getQuoteById(quoteId);
        if (!"ACCEPTED".equals(quote.getStatus())) {
            throw new RuntimeException("Le devis doit être accepté avant le paiement");
        }

        quote.setPaymentMethod(method);
        quoteRepository.save(quote);

        if ("CARD".equals(method)) {
            return stripeService.createRepairQuoteCheckoutSession(quote);
        }
        
        return "UPON_PICKUP_SELECTED";
    }

    @Transactional
    public void markQuoteAsPaid(Long quoteId, String stripeSessionId) {
        RepairQuote quote = getQuoteById(quoteId);
        quote.setPaymentStatus("PAID");
        quote.setStripeSessionId(stripeSessionId);
        quoteRepository.save(quote);
        
        notificationService.createNotification(
                "💰 Devis #" + quoteId + " payé par carte !",
                "REPAIR_QUOTE_PAID",
                quoteId
        );
    }
}
