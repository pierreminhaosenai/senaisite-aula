// script.js - Toda a lógica do site

// ======================== DADOS DOS PRODUTOS =========================
const products = [
  { id: 1, name: 'Coleira Peitoral Cão', price: 59.90, category: 'caes', image: '🐕', desc: 'Coleira ajustável para cães de pequeno e médio porte.' },
  { id: 2, name: 'Arranhador Gato', price: 89.90, category: 'gatos', image: '🐈', desc: 'Arranhador com poste e brinquedo pendurado.' },
  { id: 3, name: 'Bolinha de Borracha', price: 19.90, category: 'brinquedos', image: '⚽', desc: 'Bolinha resistente para cães e gatos.' },
  { id: 4, name: 'Shampoo Antipulgas', price: 34.90, category: 'higiene', image: '🧴', desc: 'Shampoo para cães e gatos, ação antipulgas.' },
  { id: 5, name: 'Ração Premium Cão', price: 129.90, category: 'caes', image: '🍖', desc: 'Ração sabor carne para cães adultos.' },
  { id: 6, name: 'Cama Conforto', price: 149.90, category: 'gatos', image: '🛏️', desc: 'Cama macia para gatos, tamanho único.' },
  { id: 7, name: 'Mordedor Osso', price: 25.90, category: 'brinquedos', image: '🦴', desc: 'Brinquedo mordedor para cães.' },
  { id: 8, name: 'Escova de Pelo', price: 22.90, category: 'higiene', image: '🧽', desc: 'Escova para remoção de pelos mortos.' }
];

// ======================== ESTADO GLOBAL ==============================
let cart = JSON.parse(localStorage.getItem('petCart')) || [];
let currentFilter = 'all';
let darkMode = false;

// ======================== ELEMENTOS DOM ==============================
const productGrid = document.getElementById('productGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartItemsDiv = document.getElementById('cartItems');
const cartTotalSpan = document.getElementById('cartTotal');
const overlay = document.getElementById('overlay');
const closeCartBtn = document.getElementById('closeCart');
const cartToggle = document.getElementById('cartToggle');
const checkoutBtn = document.getElementById('checkoutBtn');
const modal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close-modal');
const contactForm = document.getElementById('contactForm');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const nav = document.getElementById('nav');
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotBox = document.getElementById('chatbotBox');
const closeChat = document.getElementById('closeChat');
const sendChat = document.getElementById('sendChat');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

// ======================== FUNÇÕES DE PRODUTO =========================
function renderProducts(filter = 'all') {
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  productGrid.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-image">${p.image}</div>
      <div class="product-info">
        <div class="product-title">${p.name}</div>
        <div class="product-price">R$ ${p.price.toFixed(2)}</div>
        <button class="product-btn add-to-cart" data-id="${p.id}">Adicionar</button>
      </div>
    </div>
  `).join('');

  // Event listeners para cada botão "Adicionar"
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      addToCart(id);
    });
  });

  // Abrir modal ao clicar no card
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('add-to-cart')) {
        const id = parseInt(card.dataset.id);
        openProductModal(id);
      }
    });
  });
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
  saveCart();
  openCartSidebar(); // feedback visual
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
  saveCart();
}

function updateCart() {
  // Atualizar contador
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.textContent = totalItems;

  // Atualizar itens no sidebar
  if (cartItemsDiv) {
    if (cart.length === 0) {
      cartItemsDiv.innerHTML = '<p>Carrinho vazio</p>';
    } else {
      cartItemsDiv.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
          </div>
          <span class="cart-item-remove" data-id="${item.id}">🗑️</span>
        </div>
      `).join('');
    }

    // Total
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    cartTotalSpan.textContent = total.toFixed(2);

    // Eventos remover
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.dataset.id);
        removeFromCart(id);
      });
    });
  }
}

function saveCart() {
  localStorage.setItem('petCart', JSON.stringify(cart));
}

function openCartSidebar() {
  cartSidebar.classList.add('open');
  overlay.classList.add('show');
}

function closeCartSidebar() {
  cartSidebar.classList.remove('open');
  overlay.classList.remove('show');
}

