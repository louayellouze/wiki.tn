package api.tn.wiki.service;

import api.tn.wiki.entity.Coupon;
import api.tn.wiki.repository.CouponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CouponService {

    private final CouponRepository couponRepository;
    private final org.springframework.mail.javamail.JavaMailSender mailSender;

    public CouponService(CouponRepository couponRepository, org.springframework.mail.javamail.JavaMailSender mailSender) {
        this.couponRepository = couponRepository;
        this.mailSender = mailSender;
    }

    @Transactional(readOnly = true)
    public Coupon getRandomActiveCoupon() {
        List<Coupon> activeCoupons = couponRepository.findAll().stream()
                .filter(c -> c.getIsActive() && (c.getExpiryDate() == null || c.getExpiryDate().isAfter(LocalDateTime.now())))
                .collect(java.util.stream.Collectors.toList());
        
        if (activeCoupons.isEmpty()) {
            return null;
        }
        
        return activeCoupons.get(new java.util.Random().nextInt(activeCoupons.size()));
    }

    public void sendCouponWinEmail(String email, Coupon coupon) {
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom("louayellouze01@gmail.com");
            helper.setTo(email);
            helper.setSubject("🎁 Félicitations ! Vous avez gagné un coupon Wiki.tn");
            
            String expiry = coupon.getExpiryDate() != null 
                ? coupon.getExpiryDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) 
                : "Sans expiration";
            
            String discountStr = coupon.getDiscountValue() + (coupon.getDiscountType() == Coupon.DiscountType.PERCENT ? "%" : " DT");

            String html = "<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'></head>"
                    + "<body style='margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;'>"
                    + "<table width='100%' cellspacing='0' cellpadding='0' style='background:#f4f7fa;padding:40px 0;'>"
                    + "<tr><td align='center'>"
                    + "<table width='600' cellspacing='0' cellpadding='0' style='background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);'>"
                    + "<tr><td style='background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:60px 40px;text-align:center;'>"
                    + "<div style='background:rgba(255,255,255,0.2);width:80px;height:80px;border-radius:20px;margin:0 auto 24px;display:flex;align-items:center;justify-center;'>"
                    + "<span style='font-size:40px;line-height:80px;'>🎉</span>"
                    + "</div>"
                    + "<h1 style='color:#fff;margin:0 0 10px;font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;'>C'est gagné !</h1>"
                    + "<p style='color:rgba(255,255,255,0.9);margin:0;font-size:16px;'>Vous êtes l'heureux gagnant de notre Roue de la Fortune</p>"
                    + "</td></tr>"
                    + "<tr><td style='padding:50px 40px;text-align:center;'>"
                    + "<p style='color:#64748b;font-size:16px;margin:0 0 40px;'>Utilisez ce code lors de votre prochaine commande pour profiter de votre réduction :</p>"
                    + "<div style='background:#f8fafc;border:2px dashed #cbd5e1;border-radius:20px;padding:40px;margin-bottom:40px;'>"
                    + "<div style='color:#059669;font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;'>Votre Coupon</div>"
                    + "<div style='color:#1e293b;font-size:48px;font-weight:900;letter-spacing:4px;margin-bottom:12px;'>" + coupon.getCode() + "</div>"
                    + "<div style='display:inline-block;background:#10b981;color:#fff;padding:8px 20px;border-radius:50px;font-size:24px;font-weight:900;'>" + discountStr + " OFF</div>"
                    + "</div>"
                    + "<table width='100%' cellspacing='0' cellpadding='0' style='border-top:1px solid #f1f5f9;padding-top:30px;'>"
                    + "<tr>"
                    + "<td width='50%' style='text-align:left;'>"
                    + "<div style='color:#94a3b8;font-size:11px;text-transform:uppercase;font-weight:700;'>Minimum d'achat</div>"
                    + "<div style='color:#1e293b;font-size:16px;font-weight:700;'>" + coupon.getMinOrderAmount() + " DT</div>"
                    + "</td>"
                    + "<td width='50%' style='text-align:right;'>"
                    + "<div style='color:#94a3b8;font-size:11px;text-transform:uppercase;font-weight:700;'>Valable jusqu'au</div>"
                    + "<div style='color:#1e293b;font-size:16px;font-weight:700;'>" + expiry + "</div>"
                    + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "<div style='margin-top:50px;'>"
                    + "<a href='http://localhost:3000' style='display:inline-block;background:#1e293b;color:#fff;text-decoration:none;padding:20px 40px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 20px rgba(30,41,59,0.2);'>Profiter de mon cadeau</a>"
                    + "</div>"
                    + "</td></tr>"
                    + "<tr><td style='background:#f8fafc;padding:30px;text-align:center;border-top:1px solid #f1f5f9;'>"
                    + "<p style='color:#94a3b8;font-size:12px;margin:0;'>Cet email a été envoyé par Wiki.tn. Merci de votre confiance !</p>"
                    + "</td></tr>"
                    + "</table></td></tr></table></body></html>";

            helper.setText(html, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ Email coupon envoyé avec succès à " + email);
        } catch (Exception e) {
            System.err.println("❌ Échec de l'envoi de l'email coupon : " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(Long id, Coupon details) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        coupon.setCode(details.getCode());
        coupon.setDiscountType(details.getDiscountType());
        coupon.setDiscountValue(details.getDiscountValue());
        coupon.setMinOrderAmount(details.getMinOrderAmount());
        coupon.setExpiryDate(details.getExpiryDate());
        coupon.setIsActive(details.getIsActive());
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    public Coupon validateCoupon(String code, Double orderAmount) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Coupon invalide"));

        if (!coupon.getIsActive()) {
            throw new RuntimeException("Coupon inactif");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Coupon expiré");
        }

        if (orderAmount < coupon.getMinOrderAmount()) {
            throw new RuntimeException("Montant minimum de commande non atteint (" + coupon.getMinOrderAmount() + " DT)");
        }

        return coupon;
    }
}
