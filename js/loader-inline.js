// loader-inline.js - Versión con logo embebido y más grande
// Este archivo debe incluirse directamente en el head, después de preloader.js

(function() {
    // Versión del loader - cambiar esto cuando se actualice el script
    var VERSION = '1.0.2';
    
    // Colores de la orquesta
    var bgColor = '#1A1A1A';     // Negro oscuro (fondo principal)
    var barColor = '#D4AF37';    // Dorado (color principal)
    
    // Tiempo de visualización mínimo del loader
    var totalLoadTime = 800;
    
    // Logo en Base64 para incluirlo directamente (versión pequeña optimizada)
    // IMPORTANTE: DEBES REEMPLAZAR ESTO CON TU LOGO REAL CONVERTIDO A BASE64
    // Puedes usar herramientas online como https://www.base64-image.de/ para convertir tu logo
    var fallbackLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAMAAAAOusbgAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAAzUExURUdwTBkZGRkZGRkZGRkZGRkZGRkZGUxMTExMTH9/f0xMTExMTBkZGRkZGUxMTH9/f////xphHQMAAAAQdFJOUwD3D/weiaZV3zNEtrbW5ycKd34OAAAAtElEQVRo3u3ZCQqAIBCF4XHfwvd/2sI2aJGZxvweuADfjKCIAgAAAAAAAAAAAADAHpTUUuu3h+hCmSmExuqnV3xQmW0A97CLZboBPMIxlvkG8AynWB42gBNcYnneAM5wjeV1A7jALZb3DeAKj1j6DeAGz1i+/F88Ylmj7uUey/L+aFdj+Xcv9s4eOkthGAoDN6PNWI3R//+1K0/TJVIYbtfzfXsnSJP0RK7klSsNYjXMaqt1XAEAAAAAAAAAAIBb4QnHQlom0axq5QAAAABJRU5ErkJggg==';
    
    // Añadir estilos inline para máxima velocidad
    (function injectInlineStyles() {
        var styleContent = `
            @font-face {
                font-family: 'Quicksand-Loader';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: local('Quicksand'), local('Arial'), local('sans-serif');
            }
            
            @font-face {
                font-family: 'Marcellus-Loader';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: local('Marcellus'), local('Times New Roman'), local('serif');
            }
            
            #megafeast-loader-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: ${bgColor};
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: opacity 0.3s ease;
            }
            
            .megafeast-loader-container {
                text-align: center;
                width: 300px;
            }
            
            .megafeast-loader-logo {
                margin-bottom: 20px;
                height: 150px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .megafeast-loader-logo img {
                max-width: 150px;
                max-height: 150px;
                height: auto;
            }
            
            .megafeast-loader-title {
                color: ${barColor};
                font-size: 28px;
                font-weight: bold;
                margin: 10px 0;
                font-family: 'Marcellus-Loader', 'Times New Roman', serif;
                letter-spacing: 3px;
                text-transform: uppercase;
            }
            
            .megafeast-loader-bar-container {
                width: 100%;
                height: 8px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
                margin: 20px 0;
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
            }
            
            .megafeast-loader-bar {
                width: 0%;
                height: 100%;
                background-color: ${barColor};
                transition: width 0.7s cubic-bezier(0.1, 0.7, 1.0, 0.1);
            }
            
            .megafeast-loader-text {
                color: white;
                font-size: 14px;
                font-weight: 400;
                text-transform: uppercase;
                font-family: 'Quicksand-Loader', 'Arial', sans-serif;
                letter-spacing: 1px;
                opacity: 0.9;
                height: 20px;
                line-height: 20px;
                white-space: nowrap;
            }
            
            body > *:not(#megafeast-loader-overlay) {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            body.megafeast-loader-done > *:not(#megafeast-loader-overlay) {
                opacity: 1;
            }
            
            #megafeast-loader-overlay.fade-out {
                opacity: 0;
            }
            
            body.megafeast-loader-done #megafeast-loader-overlay {
                display: none;
            }
            
            /* Animación reducida para mejor rendimiento */
            .megafeast-loader-particle {
                position: absolute;
                width: 10px;
                height: 10px;
                background-color: ${barColor};
                border-radius: 50%;
                opacity: 0;
                animation: float 4s infinite ease-in-out;
            }
            
            @keyframes float {
                0% {
                    transform: translateY(0) translateX(0) scale(0);
                    opacity: 0;
                }
                20% {
                    opacity: 0.5;
                }
                80% {
                    opacity: 0.3;
                }
                100% {
                    transform: translateY(-150px) translateX(50px) scale(0);
                    opacity: 0;
                }
            }
        `;
        
        // Crear e insertar el elemento style
        var styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        
        if (styleElement.styleSheet) {
            styleElement.styleSheet.cssText = styleContent;
        } else {
            styleElement.appendChild(document.createTextNode(styleContent));
        }
        
        // Insertar al inicio del head para máxima prioridad
        var head = document.head || document.getElementsByTagName('head')[0];
        if (head.firstChild) {
            head.insertBefore(styleElement, head.firstChild);
        } else {
            head.appendChild(styleElement);
        }
    })();
    
    // Crear el HTML del loader con imagen inline
    function createLoader() {
        var overlay = document.createElement('div');
        overlay.id = 'megafeast-loader-overlay';
        
        // Determinar qué fuente de logo usar (en orden de prioridad)
        var logoSrc = '';
        
        if (window.preloadedLogo && window.preloadedLogo.loaded && window.preloadedLogo.dataUrl) {
            // 1. Usar logo precargado si está disponible
            logoSrc = window.preloadedLogo.dataUrl;
        } else if (window.preloadedLogo && window.preloadedLogo.loaded && window.preloadedLogo.path) {
            // 2. Usar ruta de logo precargado si no hay dataUrl
            logoSrc = window.preloadedLogo.path;
        } else {
            // 3. Usar logo en Base64 embebido como último recurso
            logoSrc = fallbackLogoBase64;
        }
        
        // Generar el HTML con el logo que tengamos disponible
        overlay.innerHTML = `
            <div class="megafeast-loader-container">
                <div class="megafeast-loader-logo">
                    <img src="${logoSrc}" alt="MEGAFEAST Logo">
                </div>
                <div class="megafeast-loader-title">MEGAFEAST</div>
                <div class="megafeast-loader-bar-container">
                    <div class="megafeast-loader-bar" id="megafeast-loader-progress"></div>
                </div>
                <div class="megafeast-loader-text">CARGANDO...</div>
            </div>
        `;
        
        // Añadir un número reducido de partículas para mejor rendimiento
        for (var i = 0; i < 3; i++) {
            var particle = document.createElement('div');
            particle.className = 'megafeast-loader-particle';
            particle.style.left = Math.random() * 80 + 10 + '%';
            particle.style.top = Math.random() * 60 + 20 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            overlay.appendChild(particle);
        }
        
        return overlay;
    }
    
    // Cargar fuentes en segundo plano
    function loadFontsInBackground() {
        setTimeout(function() {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Marcellus&display=swap';
            link.media = 'print'; // No bloquea la renderización
            document.head.appendChild(link);
            
            setTimeout(function() {
                link.media = 'all'; // Activar cuando esté listo
            }, 100);
        }, 200);
    }
    
    // Función para cargar rápido
    function quickLoad() {
        var progress = document.getElementById('megafeast-loader-progress');
        if (progress) {
            // Iniciar barra de progreso inmediatamente
            requestAnimationFrame(function() {
                progress.style.width = '100%';
            });
            
            // Cargar fuentes en segundo plano
            loadFontsInBackground();
            
            // Ocultar después del tiempo mínimo
            setTimeout(hideLoader, totalLoadTime);
        }
    }
    
    // Ocultar el loader
    function hideLoader() {
        var overlay = document.getElementById('megafeast-loader-overlay');
        if (overlay) {
            overlay.classList.add('fade-out');
            
            setTimeout(function() {
                document.body.classList.add('megafeast-loader-done');
                
                // Limpiar memoria
                setTimeout(function() {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 300);
            }, 300);
        }
    }
    
    // Manejar caché de versión
    function handleVersionCache() {
        try {
            var storedVersion = localStorage.getItem('megafeast_loader_version');
            if (storedVersion && storedVersion !== VERSION) {
                localStorage.setItem('megafeast_loader_version', VERSION);
                return true; // Nueva versión, pero no recargamos la página aquí
            }
            localStorage.setItem('megafeast_loader_version', VERSION);
            return true;
        } catch (e) {
            return true;
        }
    }
    
    // Inicializar todo
    // Verificar caché
    if (handleVersionCache()) {
        // Crear y mostrar el loader inmediatamente
        var loader = createLoader();
        
        // Si ya hay body, añadirlo ahora
        if (document.body) {
            document.body.appendChild(loader);
            quickLoad();
        } else {
            // Esperar a que esté disponible el body
            document.addEventListener('DOMContentLoaded', function() {
                document.body.appendChild(loader);
                quickLoad();
            });
            
            // Fallback si DOMContentLoaded no funciona
            setTimeout(function() {
                if (!document.body && document.documentElement) {
                    document.documentElement.appendChild(loader);
                    quickLoad();
                }
            }, 5);
        }
    }
})();