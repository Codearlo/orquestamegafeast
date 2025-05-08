/**
 * MEGAFEAST ORQUESTA INTERNACIONAL
 * Script de control de caché mejorado
 * 
 * Este script implementa un control de caché más efectivo para
 * asegurar que los usuarios siempre obtengan las versiones más
 * actualizadas de los recursos cuando se realicen cambios.
 */

// Versión actual del sitio - cambiar esto cuando se actualicen archivos
const SITE_VERSION = '1.0.2';
const CACHE_NAME = 'megafeast-cache-v' + SITE_VERSION;

// Lista de archivos críticos a precachear
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/components.css',
    '/css/responsive.css',
    '/css/animations.css',
    '/css/menu-mobile.css',
    '/css/styles-fix.css',
    '/js/main.js',
    '/js/form-handler.js',
    '/js/gallery.js',
    '/js/loader-inline.js',
    '/js/preloader.js',
    '/img/logo.png',
    '/img/logoheader.png'
];

/**
 * Inicialización del control de caché
 */
(function() {
    // Verificamos la versión en localStorage
    checkVersionAndReload();
    
    // Añadimos parámetro de versión a recursos críticos
    addVersionToResources();
    
    // Registrar evento para cuando la página esté completamente cargada
    window.addEventListener('load', function() {
        console.log('Caché inicializado - Versión: ' + SITE_VERSION);
    });
})();

/**
 * Comprueba la versión almacenada y recarga si es necesario
 */
function checkVersionAndReload() {
    try {
        const lastVersion = localStorage.getItem('megafeast-version');
        
        // Si es primera visita o nueva versión
        if (!lastVersion || lastVersion !== SITE_VERSION) {
            console.log('Nueva versión detectada: ' + SITE_VERSION);
            
            // Limpiar cualquier dato de caché obsoleto
            clearBrowserCache();
            
            // Almacenar nueva versión
            localStorage.setItem('megafeast-version', SITE_VERSION);
            
            // Si no es primera visita, recargar la página para obtener recursos frescos
            if (lastVersion && performance.navigation.type !== 1) {
                console.log('Recargando página para actualizar recursos...');
                // La recarga se realiza después de un pequeño retraso
                // para permitir que se establezca el localStorage
                setTimeout(function() {
                    window.location.reload(true);
                }, 100);
                return;
            }
        } else {
            console.log('Usando versión en caché: ' + SITE_VERSION);
        }
    } catch (e) {
        console.warn('Error al verificar versión: ', e);
    }
}

/**
 * Intenta limpiar el caché del navegador
 */
function clearBrowserCache() {
    // Añadir meta tags para prevenir caché
    const metaTags = [
        { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
        { httpEquiv: 'Pragma', content: 'no-cache' },
        { httpEquiv: 'Expires', content: '0' }
    ];
    
    metaTags.forEach(meta => {
        let metaEl = document.createElement('meta');
        metaEl.httpEquiv = meta.httpEquiv;
        metaEl.content = meta.content;
        document.head.appendChild(metaEl);
    });
    
    // Intenta limpiar caché programáticamente
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName.startsWith('megafeast-cache')) {
                        return caches.delete(cacheName);
                    }
                })
            );
        });
    }
    
    // Recargar recursos críticos con busting de caché
    reloadCriticalResources();
}

/**
 * Recarga recursos críticos con parámetro para romper caché
 */
function reloadCriticalResources() {
    const timestamp = new Date().getTime();
    
    // Recargar CSS
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (!link.href.includes('cdnjs') && !link.href.includes('googleapis')) {
            const originalHref = link.href;
            const cacheBuster = originalHref.includes('?') ? '&v=' : '?v=';
            link.href = originalHref + cacheBuster + timestamp;
        }
    });
    
    // Recargar JS
    document.querySelectorAll('script[src]').forEach(script => {
        if (!script.src.includes('cdnjs') && !script.src.includes('googleapis')) {
            const originalSrc = script.src;
            const cacheBuster = originalSrc.includes('?') ? '&v=' : '?v=';
            
            // Crear un nuevo script en lugar de modificar el existente
            const newScript = document.createElement('script');
            newScript.src = originalSrc + cacheBuster + timestamp;
            newScript.async = script.async;
            newScript.defer = script.defer;
            
            script.parentNode.replaceChild(newScript, script);
        }
    });
}

/**
 * Añade parámetro de versión a todos los recursos
 */
function addVersionToResources() {
    // Añadir versión a los recursos que se cargan después
    document.addEventListener('DOMContentLoaded', function() {
        // Imágenes
        document.querySelectorAll('img').forEach(img => {
            if (img.src && !img.src.includes('data:') && !img.getAttribute('data-no-cache')) {
                const cacheBuster = img.src.includes('?') ? '&v=' : '?v=';
                img.src = img.src + cacheBuster + SITE_VERSION;
            }
        });
        
        // Fondos con background-image en el estilo inline
        document.querySelectorAll('[style*="background-image"]').forEach(el => {
            const style = el.getAttribute('style');
            if (style && style.includes('url(') && !style.includes('data:')) {
                // Extraer la URL
                const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (match && match[1]) {
                    const url = match[1];
                    const cacheBuster = url.includes('?') ? '&v=' : '?v=';
                    const newUrl = url + cacheBuster + SITE_VERSION;
                    const newStyle = style.replace(url, newUrl);
                    el.setAttribute('style', newStyle);
                }
            }
        });
    });
}