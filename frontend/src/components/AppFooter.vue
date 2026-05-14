<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">Dchal Store</div>
          <p class="footer-desc">
            Reseller resmi aksesoris elektronik berkualitas. Kabel, casing, earphone, charger, dan lainnya — harga bersaing, pengiriman cepat ke seluruh Indonesia.
          </p>
        </div>

        <div>
          <h4>Belanja</h4>
          <router-link to="/products?category=Kabel">Kabel</router-link>
          <router-link to="/products?category=Casing HP">Casing HP</router-link>
          <router-link to="/products?category=Earphone">Earphone</router-link>
          <router-link to="/products?category=Charger">Charger</router-link>
          <router-link to="/products?category=Powerbank">Powerbank</router-link>
        </div>

        <div>
          <h4>Bantuan</h4>
          <a href="#">Cara Belanja</a>
          <a href="#">Pengiriman</a>
          <a href="#">Pengembalian</a>
          <a href="#">FAQ</a>
        </div>

        <div>
          <h4>Pembayaran &amp; Kurir</h4>
          <div class="badges">
            <span class="vendor-badge">Midtrans</span>
            <span class="vendor-badge">GoPay</span>
            <span class="vendor-badge">QRIS</span>
            <span class="vendor-badge">BCA VA</span>
          </div>
          <div class="badges" style="margin-top: 0.75rem;">
            <span class="vendor-badge">JNE</span>
            <span class="vendor-badge">J&amp;T</span>
            <span class="vendor-badge">SiCepat</span>
            <span class="vendor-badge">AnterAja</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2025 Dchal Store. Powered by Midtrans &amp; Biteship.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-text);
  color: white;
  padding: 3rem 0 1.5rem;
  margin-top: 4rem;
}
.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}
.footer-brand {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
}
.footer-desc {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
}
.footer h4 {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
  color: var(--color-accent);
}
.footer a {
  display: block;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 0.5rem;
  transition: color 0.15s;
}
.footer a:hover { color: white; }
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.vendor-badge {
  background: rgba(255,255,255,0.1);
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
}
@media (max-width: 800px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}
@media (max-width: 500px) {
  .footer-grid { grid-template-columns: 1fr; }
}
</style>
