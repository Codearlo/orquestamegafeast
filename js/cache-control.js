/**
 * MEGAFEAST ORQUESTA INTERNACIONAL
 * Control de caché con detección automática de cambios
 * 
 * Este script fuerza la recarga de recursos usando timestamp como versión,
 * sin depender de un número de versión manual.
 */

// Archivos a excluir del control de caché (loader y preloader)
const EXCLUDE_FILES = [
    'loader-inline.js',
    'preloader.js',
    'logo.png' // Excluir el logo usado por el loader
];

/**
 * Función de inicialización principal
 */
(function() {
    // Obtener timestamp actual como identificador único
    const currentTimestamp = new Date().getTime();
    
    // Registrar cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function() {
        // Comprobar si necesitamos forzar actualización
        checkForUpdates(currentTimestamp);
        
        // Aplicar identificador a recursos existentes
        addTimestampToAllResources(currentTimestamp);
        
        console.log('Control de caché activado - Timestamp: ' + currentTimestamp);
    });
    
    // Ejecutamos algunos controles inmediatamente para recursos tempranos
    earlyResourceControl(currentTimestamp);
})();

/**
 * Control inicial de recursos antes de DOMContentLoaded
 */
function earlyResourceControl(timestamp) {
    // Agregar meta tags de control de caché de inmediato
    addCacheControlMetaTags();
    
    // Actualizar la frecuencia de verificación
    updateCheckFrequency(timestamp);
}

/**
 * Actualiza la frecuencia de verificación de cambios
 */
function updateCheckFrequency(timestamp) {
    try {
        // Guardar timestamp de esta visita
        localStorage.setItem('megafeast-last-visit', timestamp.toString());
        
        // Calcular tiempo desde la última verificación
        const lastCheck = localStorage.getItem('megafeast-check-frequency');
        
        if (!lastCheck) {
            // Primera visita, establecer frecuencia inicial (cada hora)
            localStorage.setItem('megafeast-check-frequency', '3600000'); // 1 hora en ms
        } else {
            // Ajustar frecuencia basada en la actividad del sitio
            // Si se visita frecuentemente, verificar más seguido
            const frequency = parseInt(lastCheck);
            const newFrequency = Math.max(300000, Math.min(frequency, 7200000)); // Entre 5 min y 2 horas
            localStorage.setItem('megafeast-check-frequency', newFrequency.toString());
        }
    } catch (e) {
        console.warn('Error al actualizar frecuencia:', e);
    }
}

/**
 * Comprueba si hay actualizaciones basadas en el tiempo
 */
