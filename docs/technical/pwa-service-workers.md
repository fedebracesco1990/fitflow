# PWA con Service Workers - Documentación Técnica

## Arquitectura

### Componentes Principales

```
frontend/
├── public/
│   ├── manifest.webmanifest      # Configuración PWA
│   └── firebase-messaging-sw.js  # SW para push notifications
├── src/
│   ├── index.html                # Meta tags PWA
│   └── app/
│       ├── core/services/
│       │   └── pwa.service.ts    # Servicio principal PWA
│       └── shared/components/
│           ├── pwa-update-prompt/
│           └── pwa-install-prompt/
└── ngsw-config.json              # Configuración Angular SW
```

### Service Workers

La aplicación utiliza **dos Service Workers**:

1. **Angular Service Worker** (`ngsw-worker.js`)

   - Generado automáticamente por @angular/service-worker
   - Maneja caching de assets y APIs
   - Controlado por `ngsw-config.json`

2. **Firebase Messaging SW** (`firebase-messaging-sw.js`)
   - Maneja push notifications en background
   - Configurado manualmente en `/public`

## Estrategias de Cache

### AssetGroups

| Grupo    | Modo     | Contenido                         |
| -------- | -------- | --------------------------------- |
| `app`    | prefetch | index.html, _.css, _.js, manifest |
| `assets` | lazy     | Imágenes, fonts                   |

### DataGroups

| Grupo                  | Estrategia  | Timeout | MaxAge | Uso                       |
| ---------------------- | ----------- | ------- | ------ | ------------------------- |
| `user-routines-api`    | freshness   | 5s      | 1h     | Rutinas del usuario       |
| `workouts-api`         | freshness   | 5s      | 1h     | Sesiones de entrenamiento |
| `exercises-api`        | performance | -       | 1d     | Biblioteca de ejercicios  |
| `routines-api`         | freshness   | 5s      | 1h     | Rutinas del trainer       |
| `stats-api`            | freshness   | 5s      | 30min  | Estadísticas de progreso  |
| `personal-records-api` | freshness   | 5s      | 1h     | Records personales        |

### Estrategias Explicadas

- **freshness**: Network First con fallback a cache. Timeout de 5s antes de usar cache.
- **performance**: Cache First. Ideal para datos que cambian poco (ejercicios).

## PwaService

### Responsabilidades

1. **Detección de actualizaciones** via `SwUpdate`
2. **Prompt de instalación** capturando `beforeinstallprompt`
3. **Gestión de estado** en localStorage

### Signals Expuestos

```typescript
readonly updateAvailable: Signal<boolean>     // Nueva versión disponible
readonly canInstall: Signal<boolean>          // Browser soporta instalación
readonly isInstalled: Signal<boolean>         // App ya instalada (standalone)
readonly shouldShowInstallPrompt: Signal<boolean>  // Computed: mostrar prompt?
```

### Lógica de Install Prompt

```
shouldShowInstallPrompt =
  canInstall &&
  !isInstalled &&
  visitCount >= 2 &&
  !dismissedRecently (7 días)
```

### localStorage Keys

| Key                        | Propósito                      |
| -------------------------- | ------------------------------ |
| `pwa_visit_count`          | Contador de visitas            |
| `pwa_install_dismissed`    | Si usuario rechazó instalación |
| `pwa_install_dismissed_at` | Timestamp del rechazo          |

## Integración en MainLayout

Los prompts se muestran en `MainLayoutComponent`:

```html
<!-- PWA Update Prompt -->
<fit-flow-pwa-update-prompt
  [isVisible]="pwaService.updateAvailable()"
  (updateNow)="handlePwaUpdate()"
  (dismissed)="handlePwaUpdateDismiss()"
/>

<!-- PWA Install Prompt -->
<fit-flow-pwa-install-prompt
  [isVisible]="pwaService.shouldShowInstallPrompt()"
  (install)="handlePwaInstall()"
  (dismissed)="handlePwaInstallDismiss()"
/>
```

## Testing Manual

### Chrome DevTools

1. Abrir **Application** tab
2. Verificar **Manifest** tiene todos los campos
3. Verificar **Service Workers** están registrados
4. En **Cache Storage** verificar dataGroups

### Simular Offline

1. En DevTools > Network, seleccionar "Offline"
2. Navegar a `/my-routines` - debe cargar desde cache
3. Verificar que los datos guardados se muestran

### Probar Instalación

1. Visitar la app 2+ veces (o modificar `MIN_VISITS_FOR_PROMPT`)
2. El prompt de instalación debe aparecer
3. Click "Instalar" debe abrir el diálogo nativo del browser

### Probar Actualizaciones

1. Hacer cambio en el código
2. Build de producción
3. Refrescar la app
4. El prompt de actualización debe aparecer

## Configuración del Manifest

```json
{
  "name": "FitFlow - Sistema de Gestión de Gimnasio",
  "short_name": "FitFlow",
  "description": "Gestiona tu entrenamiento, rutinas y progreso",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#3b82f6",
  "background_color": "#f5f7fa",
  "categories": ["fitness", "health", "sports"]
}
```

## Meta Tags PWA (index.html)

```html
<meta name="theme-color" content="#3b82f6" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="FitFlow" />
<link rel="apple-touch-icon" href="icons/icon-192x192.png" />
```

## Troubleshooting

### SW no se actualiza

- Verificar que `registrationStrategy` sea `registerWhenStable:30000`
- En DevTools > Application > Service Workers, click "Update"
- Verificar que el build sea de producción

### Install prompt no aparece

- Verificar que la app se sirva por HTTPS (o localhost)
- Verificar `visitCount` en localStorage
- Verificar que no esté en modo standalone

### Cache no funciona offline

- Verificar que las URLs coincidan con los patterns en `ngsw-config.json`
- Verificar que el SW esté activo en DevTools
- Verificar que la API haya sido llamada al menos una vez online
