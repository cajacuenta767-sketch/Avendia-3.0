# Evidencia de calidad funcional

Fecha de cierre: 31 de agosto de 2026.

## Cobertura visual

| Revisión | Resultado |
|---|---|
| 57 herramientas en escritorio | 57 correctas |
| 57 herramientas en móvil (390 × 844) | 57 correctas |
| Desbordamiento horizontal móvil | 0 rutas |
| Modo oscuro por módulo | 8 módulos correctos |
| Vistas transversales oscuras | Calendario, historial, perfil, formatos y administración correctos |
| Escala tipográfica | 87,5 %, 100 % y 112,5 % correctas |
| Generar con guía | Preguntas, sugerencias, contexto y acción Gemini correctos |

## Cobertura automática

- Frontend: 8 archivos de prueba y 21 pruebas aprobadas.
- Backend: 22 pruebas aprobadas.
- Compilación de producción aprobada.
- Contratos comprobados para documentos, historial, perfil, administración, calendario, créditos y generación especializada de presentaciones.
- Auditoría de dependencias de producción: 0 vulnerabilidades. La dependencia transitiva `image-size` de PPTXGenJS se reemplazó por el alias compatible y corregido `image-size-next@2.1.1`.

## Evidencia visual

La captura `audit/avendia-pca-dark-final.png` muestra el PCA en modo oscuro con nueve pasos, botones de generación guiada y guardado, filtros institucionales y navegación completa.
