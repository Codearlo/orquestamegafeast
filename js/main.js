/**
 * MEGAFEAST ORQUESTA INTERNACIONAL
 * Script principal del sitio web
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicialización general
    initNavigation();
    initGallery();
    initContactForm();
    initAnimations();
});

/**
 * Inicializa la navegación y controla el cambio de estilo al hacer scroll
 */
function initNavigation() {
    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Cambio de estilo de la barra de navegación al hacer scroll
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('nav');
        if (window.scrollY > 100) {
            nav.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            nav.style.backdropFilter = 'blur(8px)';
            nav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            nav.style.backgroundColor = 'transparent';
            nav.style.backdropFilter = 'none';
            nav.style.boxShadow = 'none';
        }
    });
    
    // Resalta el ítem de navegación activo
    highlightActiveNavItem();
}

/**
 * Resalta el elemento de navegación activo según la sección visible
 */
function highlightActiveNavItem() {
    const sections = document.querySelectorAll('section, header');
    const navItems = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * Inicializa la funcionalidad de la galería
 */
function initGallery() {
    // Verificación de pantalla táctil
    const isTouchDevice = () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    };
    
    // Ajustes para dispositivos táctiles
    if (isTouchDevice()) {
        document.body.classList.add('touch-device');
        
        // Mejora interacción táctil en galería
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            item.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 300);
            });
        });
    }
    
    // Accesibilidad para la galería
    document.querySelectorAll('.gallery-item').forEach(item => {
        // Añadir soporte para teclado
        item.setAttribute('tabindex', '0');
        
        // Flip con teclado (Enter o Space)
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.querySelector('.gallery-card').style.transform = 
                    this.querySelector('.gallery-card').style.transform === 'rotateY(180deg)' 
                        ? 'rotateY(0deg)' 
                        : 'rotateY(180deg)';
            }
        });
    });
}

/**
 * Inicializa el formulario de contacto
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // No prevenimos el envío del formulario si está configurado con FormSubmit
            // e.preventDefault();
            
            // Aquí pueden ir validaciones adicionales antes del envío
            const submitButton = contactForm.querySelector('.submit-button');
            submitButton.classList.add('loading');
            submitButton.textContent = 'Enviando...';
            
            // El resto del manejo se realiza por el script form-handler.js
        });
    }
}

/**
 * Inicializa animaciones de elementos al hacer scroll
 */
function initAnimations() {
    // Animación al hacer scroll de elementos
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.event-card, .musician-card, .gallery-item, .section-heading');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate');
            }
        });
    };
    
    // Inicializa las clases de animación
    document.querySelectorAll('.event-card, .musician-card, .gallery-item, .section-heading').forEach(el => {
        el.classList.add('pre-animate');
    });
    
    // Ejecuta la animación en el scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Ejecuta una vez al cargar para los elementos ya visibles
    animateOnScroll();
}