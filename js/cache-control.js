/**
 * MEGAFEAST ORQUESTA INTERNACIONAL
 * Control de caché agresivo
 * 
 * Este script fuerza la recarga de recursos en todos los dispositivos,
 * incluso en móviles donde es difícil limpiar la caché manualmente.
 * Funciona con implementaciones basadas en Git y hosting como Hostinger.
 */

// Versión del sitio - INCREMENTAR ESTE NÚMERO CADA VEZ QUE SE HAGA UN CAMBIO IMPORTANTE
const SITE_VERSION = '1.1.0';

// Archivos a excluir del control de caché (loader y preloader)
const EXCLUDE_FILES = [
    'loader-inline.js',
    'preloader.js'
];

/**
 * Función de inicialización principal
 */
(function() {
    // Registrar cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function() {
        // Comprobar versión y actuar en consecuencia
        checkVersionAndUpdate();
        
        // Aplicar versión a recursos existentes
        addVersionToAllResources();
        
        console.log('Control de caché activado - Versión: ' + SITE_VERSION);
    });
    
    // También ejecutamos algunos controles inmediatamente sin esperar al DOMContentLoaded
    // para manejar recursos que se cargan muy temprano
    earlyResourceControl();
})();

/**
 * Control inicial de recursos antes de DOMContentLoaded
 */
function earlyResourceControl() {
    // Agregar meta tags de control de caché de inmediato
    addCacheControlMetaTags();
    
    // Intentar modificar recursos ya cargados
    setTimeout(function() {
        addVersionToEarlyResources();
    }, 0);
}

/**
 * Comprueba si la versión ha cambiado y actualiza si es necesario
 */
function checkVersionAndUpdate() {
    try {
        // Obtener timestamp actual (para uso en URLs)
        const timestamp = new Date().getTime();
        
        // Comparar con versión almacenada
        const storedVersion = localStorage.getItem('megafeast-version');
        const storedTimestamp = localStorage.getItem('megafeast-timestamp');
        
        // Si es una nueva versión o ha pasado más de 1 hora desde la última verificación
        const forceCheck = !storedTimestamp || (timestamp - parseInt(storedTimestamp) > 3600000);
        
        if (!storedVersion || storedVersion !== SITE_VERSION || forceCheck) {
            console.log('Actualizando recursos a versión: ' + SITE_VERSION);
            
            // Actualizar versión y timestamp en almacenamiento
            localStorage.setItem('megafeast-version', SITE_VERSION);
            localStorage.setItem('megafeast-timestamp', timestamp.toString());
            
            // Forzar recarga de recursos
            reloadAllResources(timestamp);
            
            // Si la versión cambió y no es recarga de página, recargar completamente
            if (storedVersion && storedVersion !== SITE_VERSION && performance.navigation.type !== 1) {
                console.log('Detectada nueva versión, recargando página...');
                
                // Guardar un indicador para evitar bucles de recarga
                sessionStorage.setItem('megafeast-reloading', 'true');
                
                // Recargar después de un breve retraso
                setTimeout(function() {
                    window.location.reload(true);
                }, 100);
            }
        } else if (sessionStorage.getItem('megafeast-reloading')) {
            // Limpiar indicador de recarga
            sessionStorage.removeItem('megafeast-reloading');
            console.log('Página actualizada a versión: ' + SITE_VERSION);
        }
    } catch (e) {
        console.warn('Error en control de versiones:', e);
    }
}

/**
 * Añade meta tags para control de caché
 */
function addCacheControlMetaTags() {
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
}

/**
 * Recarga todos los recursos con un parámetro de versión
 */
function reloadAllResources(timestamp) {
    // Intentar usar la API Cache moderna
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName.startsWith('megafeast')) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).catch(err => {
            console.warn('Error al limpiar caché:', err);
        });
    }
    
    // Archivos a recargar con mayor prioridad
    reloadStylesheets(timestamp);
    reloadScripts(timestamp);
}

