/**
 * MEGAFEAST ORQUESTA INTERNACIONAL
 * Script para la galería de imágenes y menú móvil
 */

document.addEventListener('DOMContentLoaded', function() {
    // Detectar elementos animables al hacer scroll
    const animateElements = document.querySelectorAll('.pre-animate');
    
    function checkScroll() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 50) {
                element.classList.add('animate');
            }
        });
    }
    
    // Verificar al cargar la página
    checkScroll();
    
    // Verificar al hacer scroll
    window.addEventListener('scroll', checkScroll);
    
    // Menú móvil - CORREGIDO
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');
    
    // Función para cerrar el menú
    function closeMenu() {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar scroll
        }
    }
    
    // Función para abrir el menú
    function openMenu() {
        navLinks.classList.add('active');
        menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    }
    
    if (menuToggle && navLinks) {
        // Toggle del menú al hacer clic en el ícono de hamburguesa
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevenir que el evento burbujee
            
            if (navLinks.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Cerrar el menú al hacer clic en cualquier enlace
        navLinksItems.forEach(function(link) {
            link.addEventListener('click', function(e) {
                closeMenu();
                
                // Si el enlace es a un ancla en la misma página
                const href = this.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        setTimeout(function() {
                            targetElement.scrollIntoView({
                                behavior: 'smooth'
                            });
                        }, 300); // Pequeño retraso para permitir que el menú se cierre
                    }
                }
            });
        });
        
        // Cerrar el menú al presionar la tecla Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });
        
        // Cerrar el menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            // Comprobar si el clic fue fuera del menú y del botón toggle
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                closeMenu();
            }
        });
    }
    
    // Cambio de color al hacer scroll
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.main-nav');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
    
    // Funcionalidad para la galería
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('galleryModal');
    const modalImg = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close-modal');
    
    // Abrir modal al hacer clic en un elemento de la galería
    galleryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const imgUrl = this.querySelector('.gallery-front').style.backgroundImage.slice(5, -2);
            if (modal) {
                modal.classList.add('show');
                modalImg.src = imgUrl;
                document.body.style.overflow = 'hidden'; // Evitar scroll
            }
        });
    });
    
    // Cerrar modal
    if (closeModal) {
        closeModal.addEventListener('click', function(e) {
            e.preventDefault();
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = ''; // Restaurar scroll
            }
        });
    }
    
    // Cerrar modal con tecla Escape
    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal && modal.classList.contains('show')) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
    
    // Cerrar modal haciendo clic fuera de la imagen
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Forzar activación del evento scroll al inicio para verificar la posición
    window.dispatchEvent(new Event('scroll'));
});