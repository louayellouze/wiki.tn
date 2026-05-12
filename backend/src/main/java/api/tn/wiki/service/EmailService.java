package api.tn.wiki.service;

import api.tn.wiki.entity.Order;
import api.tn.wiki.entity.RepairQuote;
import api.tn.wiki.entity.RepairQuoteLine;
import api.tn.wiki.entity.RepairRequest;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderStatusEmail(Order order) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("louayellouze01@gmail.com");
            message.setTo(order.getUser().getEmail());
            
            String statusLabel = translateStatus(order.getStatus());
            message.setSubject("Mise à jour de votre commande Wiki #" + order.getId());
            
            StringBuilder content = new StringBuilder();
            content.append("Bonjour ").append(order.getUser().getFirstName()).append(",\n\n");
            content.append("Le statut de votre commande #").append(order.getId()).append(" a été mis à jour.\n\n");
            content.append("NOUVEAU STATUT : ").append(statusLabel).append("\n\n");
            
            if (order.getStatus().name().equals("SHIPPED")) {
                content.append("Bonne nouvelle ! Votre colis est en route et vous sera livré très prochainement.\n\n");
            } else if (order.getStatus().name().equals("DELIVERED")) {
                content.append("Votre commande a été livrée avec succès. Merci de votre confiance !\n\n");
            } else if (order.getStatus().name().equals("CANCELLED")) {
                content.append("Nous vous informons que votre commande a été annulée. Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter.\n\n");
            }
            
            content.append("Vous pouvez suivre l'état de votre commande à tout moment sur notre site :\n");
            content.append(frontendUrl).append("/track-order?orderId=").append(order.getId()).append("&email=").append(order.getUser().getEmail()).append("\n\n");
            content.append("Cordialement,\n");
            content.append("L'équipe Wiki.tn");
            
            message.setText(content.toString());
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Échec de l'envoi de l'email de commande : " + e.getMessage());
        }
    }

    public void sendOrderConfirmationEmail(Order order) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("louayellouze01@gmail.com");
            message.setTo(order.getUser().getEmail());
            message.setSubject("Confirmation de votre commande Wiki #" + order.getId());

            StringBuilder content = new StringBuilder();
            content.append("Bonjour ").append(order.getUser().getFirstName()).append(",\n\n");
            content.append("Merci pour votre commande chez Wiki.tn !\n\n");
            content.append("Détails de la commande #").append(order.getId()).append(" :\n");
            content.append("------------------------------------------\n");
            
            order.getItems().forEach(item -> {
                content.append("- ").append(item.getProduct().getTitle())
                       .append(" (x").append(item.getQuantity()).append(") : ")
                       .append(String.format("%.3f", item.getPrice() * item.getQuantity()))
                       .append(" TND\n");
            });

            content.append("------------------------------------------\n");
            content.append("TOTAL : ").append(String.format("%.3f", order.getTotalAmount())).append(" TND\n");
            content.append("Mode de paiement : ").append(order.getPaymentMethod().name()).append("\n");
            content.append("Adresse : ").append(order.getAddress()).append("\n\n");

            if (order.getPaymentMethod().name().equals("STRIPE")) {
                content.append("Votre paiement est en cours de traitement. Vous recevrez une confirmation dès que le paiement sera validé.\n\n");
            } else {
                content.append("Votre commande est en attente de validation par notre équipe.\n\n");
            }

            content.append("Suivez votre commande ici :\n");
            content.append(frontendUrl).append("/track-order?orderId=").append(order.getId()).append("&email=").append(order.getUser().getEmail()).append("\n\n");
            content.append("Merci de votre confiance !\n\n");
            content.append("Cordialement,\n");
            content.append("L'équipe Wiki.tn");

            message.setText(content.toString());
            mailSender.send(message);
            System.out.println("✅ Email de confirmation envoyé pour la commande #" + order.getId());
        } catch (Exception e) {
            System.err.println("❌ Échec de l'envoi de l'email de confirmation : " + e.getMessage());
        }
    }

    public void sendPaymentConfirmationEmail(Order order) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("louayellouze01@gmail.com");
            message.setTo(order.getUser().getEmail());
            message.setSubject("Paiement validé - Commande Wiki #" + order.getId());

            StringBuilder content = new StringBuilder();
            content.append("Bonjour ").append(order.getUser().getFirstName()).append(",\n\n");
            content.append("Nous avons le plaisir de vous informer que votre paiement pour la commande #").append(order.getId()).append(" a été validé avec succès.\n\n");
            content.append("MONTANT TOTAL : ").append(String.format("%.3f", order.getTotalAmount())).append(" TND\n");
            content.append("Mode de paiement : ").append(order.getPaymentMethod().name()).append("\n\n");
            content.append("Votre commande est maintenant en cours de préparation et vous sera expédiée dans les plus brefs délais.\n\n");
            content.append("Vous recevrez un nouvel email dès que votre colis sera expédié.\n\n");
            content.append("Merci de votre confiance !\n\n");
            content.append("Cordialement,\n");
            content.append("L'équipe Wiki.tn");

            message.setText(content.toString());
            mailSender.send(message);
            System.out.println("✅ Email de validation de paiement envoyé pour la commande #" + order.getId());
        } catch (Exception e) {
            System.err.println("❌ Échec de l'envoi de l'email de validation de paiement : " + e.getMessage());
        }
    }

    public void sendWelcomeEmail(api.tn.wiki.entity.User user) {
        System.out.println("📧 Tentative d'envoi d'email de BIENVENUE à : " + user.getEmail());
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("louayellouze01@gmail.com");
            message.setTo(user.getEmail());
            message.setSubject("Bienvenue chez Wiki.tn !");
            
            StringBuilder content = new StringBuilder();
            content.append("Bonjour ").append(user.getFirstName()).append(",\n\n");
            content.append("C'est un plaisir de vous compter parmi nos nouveaux clients !\n\n");
            content.append("Chez Wiki, nous nous engageons à vous offrir le meilleur de la technologie au meilleur prix. ");
            content.append("Votre compte a été créé avec succès.\n\n");
            
            content.append("IMPORTANT : Vous avez reçu un autre email pour valider votre compte. Veuillez cliquer sur le lien de validation pour pouvoir vous connecter.\n\n");
            
            content.append("CE QUE VOUS POUVEZ FAIRE MAINTENANT :\n");
            content.append("- Explorer notre large catalogue de produits informatiques.\n");
            content.append("- Suivre vos commandes en temps réel.\n");
            content.append("- Recevoir nos offres exclusives et ventes flash.\n\n");
            
            content.append("Nous sommes à votre disposition pour toute question.\n\n");
            content.append("Bienvenue dans la communauté Wiki !\n\n");
            content.append("Cordialement,\n");
            content.append("L'équipe Wiki.tn");
            
            message.setText(content.toString());
            mailSender.send(message);
            System.out.println("✅ Email de bienvenue envoyé à : " + user.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Échec de l'envoi de l'email de bienvenue : " + e.getMessage());
        }
    }

    public void sendVerificationEmail(api.tn.wiki.entity.User user) {
        System.out.println("📧 Tentative d'envoi d'email de validation à : " + user.getEmail() + " avec le token : " + user.getVerificationToken());
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom("louayellouze01@gmail.com");
            helper.setTo(user.getEmail());
            helper.setSubject("✅ Validez votre compte Wiki.tn");

            String verificationUrl = frontendUrl + "/auth/verify-email?token=" + user.getVerificationToken();
            String firstName = user.getFirstName() != null ? user.getFirstName() : "Client";

            String html = "<!DOCTYPE html>"
                + "<html lang='fr'>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:0;background-color:#f4f7fa;font-family:Arial,Helvetica,sans-serif;'>"
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background-color:#f4f7fa;padding:40px 0;'>"
                + "<tr><td align='center'>"
                + "<table role='presentation' width='600' cellspacing='0' cellpadding='0' style='background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>"
                // Header
                + "<tr><td style='background:linear-gradient(135deg,#00B140 0%,#00953B 100%);padding:40px 40px 30px 40px;text-align:center;'>"
                + "<h1 style='color:#ffffff;margin:0 0 8px 0;font-size:28px;font-weight:700;'>Wiki.tn</h1>"
                + "<p style='color:rgba(255,255,255,0.9);margin:0;font-size:14px;letter-spacing:0.5px;'>Votre partenaire tech de confiance</p>"
                + "</td></tr>"
                // Body
                + "<tr><td style='padding:40px;'>"
                + "<h2 style='color:#1a1a2e;margin:0 0 20px 0;font-size:22px;'>Bonjour " + firstName + " 👋</h2>"
                + "<p style='color:#4a4a68;font-size:16px;line-height:1.6;margin:0 0 10px 0;'>Merci de vous être inscrit sur <strong>Wiki.tn</strong> !</p>"
                + "<p style='color:#4a4a68;font-size:16px;line-height:1.6;margin:0 0 30px 0;'>Pour activer votre compte et profiter de tous nos services, veuillez cliquer sur le bouton ci-dessous :</p>"
                // CTA Button
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0'>"
                + "<tr><td align='center' style='padding:10px 0 30px 0;'>"
                + "<a href='" + verificationUrl + "' target='_blank' style='display:inline-block;background:linear-gradient(135deg,#00B140 0%,#00953B 100%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(0,177,64,0.3);'>Activer mon compte</a>"
                + "</td></tr></table>"
                // Info box
                + "<div style='background-color:#f0faf3;border-left:4px solid #00B140;border-radius:8px;padding:16px 20px;margin-bottom:25px;'>"
                + "<p style='color:#2d6a3f;font-size:14px;margin:0;line-height:1.5;'>💡 <strong>Ce lien est valable une seule fois.</strong> Si vous n'avez pas demandé cette inscription, vous pouvez simplement ignorer cet email.</p>"
                + "</div>"
                // Fallback link
                + "<p style='color:#8888a2;font-size:13px;line-height:1.5;margin:0 0 5px 0;'>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>"
                + "<p style='color:#00B140;font-size:12px;word-break:break-all;margin:0;'>" + verificationUrl + "</p>"
                + "</td></tr>"
                // Footer
                + "<tr><td style='background-color:#f8f9fb;padding:24px 40px;border-top:1px solid #e8ecf1;text-align:center;'>"
                + "<p style='color:#8888a2;font-size:13px;margin:0 0 8px 0;'>© 2026 Wiki.tn — Tous droits réservés</p>"
                + "<p style='color:#aaaabc;font-size:12px;margin:0;'>Cet email a été envoyé à <strong>" + user.getEmail() + "</strong></p>"
                + "</td></tr>"
                + "</table>"
                + "</td></tr></table>"
                + "</body></html>";

            helper.setText(html, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ Email de validation envoyé à : " + user.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Échec de l'envoi de l'email de validation : " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendStockNotificationEmail(api.tn.wiki.entity.User user, api.tn.wiki.entity.Product product) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("louayellouze01@gmail.com");
            message.setTo(user.getEmail());
            message.setSubject("Bonne nouvelle ! " + product.getTitle() + " est de retour en stock");

            StringBuilder content = new StringBuilder();
            content.append("Bonjour ").append(user.getFirstName()).append(",\n\n");
            content.append("Vous nous aviez demandé de vous prévenir quand le produit suivant serait de nouveau disponible :\n\n");
            content.append("PRODUIT : ").append(product.getTitle()).append("\n");
            content.append("PRIX : ").append(String.format("%.3f", product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getRegularPrice())).append(" TND\n\n");
            
            content.append("C'est chose faite ! Le produit est maintenant disponible sur notre site.\n\n");
            content.append("Ne tardez pas, les stocks sont limités !\n\n");
            
            content.append("Lien vers le produit : http://localhost:3000/products/").append(product.getSlug()).append("\n\n");

            content.append("Cordialement,\n");
            content.append("L'équipe Wiki.tn");

            message.setText(content.toString());
            mailSender.send(message);
            System.out.println("✅ Email de notification de stock envoyé à : " + user.getEmail() + " pour le produit : " + product.getTitle());
        } catch (Exception e) {
            System.err.println("❌ Échec de l'envoi de l'email de notification de stock : " + e.getMessage());
        }
    }

    public void sendRepairQuoteEmail(RepairRequest repairRequest, RepairQuote quote) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom("louayellouze01@gmail.com");
            helper.setTo(repairRequest.getEmail());
            helper.setSubject("📋 Votre devis de réparation Wiki — " + repairRequest.getSubject());

            String acceptUrl = frontendUrl + "/repair/quote/" + quote.getId() + "/accept";
            String rejectUrl = frontendUrl + "/repair/quote/" + quote.getId() + "/reject";
            String firstName = repairRequest.getFirstName();

            StringBuilder linesHtml = new StringBuilder();
            for (RepairQuoteLine line : quote.getLines()) {
                linesHtml.append("<tr>")
                        .append("<td style='padding:10px 16px;border-bottom:1px solid #e8ecf1;color:#333;'>").append(line.getDescription()).append("</td>")
                        .append("<td style='padding:10px 16px;border-bottom:1px solid #e8ecf1;text-align:center;color:#555;'>").append(line.getQuantity()).append("</td>")
                        .append("<td style='padding:10px 16px;border-bottom:1px solid #e8ecf1;text-align:right;color:#555;'>").append(String.format("%.3f TND", line.getUnitPrice())).append("</td>")
                        .append("<td style='padding:10px 16px;border-bottom:1px solid #e8ecf1;text-align:right;font-weight:600;color:#1a1a2e;'>").append(String.format("%.3f TND", line.getTotalPrice())).append("</td>")
                        .append("</tr>");
            }

            String adminNoteHtml = (quote.getAdminNote() != null && !quote.getAdminNote().isBlank())
                    ? "<div style='background:#f0faf3;border-left:4px solid #00B140;border-radius:8px;padding:14px 18px;margin:20px 0;'>"
                    + "<p style='margin:0;color:#2d6a3f;font-size:14px;'><strong>Note du technicien :</strong> " + quote.getAdminNote() + "</p></div>"
                    : "";

            String html = "<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'></head>"
                    + "<body style='margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;'>"
                    + "<table width='100%' cellspacing='0' cellpadding='0' style='background:#f4f7fa;padding:40px 0;'>"
                    + "<tr><td align='center'>"
                    + "<table width='620' cellspacing='0' cellpadding='0' style='background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>"
                    // Header
                    + "<tr><td style='background:linear-gradient(135deg,#00B140 0%,#00953B 100%);padding:36px 40px;text-align:center;'>"
                    + "<h1 style='color:#fff;margin:0 0 6px;font-size:26px;font-weight:700;'>Wiki.tn</h1>"
                    + "<p style='color:rgba(255,255,255,0.85);margin:0;font-size:14px;'>Service de réparation</p>"
                    + "</td></tr>"
                    // Body
                    + "<tr><td style='padding:36px 40px;'>"
                    + "<h2 style='color:#1a1a2e;margin:0 0 16px;font-size:20px;'>Bonjour " + firstName + ",</h2>"
                    + "<p style='color:#555;font-size:15px;line-height:1.6;margin:0 0 8px;'>Votre demande de réparation a été étudiée par notre équipe technique.</p>"
                    + "<p style='color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;'>Veuillez trouver ci-dessous le devis correspondant à votre appareil : <strong>" + repairRequest.getBrand() + " " + repairRequest.getModel() + "</strong></p>"
                    + adminNoteHtml
                    // Table devis
                    + "<table width='100%' cellspacing='0' cellpadding='0' style='border:1px solid #e8ecf1;border-radius:10px;overflow:hidden;margin-bottom:20px;'>"
                    + "<thead><tr style='background:#f8f9fb;'>"
                    + "<th style='padding:12px 16px;text-align:left;color:#888;font-size:12px;font-weight:600;letter-spacing:0.5px;'>PRESTATION</th>"
                    + "<th style='padding:12px 16px;text-align:center;color:#888;font-size:12px;font-weight:600;'>QTÉ</th>"
                    + "<th style='padding:12px 16px;text-align:right;color:#888;font-size:12px;font-weight:600;'>PRIX UNIT.</th>"
                    + "<th style='padding:12px 16px;text-align:right;color:#888;font-size:12px;font-weight:600;'>TOTAL</th>"
                    + "</tr></thead>"
                    + "<tbody>" + linesHtml + "</tbody>"
                    + "<tfoot><tr style='background:#f8f9fb;'>"
                    + "<td colspan='3' style='padding:14px 16px;text-align:right;font-weight:700;color:#1a1a2e;font-size:15px;'>TOTAL DEVIS</td>"
                    + "<td style='padding:14px 16px;text-align:right;font-weight:700;color:#00B140;font-size:16px;'>" + String.format("%.3f TND", quote.getTotalPrice()) + "</td>"
                    + "</tr></tfoot>"
                    + "</table>"
                    // CTA
                    + "<p style='color:#555;font-size:14px;margin:0 0 20px;'>Pour donner suite à ce devis, veuillez cliquer sur l'un des boutons ci-dessous :</p>"
                    + "<table width='100%' cellspacing='0' cellpadding='0'><tr>"
                    + "<td align='center' style='padding:0 8px 0 0;'>"
                    + "<a href='" + acceptUrl + "' style='display:block;background:linear-gradient(135deg,#00B140,#00953B);color:#fff;text-decoration:none;padding:14px 0;border-radius:50px;font-size:15px;font-weight:700;text-align:center;'>✅ Accepter le devis</a>"
                    + "</td>"
                    + "<td align='center' style='padding:0 0 0 8px;'>"
                    + "<a href='" + rejectUrl + "' style='display:block;background:#fff;color:#e53e3e;text-decoration:none;padding:14px 0;border-radius:50px;font-size:15px;font-weight:700;text-align:center;border:2px solid #e53e3e;'>❌ Refuser le devis</a>"
                    + "</td>"
                    + "</tr></table>"
                    + "<p style='color:#aaa;font-size:12px;margin:20px 0 0;text-align:center;'>Ce devis est valable 7 jours. Pour toute question, répondez à cet email.</p>"
                    + "</td></tr>"
                    // Footer
                    + "<tr><td style='background:#f8f9fb;padding:20px 40px;border-top:1px solid #e8ecf1;text-align:center;'>"
                    + "<p style='color:#aaa;font-size:12px;margin:0;'>© 2026 Wiki.tn — Tous droits réservés</p>"
                    + "</td></tr>"
                    + "</table></td></tr></table></body></html>";

            helper.setText(html, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ Email de devis envoyé à : " + repairRequest.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Échec de l'envoi du devis par email : " + e.getMessage());
        }
    }

    public void sendRepairQuoteResponseToAdminEmail(RepairQuote quote) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("louayellouze01@gmail.com");
            message.setTo("louayellouze01@gmail.com");
            
            RepairRequest req = quote.getRepairRequest();
            String status = "ACCEPTED".equals(quote.getStatus()) ? "✅ ACCEPTÉ" : "❌ REFUSÉ";
            
            message.setSubject(status + " — Devis Réparation #" + quote.getId() + " (" + req.getFirstName() + " " + req.getLastName() + ")");
            
            StringBuilder content = new StringBuilder();
            content.append("Le client ").append(req.getFirstName()).append(" ").append(req.getLastName()).append(" a répondu à votre devis.\n\n");
            content.append("DÉCISION : ").append(status).append("\n");
            content.append("APPAREIL : ").append(req.getBrand()).append(" ").append(req.getModel()).append("\n");
            content.append("MONTANT : ").append(String.format("%.3f TND", quote.getTotalPrice())).append("\n\n");
            
            content.append("Vous pouvez consulter les détails sur le backoffice :\n");
            content.append(frontendUrl.replace("3000", "3001")).append("/repair-requests\n\n");
            
            content.append("Cordialement,\n");
            content.append("Système Wiki.tn");
            
            message.setText(content.toString());
            mailSender.send(message);
            System.out.println("✅ Notification admin envoyée pour le devis #" + quote.getId());
        } catch (Exception e) {
            System.err.println("❌ Échec de l'envoi de la notification admin : " + e.getMessage());
        }
    }

    public void sendRepairStatusUpdateEmail(RepairRequest request) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom("louayellouze01@gmail.com");
            helper.setTo(request.getEmail());
            
            String statusLabel = switch (request.getStatus()) {
                case "PENDING" -> "En attente";
                case "IN_PROGRESS" -> "En cours de réparation";
                case "COMPLETED" -> "Réparation terminée";
                case "CANCELLED" -> "Annulée";
                default -> request.getStatus();
            };
            
            helper.setSubject("🛠️ Wiki Repair — Mise à jour de votre demande #" + request.getId());

            String trackingUrl = frontendUrl + "/profile"; // Ou un lien direct si existant
            String firstName = request.getFirstName();

            String html = "<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'></head>"
                    + "<body style='margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;'>"
                    + "<table width='100%' cellspacing='0' cellpadding='0' style='background:#f4f7fa;padding:40px 0;'>"
                    + "<tr><td align='center'>"
                    + "<table width='600' cellspacing='0' cellpadding='0' style='background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>"
                    + "<tr><td style='background:linear-gradient(135deg,#00B140 0%,#00953B 100%);padding:40px;text-align:center;'>"
                    + "<h1 style='color:#fff;margin:0 0 8px;font-size:28px;'>Wiki.tn</h1>"
                    + "<p style='color:rgba(255,255,255,0.9);margin:0;font-size:14px;'>Service après-vente & Réparation</p>"
                    + "</td></tr>"
                    + "<tr><td style='padding:40px;'>"
                    + "<h2 style='color:#1a1a2e;margin:0 0 20px;font-size:22px;'>Bonjour " + firstName + " 👋</h2>"
                    + "<p style='color:#4a4a68;font-size:16px;line-height:1.6;margin:0 0 20px;'>Le statut de votre demande de réparation <strong>#" + request.getId() + "</strong> a évolué.</p>"
                    + "<div style='background-color:#f8f9fb;border-radius:12px;padding:24px;margin-bottom:30px;border:1px solid #e8ecf1;text-align:center;'>"
                    + "<p style='color:#8888a2;font-size:12px;text-transform:uppercase;margin:0 0 8px;letter-spacing:1px;font-weight:700;'>Nouveau Statut</p>"
                    + "<p style='color:#00B140;font-size:24px;font-weight:800;margin:0;'>" + statusLabel + "</p>"
                    + "</div>"
                    + "<p style='color:#4a4a68;font-size:16px;line-height:1.6;margin:0 0 30px;'>Votre appareil : <strong>" + request.getBrand() + " " + request.getModel() + "</strong></p>"
                    + "<table width='100%' cellspacing='0' cellpadding='0'>"
                    + "<tr><td align='center'>"
                    + "<a href='" + trackingUrl + "' style='display:inline-block;background:#00B140;color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 4px 16px rgba(0,177,64,0.3);'>Voir ma demande</a>"
                    + "</td></tr></table>"
                    + "</td></tr>"
                    + "<tr><td style='background:#f8f9fb;padding:24px;border-top:1px solid #e8ecf1;text-align:center;'>"
                    + "<p style='color:#8888a2;font-size:13px;margin:0;'>L'équipe Wiki.tn vous remercie de votre patience.</p>"
                    + "</td></tr>"
                    + "</table></td></tr></table></body></html>";

            helper.setText(html, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ Email de mise à jour statut envoyé pour la demande #" + request.getId());
        } catch (Exception e) {
            System.err.println("❌ Échec de l'envoi de l'email de statut : " + e.getMessage());
        }
    }

    private String translateStatus(api.tn.wiki.entity.OrderStatus status) {
        return switch (status) {
            case PENDING -> "En attente";
            case CONFIRMED -> "Confirmée";
            case SHIPPED -> "Expédiée";
            case DELIVERED -> "Livrée";
            case CANCELLED -> "Annulée";
            case IN_DELIVERY_ARAMEX -> "En cours de livraison (Aramex)";
            case AWAITING_PAYMENT -> "En attente de paiement (Stripe)";
            default -> status.name();
        };
    }
}