/**
 * Recarga hojas de estilo CSS
 */
function reloadStylesheets(timestamp) {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !shouldExcludeFile(href)) {
            const newHref = addVersionParam(href, timestamp || SITE_VERSION);
            
            // Crear un nuevo elemento en lugar de modificar el existente
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = newHref;
            
            // Reemplazar el enlace antiguo cuando el nuevo esté listo
            newLink.onload = function() {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            };
            
            // Insertar el nuevo enlace
            if (link.parentNode) {
                link.parentNode.insertBefore(newLink, link.nextSibling);
            }
        }
    });
}

/**
 * Recarga scripts JavaScript
 */
function reloadScripts(timestamp) {
    document.querySelectorAll('script[src]').forEach(script => {
        const src = script.getAttribute('src');
        if (src && !shouldExcludeFile(src) && !src.includes('cdnjs.cloudflare') && !src.includes('googleapis')) {
            const newSrc = addVersionParam(src, timestamp || SITE_VERSION);
            
            // Crear un nuevo script
            const newScript = document.createElement('script');
            newScript.src = newSrc;
            if (script.async) newScript.async = true;
            if (script.defer) newScript.defer = true;
            
            // Insertar el nuevo script y eliminar el viejo
            if (script.parentNode) {
                script.parentNode.insertBefore(newScript, script);
                // Eliminamos el antiguo script con un pequeño retraso
                setTimeout(() => {
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                }, 100);
            }
        }
    });
}

/**
 * Aplica versión a todos los recursos en la página
 */
function addVersionToAllResources() {
    const timestamp = new Date().getTime();
    
    // Imágenes
    document.querySelectorAll('img').forEach(img => {
        if (img.src && !img.src.includes('data:') && !img.hasAttribute('data-no-cache')) {
            img.src = addVersionParam(img.src, timestamp);
        }
    });
    
    // Fondos con background-image
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
        const style = el.getAttribute('style');
        if (style && style.includes('url(') && !style.includes('data:')) {
            // Extraer la URL
            const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (match && match[1]) {
                const url = match[1];
                const newUrl = addVersionParam(url, timestamp);
                const newStyle = style.replace(url, newUrl);
                el.setAttribute('style', newStyle);
            }
        }
    });
    
    // Videos y audios
    document.querySelectorAll('video source, audio source').forEach(source => {
        if (source.src) {
            source.src = addVersionParam(source.src, timestamp);
        }
    });
}

/**
 * Aplica versión a recursos cargados temprano
 */
function addVersionToEarlyResources() {
    const timestamp = new Date().getTime();
    
    // Hojas de estilo que ya están cargadas
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !shouldExcludeFile(href)) {
            link.href = addVersionParam(href, timestamp);
        }
    });
}

/**
 * Agrega parámetro de versión a una URL
 */
function addVersionParam(url, version) {
    if (!url || url.includes('data:') || url.includes('blob:')) {
        return url;
    }
    
    // No modificar URLs externas
    if (url.includes('//') && !url.includes(window.location.hostname)) {
        return url;
    }
    
    // No modificar archivos excluidos
    if (shouldExcludeFile(url)) {
        return url;
    }
    
    // Eliminar parámetros de versión anteriores si existen
    url = url.replace(/([?&])(v|version|_v|t|timestamp)=([^&]*)/g, (match, prefix, key, value) => {
        return prefix === '?' ? '?' : '';
    });
    
    // Eliminar ? final si quedó solo después de remover parámetros
    url = url.replace(/\?$/, '');
    
    // Añadir nuevo parámetro de versión
    const separator = url.includes('?') ? '&' : '?';
    return url + separator + 'v=' + version;
}

/**
 * Determina si un archivo debe ser excluido del control de caché
 */
function shouldExcludeFile(url) {
    return EXCLUDE_FILES.some(file => url.includes(file));
}