// loader-inline.js - Versión simplificada que muestra directamente la imagen
(function() {
    // Colores de la orquesta
    var bgColor = '#1A1A1A';     // Negro oscuro (fondo principal)
    var barColor = '#D4AF37';    // Dorado (color principal)
    
    // Tiempo de visualización mínimo del loader
    var totalLoadTime = 1000;
    
    // Ruta absoluta al logo
    var logoPath = window.location.origin + '/img/logo.png';
    
    // Añadir estilos inline para máxima velocidad
    (function injectInlineStyles() {
        var styleContent = `
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
                font-family: 'Marcellus', 'Times New Roman', serif;
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
                font-family: 'Quicksand', 'Arial', sans-serif;
                letter-spacing: 1px;
                opacity: 0.9;
                height: 20px;
                line-height: 20px;
                white-space: nowrap;
            }
            
            #megafeast-loader-overlay.fade-out {
                opacity: 0;
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
    
    // Crear el HTML del loader
    function createLoader() {
        var overlay = document.createElement('div');
        overlay.id = 'megafeast-loader-overlay';
        
        // Generar el HTML
        overlay.innerHTML = `
            <div class="megafeast-loader-container">
                <div class="megafeast-loader-logo">
                    <img src="${logoPath}" alt="MEGAFEAST Logo">
                </div>
                <div class="megafeast-loader-title">MEGAFEAST</div>
                <div class="megafeast-loader-bar-container">
                    <div class="megafeast-loader-bar" id="megafeast-loader-progress"></div>
                </div>
                <div class="megafeast-loader-text">CARGANDO...</div>
            </div>
        `;
        
        // Añadir partículas
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
    
    // Función para cargar rápido
    function quickLoad() {
        var progress = document.getElementById('megafeast-loader-progress');
        if (progress) {
            // Iniciar barra de progreso inmediatamente
            setTimeout(function() {
                progress.style.width = '100%';
            }, 100);
            
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
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }
    
    // Inicializar todo
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
    }
})();