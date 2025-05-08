/**
 * MEGAFEAST ORQUESTA INTERNACIONAL
 * Script de control de caché
 * 
 * Este script implementa funcionalidades para manejar el caché de recursos
 * del sitio web, asegurando que los usuarios siempre obtengan los archivos
 * más actualizados cuando se realicen cambios en el sitio.
 */

// Versión actual del sitio - cambiar esto cuando se actualicen archivos
const SITE_VERSION = '1.0.0';
const CACHE_NAME = 'megafeast-cache-v' + SITE_VERSION;

// Lista de archivos a precargar en caché
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/responsive.css',
    '/css/animations.css',
    '/css/about-section.css',
    '/css/color-fixes.css',
    '/css/form-validation.css',
    '/js/main.js',
    '/js/form-handler.js',
    '/js/cache-control.js'
    // Agregar aquí otros recursos importantes a cachear
];

/**
 * Inicialización del control de caché
 */
(function() {
    // Verificamos si el navegador soporta Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            // Registramos el Service Worker si está disponible
            registerServiceWorker();
            
            // Configuramos control de caché para navegadores sin Service Worker
            legacyCacheControl();
        });
    } else {
        console.log('Service Worker no soportado. Usando control de caché alternativo.');
        legacyCacheControl();
    }
    
    // Añadimos parámetro de versión a todos los recursos
    addVersionToResources();
})();

/**
 * Registra el Service Worker para control avanzado de caché
 */
function registerServiceWorker() {
    // No implementamos el Service Worker directamente aquí,
    // ya que requeriría crear un archivo separado en la raíz.
    // En una implementación real, tendríamos que crear un archivo
    // service-worker.js en la raíz del proyecto.
    
    // Ejemplo de registro (código comentado para esta implementación):
    /*
    navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
            console.log('Service Worker registrado con éxito:', registration);
        })
        .catch(function(error) {
            console.log('Error al registrar el Service Worker:', error);
        });
    */
}

/**
 * Control de caché para navegadores que no soportan Service Worker
 */
function legacyCacheControl() {
    // Verificamos si necesitamos limpiar el caché de la versión anterior
    const lastVersion = localStorage.getItem('megafeast-version');
    if (lastVersion !== SITE_VERSION) {
        console.log('Nueva versión detectada. Limpiando caché...');
        clearBrowserCache();
        localStorage.setItem('megafeast-version', SITE_VERSION);
    }
}

/**
 * Intenta limpiar el caché del navegador
 * (Nota: esto tiene limitaciones en navegadores modernos)
 */
function clearBrowserCache() {
    // Configuramos metadatos para evitar caché en esta sesión
    const metaCache = document.createElement('meta');
    metaCache.httpEquiv = 'Cache-Control';
    metaCache.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(metaCache);
    
    const metaPragma = document.createElement('meta');
    metaPragma.httpEquiv = 'Pragma';
    metaPragma.content = 'no-cache';
    document.head.appendChild(metaPragma);
    
    const metaExpires = document.createElement('meta');
    metaExpires.httpEquiv = 'Expires';
    metaExpires.content = '0';
    document.head.appendChild(metaExpires);
    
    // Recargamos recursos críticos con cache buster
    reloadCriticalResources();
}

/**
 * Recarga recursos críticos con parámetro cache-buster
 */
function reloadCriticalResources() {
    const timestamp = new Date().getTime();
    
    // Recargamos CSS si es necesario
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const originalHref = link.href;
        const cacheBuster = originalHref.includes('?') ? '&v=' : '?v=';
        link.href = originalHref + cacheBuster + timestamp;
    });
}

/**
 * Añade parámetro de versión a todos los recursos
 */
function addVersionToResources() {
    // Añadimos versión a CSS
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (!link.href.includes('cdnjs') && !link.href.includes('googleapis')) {
            const cacheBuster = link.href.includes('?') ? '&v=' : '?v=';
            link.href = link.href + cacheBuster + SITE_VERSION;
        }
    });
    
    // Añadimos versión a scripts
    document.querySelectorAll('script[src]').forEach(script => {
        if (!script.src.includes('cdnjs') && !script.src.includes('googleapis')) {
            const cacheBuster = script.src.includes('?') ? '&v=' : '?v=';
            script.src = script.src + cacheBuster + SITE_VERSION;
        }
    });
    
    // Añadimos versión a imágenes cargadas dinámicamente
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('img').forEach(img => {
            if (img.src && !img.src.includes('data:') && !img.getAttribute('data-no-cache')) {
                const cacheBuster = img.src.includes('?') ? '&v=' : '?v=';
                img.src = img.src + cacheBuster + SITE_VERSION;
            }
        });
    });
}