// Modal de produto
function openProductModal(id) {
  const product = products.find(p => p.id === id);
  modalBody.innerHTML = `
    <div style="text-align: center; font-size:5rem;">${product.image}</div>
    <h2>${product.name}</h2>
    <p>${product.desc}</p>
    <p class="product-price">R$ ${product.price.toFixed(2)}</p>
    <button class="btn btn-primary" id="buyWhatsApp">Comprar via WhatsApp</button>
    <button class="btn btn-primary" id="addFromModal">Adicionar ao carrinho</button>
  `;
  modal.style.display = 'block';

  document.getElementById('buyWhatsApp').addEventListener('click', () => {
    const msg = `Olá! Tenho interesse em ${product.name} (R$ ${product.price.toFixed(2)})`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`, '_blank');
  });

  document.getElementById('addFromModal').addEventListener('click', () => {
    addToCart(id);
    modal.style.display = 'none';
  });
}

// ======================== FILTROS ==============================
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderProducts(currentFilter);
  });
});

// ======================== CARRINHO ==============================
cartToggle.addEventListener('click', (e) => {
  e.preventDefault();
  openCartSidebar();
});

closeCartBtn.addEventListener('click', closeCartSidebar);
overlay.addEventListener('click', closeCartSidebar);

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Carrinho vazio!');
    return;
  }
  const items = cart.map(i => `${i.name} (${i.quantity})`).join(', ');
  const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2);
  const msg = `Olá! Quero finalizar compra: ${items}. Total: R$ ${total}`;
  window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`, '_blank');
  closeCartSidebar();
});

// ======================== CATEGORIAS ==============================
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    const cat = card.dataset.cat;
    document.querySelector(`.filter-btn[data-filter="${cat}"]`).click();
    document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
  });
});

// ======================== MODAL ==============================
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

// ======================== CHATBOT IA SIMULADA =========================
const botResponses = {
  'horário': 'Funcionamos de segunda a sábado, das 9h às 19h.',
  'horario': 'Funcionamos de segunda a sábado, das 9h às 19h.',
  'produtos': 'Temos coleiras, brinquedos, itens de higiene e muito mais! Acesse a seção "Produtos".',
  'pagamento': 'Aceitamos cartão de crédito, débito, PIX e boleto.',
  'preço': 'Os preços variam de R$10 a R$200. Veja nossos produtos!',
  'default': 'Desculpe, não entendi. Posso ajudar com horários, produtos ou pagamentos.'
};

function addMessage(text, sender = 'user') {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processChat(input) {
  const lower = input.toLowerCase();
  let reply = botResponses.default;
  for (let key in botResponses) {
    if (lower.includes(key)) {
      reply = botResponses[key];
      break;
    }
  }
  setTimeout(() => addMessage(reply, 'bot'), 500);
}

sendChat.addEventListener('click', () => {
  const msg = chatInput.value.trim();
  if (!msg) return;
  addMessage(msg, 'user');
  chatInput.value = '';
  processChat(msg);
});

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendChat.click();
});

chatbotToggle.addEventListener('click', () => {
  chatbotBox.classList.toggle('open');
});

closeChat.addEventListener('click', () => {
  chatbotBox.classList.remove('open');
});

// ======================== CONTATO FORM ==============================
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const msg = document.getElementById('contactMsg').value.trim();

  if (!name || !email || !msg) {
    alert('Preencha todos os campos!');
    return;
  }
  if (!email.includes('@') || !email.includes('.')) {
    alert('E-mail inválido');
    return;
  }

  const whatsappMsg = `Nome: ${name}%0AEmail: ${email}%0AMensagem: ${msg}`;
  window.open(`https://wa.me/5511999999999?text=${whatsappMsg}`, '_blank');
  contactForm.reset();
});

// ======================== MOBILE MENU ==============================
mobileMenuBtn.addEventListener('click', () => {
  nav.classList.toggle('show');
});

// ======================== DARK MODE (EXTRA) =========================
// Botão dark mode opcional (adicionado via JS)
const darkToggle = document.createElement('button');
darkToggle.textContent = '🌙';
darkToggle.style.position = 'fixed';
darkToggle.style.bottom = '160px';
darkToggle.style.right = '20px';
darkToggle.style.zIndex = '150';
darkToggle.style.padding = '10px 15px';
darkToggle.style.borderRadius = '50px';
darkToggle.style.background = 'var(--dark)';
darkToggle.style.color = 'white';
darkToggle.style.border = 'none';
darkToggle.style.cursor = 'pointer';
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  darkToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});
document.body.appendChild(darkToggle);

// ======================== ANIMAÇÕES AO SCROLL =========================
function revealOnScroll() {
  const reveals = document.querySelectorAll('.section-title, .product-card, .testimonial-card');
  reveals.forEach(el => {
    const windowHeight = window.innerHeight;
    const revealTop = el.getBoundingClientRect().top;
    const revealPoint = 150;
    if (revealTop < windowHeight - revealPoint) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
// Inicial
document.querySelectorAll('.section-title, .product-card, .testimonial-card').forEach(el => el.classList.add('reveal'));

// ======================== INICIALIZAÇÃO ==============================
renderProducts();
updateCart();