function checkForUpdates(timestamp) {
    try {
        // Obtener última verificación
        const lastForceReload = localStorage.getItem('megafeast-last-reload');
        const checkFrequency = parseInt(localStorage.getItem('megafeast-check-frequency') || '3600000');
        
        // Si nunca se ha forzado recarga o ha pasado suficiente tiempo
        if (!lastForceReload || (timestamp - parseInt(lastForceReload) > checkFrequency)) {
            console.log('Verificando actualizaciones de recursos...');
            
            // Guardar esta verificación
            localStorage.setItem('megafeast-last-reload', timestamp.toString());
            
            // Forzar recarga de recursos
            reloadAllResources(timestamp);
            
            // Forzar recarga completa una vez al día (86400000 ms)
            const dayInMs = 86400000;
            if (!lastForceReload || (timestamp - parseInt(lastForceReload) > dayInMs)) {
                // Si ha pasado un día, forzar recarga completa
                console.log('Recarga diaria, refrescando página...');
                
                // Evitar bucle de recarga
                sessionStorage.setItem('megafeast-reloading', 'true');
                
                setTimeout(function() {
                    window.location.reload(true);
                }, 100);
            }
        } else if (sessionStorage.getItem('megafeast-reloading')) {
            // Limpiar indicador de recarga
            sessionStorage.removeItem('megafeast-reloading');
            console.log('Página actualizada con timestamp: ' + timestamp);
        }
    } catch (e) {
        console.warn('Error al verificar actualizaciones:', e);
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
 * Recarga todos los recursos con un timestamp
 */
function reloadAllResources(timestamp) {
    // Intentar limpiar caché del navegador
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
    
    // Recargar recursos por tipo
    reloadStylesheets(timestamp);
    reloadScripts(timestamp);
    reloadImages(timestamp);
}

/**
 * Recarga hojas de estilo CSS
 */
function reloadStylesheets(timestamp) {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !shouldExcludeFile(href)) {
            const newHref = addTimestampParam(href, timestamp);
            
            // Crear nuevo elemento
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = newHref;
            
            // Reemplazar cuando esté listo
            newLink.onload = function() {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            };
            
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
            const newSrc = addTimestampParam(src, timestamp);
            
            // Crear nuevo script
            const newScript = document.createElement('script');
            newScript.src = newSrc;
            if (script.async) newScript.async = true;
            if (script.defer) newScript.defer = true;
            
            // Reemplazar script antiguo
            if (script.parentNode) {
                script.parentNode.insertBefore(newScript, script);
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
 * Recarga imágenes con timestamp
 */
function reloadImages(timestamp) {
    // Imágenes con etiqueta img
    document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !shouldExcludeFile(src) && !src.includes('data:')) {
            const newSrc = addTimestampParam(src, timestamp);
            img.setAttribute('src', newSrc);
        }
    });
    
    // Imágenes de fondo en CSS
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
        const style = el.getAttribute('style');
        if (style && style.includes('url(') && !style.includes('data:')) {
            // Extraer todas las URLs
            const urlPattern = /url\(['"]?([^'"]+)['"]?\)/g;
            let newStyle = style;
            let match;
            
            while ((match = urlPattern.exec(style)) !== null) {
                const url = match[1];
                if (!shouldExcludeFile(url)) {
                    const newUrl = addTimestampParam(url, timestamp);
                    newStyle = newStyle.replace(url, newUrl);
                }
            }
            
            if (newStyle !== style) {
                el.setAttribute('style', newStyle);
            }
        }
    });
}

/**
 * Aplica timestamp a todos los recursos en la página
 */
function addTimestampToAllResources(timestamp) {
    // Imágenes
    document.querySelectorAll('img').forEach(img => {
        if (img.src && !img.src.includes('data:') && !img.hasAttribute('data-no-cache')) {
            if (!shouldExcludeFile(img.src)) {
                img.src = addTimestampParam(img.src, timestamp);
            }
        }
    });
    
    // Fondos con background-image
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
        const style = el.getAttribute('style');
        if (style && style.includes('url(') && !style.includes('data:')) {
            const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (match && match[1]) {
                const url = match[1];
                if (!shouldExcludeFile(url)) {
                    const newUrl = addTimestampParam(url, timestamp);
                    const newStyle = style.replace(url, newUrl);
                    el.setAttribute('style', newStyle);
                }
            }
        }
    });
}

/**
 * Agrega parámetro de timestamp a una URL
 */
function addTimestampParam(url, timestamp) {
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
    
    // Eliminar parámetros de versión/timestamp anteriores
    url = url.replace(/([?&])(v|version|_v|t|timestamp|_t|ts)=([^&]*)/g, (match, prefix, key, value) => {
        return prefix === '?' ? '?' : '';
    });
    
    // Eliminar ? final si quedó solo
    url = url.replace(/\?$/, '');
    
    // Añadir nuevo timestamp
    const separator = url.includes('?') ? '&' : '?';
    return url + separator + 't=' + timestamp;
}

/**
 * Determina si un archivo debe ser excluido del control de caché
 */
function shouldExcludeFile(url) {
    if (!url) return false;
    
    // Verificar archivos específicos a excluir
    return EXCLUDE_FILES.some(file => url.includes(file));
}