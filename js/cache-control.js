/**
 * MEGAFEAST ORQUESTA INTERNACIONAL
 * Control de caché conservador
 * 
 * Este script actualiza recursos solo cuando es necesario,
 * evitando recargas excesivas y problemas con el loader.
 */

// Archivos a excluir completamente del control de caché
const EXCLUDE_FILES = [
    'loader-inline.js',
    'preloader.js',
    'logo.png',
    'logoheader.png'
];

// Intervalo mínimo entre verificaciones (24 horas)
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 1 día en milisegundos

/**
 * Función de inicialización principal
 */
(function() {
    // Verificar si debemos realizar una comprobación hoy
    // (pero solo cuando la página esté completamente cargada)
    window.addEventListener('load', function() {
        // Esperar un momento para no interferir con la carga inicial
        setTimeout(function() {
            checkForUpdates();
        }, 1000);
    });
})();

/**
 * Comprueba si hay que actualizar recursos
 */
function checkForUpdates() {
    try {
        const now = new Date().getTime();
        const lastCheck = localStorage.getItem('megafeast-last-check');
        
        // Solo verificar una vez al día como máximo
        if (!lastCheck || (now - parseInt(lastCheck) > CHECK_INTERVAL)) {
            console.log('Realizando verificación diaria de recursos...');
            
            // Guardar timestamp de esta verificación
            localStorage.setItem('megafeast-last-check', now.toString());
            
            // Comparar con último despliegue conocido
            checkDeploymentStatus(now);
        }
    } catch (e) {
        console.warn('Error en verificación de actualizaciones:', e);
    }
}

/**
 * Verifica cambios de despliegue usando un archivo de manifiesto
 */
function checkDeploymentStatus(timestamp) {
    // Crear una solicitud al manifiesto con busting de caché
    fetch('manifest.json?nocache=' + timestamp)
        .then(response => {
            if (!response.ok) {
                // Si no existe el manifiesto, crear uno la próxima vez
                createManifestFile();
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                // Comprobar versión del manifiesto
                const storedVersion = localStorage.getItem('megafeast-manifest-version');
                
                if (!storedVersion || storedVersion !== data.version) {
                    console.log('Nueva versión detectada:', data.version);
                    
                    // Almacenar nueva versión
                    localStorage.setItem('megafeast-manifest-version', data.version);
                    
                    // Sugerir al usuario que recargue la página
                    showUpdateNotification();
                }
            }
        })
        .catch(error => {
            console.warn('Error al verificar manifiesto:', error);
            // En caso de error, intentar actualizar solo los recursos críticos
            updateCriticalResources(timestamp);
        });
}

/**
 * Crea un archivo de manifiesto si no existe
 */
function createManifestFile() {
    console.log("No se encontró archivo de manifiesto. Usando método alternativo.");
    // Como no podemos crear el archivo desde JavaScript, actualizamos solo recursos críticos
    updateCriticalResources(Date.now());
}

/**
 * Actualiza solo los recursos críticos con busting de caché
 */
function updateCriticalResources(timestamp) {
    // Almacenar último timestamp usado
    localStorage.setItem('megafeast-last-resource-update', timestamp.toString());

    // Actualizar solo recursos críticos
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (link.href && link.href.includes('components.css')) {
            addVersionParam(link, 'href', timestamp);
        }
    });
    
    // Actualizar imágenes de secciones principales (excepto las excluidas)
    document.querySelectorAll('img').forEach(img => {
        if (img.src && 
            !shouldExcludeFile(img.src) && 
            !img.src.includes('data:') &&
            (img.src.includes('gallery') || img.src.includes('events'))) {
            
            addVersionParam(img, 'src', timestamp);
        }
    });
}

/**
 * Muestra una notificación no intrusiva sugiriendo actualizar
 */
function showUpdateNotification() {
    // Solo mostrar si no estamos en la primera carga de la página
    if (performance.navigation.type !== 0) {
        return;
    }
    
    // Crear notificación elegante
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #1A1A1A;
        color: #fff;
        border: 2px solid #D4AF37;
        border-radius: 8px;
        padding: 15px 20px;
        font-family: 'Quicksand', sans-serif;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 300px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
    `;
    
    notification.innerHTML = `
        <div style="margin-right: 15px;">
            <div style="font-weight: bold; color: #D4AF37; margin-bottom: 5px;">
                Nueva versión disponible
            </div>
            <div style="font-size: 14px;">
                Hay contenido actualizado disponible.
            </div>
        </div>
        <button id="update-now-btn" style="
            background-color: #D4AF37;
            color: #1A1A1A;
            border: none;
            border-radius: 4px;
            padding: 8px 12px;
            cursor: pointer;
            font-weight: bold;
            white-space: nowrap;
        ">Actualizar</button>
    `;
    
    // Añadir notificación al body
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Configurar botón de actualización
    const updateBtn = document.getElementById('update-now-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', function() {
            window.location.reload(true);
        });
    }
    
    // Auto-ocultar después de 10 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 10000);
}

/**
 * Añade parámetro de versión a un atributo de un elemento
 */
function addVersionParam(element, attribute, timestamp) {
    if (!element || !element[attribute]) return;
    
    let url = element[attribute];
    
    // No modificar archivos excluidos
    if (shouldExcludeFile(url)) return;
    
    // Eliminar parámetros de versión anteriores
    url = url.replace(/([?&])(v|version|_v|t|timestamp|_t|ts)=([^&]*)/g, (match, prefix, key, value) => {
        return prefix === '?' ? '?' : '';
    });
    
    // Eliminar ? final si quedó solo
    url = url.replace(/\?$/, '');
    
    // Añadir nuevo timestamp
    const separator = url.includes('?') ? '&' : '?';
    element[attribute] = url + separator + 'v=' + timestamp;
}

/**
 * Determina si un archivo debe ser excluido del control de caché
 */
function shouldExcludeFile(url) {
    if (!url) return true;
    
    // Verificar archivos específicos a excluir
    return EXCLUDE_FILES.some(file => url.includes(file));
}