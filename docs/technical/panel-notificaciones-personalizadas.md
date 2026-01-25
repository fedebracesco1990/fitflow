# Panel de Notificaciones Personalizadas - Documentación Técnica

## Resumen

Panel administrativo para enviar notificaciones push personalizadas a usuarios del gimnasio. Permite envío a todos los usuarios (broadcast) o selección múltiple de destinatarios.

## Arquitectura

### Componentes Frontend

```
notifications-admin/
├── components/
│   ├── message-editor/          # Editor de mensaje con preview
│   └── notification-history/    # Historial de envíos
├── models/
│   └── notification-history.model.ts
├── services/
│   └── notification-history.service.ts
└── pages/
    └── send-notifications/      # Página principal

shared/components/
└── user-selector/               # Selector reutilizable
```

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                   SendNotificationsComponent                │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │ Mode Toggle     │  │ MessageEditorComponent          │  │
│  │ [Todos|Select]  │  │ - title, body                   │  │
│  └─────────────────┘  │ - preview en tiempo real        │  │
│                       └─────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ UserSelectorComponent (si mode='selected')          │   │
│  │ - Carga usuarios activos via UsersService           │   │
│  │ - Búsqueda, checkboxes, select all                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ POST /notifications/send                            │   │
│  │ { broadcast: true } o { userId, title, body }       │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ NotificationHistoryService                          │   │
│  │ - localStorage (max 10 items)                       │   │
│  │ - Signal reactivo                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints Utilizados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/notifications/send` | POST | Enviar notificación |
| `/users` | GET | Listar usuarios (filtro: role=USER, membershipStatus=active) |

### Request Body - Envío

```typescript
// Broadcast (todos)
{ broadcast: true, title: string, body: string }

// Usuario específico
{ userId: string, title: string, body: string }
```

### Response

```typescript
{ success: boolean, sent: number }
```

## Componentes Detallados

### UserSelectorComponent (Shared)

**Ubicación:** `shared/components/user-selector/`

**Inputs:**
- `disabled: boolean` - Deshabilita el selector
- `membershipStatus: string` - Filtro de membresía (default: 'active')

**Outputs:**
- `selectionChange: User[]` - Usuarios seleccionados

**Características:**
- Búsqueda por nombre/email
- Select all / deselect all
- Contador de seleccionados
- Carga usuarios con role=USER

### MessageEditorComponent

**Ubicación:** `notifications-admin/components/message-editor/`

**Inputs:**
- `disabled: boolean`
- `showPreview: boolean`

**Outputs:**
- `contentChange: MessageContent` - { title, body }

**Características:**
- Límite 100 chars título, 500 chars body
- Preview en tiempo real estilo notificación push

### NotificationHistoryService

**Ubicación:** `notifications-admin/services/`

**Patrón:** localStorage con Signal reactivo

**Configuración:**
- `STORAGE_KEY`: 'fitflow_notification_history'
- `MAX_HISTORY_ITEMS`: 10

**Métodos:**
- `addToHistory()` - Agrega entrada al historial
- `clearHistory()` - Limpia todo el historial
- `history` - Signal readonly con items

## Modelos

```typescript
enum NotificationTargetType {
  BROADCAST = 'broadcast',
  SELECTED = 'selected',
}

interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  targetType: NotificationTargetType;
  recipientCount: number;
  recipientNames?: string[];
  sentAt: string;
  success: boolean;
  devicesSent: number;
}
```

## Consideraciones de Rendimiento

- **Carga de usuarios:** Limitada a 100 usuarios con filtro active
- **Historial:** Máximo 10 items en localStorage (~5KB)
- **Envío múltiple:** Secuencial para evitar rate limiting de Firebase

## Notas de Desarrollo

### Decisiones de Implementación

1. **localStorage vs BD:** Se eligió localStorage para historial por simplicidad y requerimiento del usuario
2. **Envío secuencial:** Para múltiples usuarios se envía uno por uno para mejor tracking de errores
3. **UserSelectorComponent en shared:** Reutilizable para futuras features (FITFLOW-68/69)

### Mejoras Futuras

- Programación de envío diferido (scheduler)
- Bulk endpoint en backend para envío masivo optimizado
- Persistencia de historial en base de datos
- Templates de mensajes frecuentes
