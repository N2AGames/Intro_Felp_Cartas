# Proyectos Angular Diarios 🚀

Este repositorio contiene un sistema de proyectos Angular que presenta una nueva idea de aplicación web cada día. Cada proyecto es completamente funcional, está construido con Angular sin necesidad de backend, y demuestra diferentes conceptos y funcionalidades.

## 📋 Descripción

El sistema muestra automáticamente un proyecto diferente cada día basándose en la fecha actual. Cada día del año corresponde a uno de los 7 proyectos disponibles, rotando cíclicamente.

## 🎯 Proyectos Incluidos

### Día 1: Gestor de Tareas 📝
Una aplicación completa para gestionar tareas diarias con:
- Crear, completar y eliminar tareas
- Prioridades (Alta, Media, Baja)
- Filtros (Todas, Activas, Completadas)
- Contador de tareas activas

### Día 2: Dashboard del Clima ☀️
Visualiza información meteorológica simulada con:
- Datos de 6 ciudades españolas
- Temperatura, humedad y velocidad del viento
- Iconos del clima
- Botón de actualización para datos aleatorios

### Día 3: Aplicación de Quiz 🎯
Pon a prueba tus conocimientos con:
- 5 preguntas de cultura general
- Respuestas de opción múltiple
- Feedback visual instantáneo
- Resultados con puntuación y porcentaje

### Día 4: Generador de Paletas de Colores 🎨
Crea paletas de colores hermosas:
- Genera paletas aleatorias de 5 colores
- Códigos hexadecimales
- Copiar al portapapeles con un clic
- Interfaz moderna y colorida

### Día 5: Temporizador y Cronómetro ⏱️
Aplicación de control del tiempo con:
- Modo Cronómetro (cuenta hacia arriba)
- Modo Temporizador (cuenta regresiva)
- Controles Start/Stop/Reset
- Formato MM:SS

### Día 6: Bloc de Notas 📔
Toma notas rápidas con:
- Crear y editar notas
- Título y contenido
- Fecha de creación
- Eliminar notas
- Diseño en tarjetas

### Día 7: Calculadora 🔢
Calculadora funcional con:
- Operaciones básicas (+, −, ×, ÷)
- Números decimales
- Manejo de errores (división por cero)
- Diseño moderno con teclado numérico

## 🚀 Comenzar

### Prerrequisitos
- Node.js (v18 o superior)
- npm (v8 o superior)

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/N2AGames/Intro_Felp_Cartas.git
cd Intro_Felp_Cartas/daily-angular-projects
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm start
```

4. Abre tu navegador en `http://localhost:4200`

## 🏗️ Construcción

Para construir el proyecto para producción:

```bash
npm run build
```

Los archivos compilados se generarán en el directorio `dist/`.

## 📁 Estructura del Proyecto

```
daily-angular-projects/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── project-selector/     # Componente principal de selección
│   │   ├── projects/                 # Todos los proyectos demo
│   │   │   ├── task-manager/
│   │   │   ├── weather-dashboard/
│   │   │   ├── quiz-app/
│   │   │   ├── color-palette-generator/
│   │   │   ├── timer-app/
│   │   │   ├── notes-app/
│   │   │   └── calculator-app/
│   │   ├── services/
│   │   │   └── project-rotation.ts  # Lógica de rotación diaria
│   │   └── app.ts                   # Componente raíz
│   ├── styles.css                   # Estilos globales
│   └── index.html                   # HTML principal
├── angular.json                      # Configuración Angular
├── package.json                      # Dependencias
└── tsconfig.json                     # Configuración TypeScript
```

## 🔄 Cómo Funciona la Rotación

El servicio `ProjectRotation` calcula qué proyecto mostrar basándose en el día del año:
- Se calcula el día del año (1-365/366)
- Se aplica módulo 7 para obtener el índice del proyecto
- El proyecto correspondiente se muestra automáticamente

Puedes ver todos los proyectos haciendo clic en "Ver todos los proyectos" y seleccionar cualquiera manualmente.

## 🎨 Características Técnicas

- **Angular 21**: Framework moderno con componentes standalone
- **TypeScript**: Tipado fuerte para mayor seguridad
- **CSS Moderno**: Estilos responsivos con gradientes y animaciones
- **Sin Backend**: Todas las funcionalidades son frontend-only
- **Componentes Modulares**: Cada proyecto es un componente independiente
- **Reactive**: Uso de observables y event binding de Angular

## 🌟 Características de cada Demo

Todas las demos incluyen:
- ✅ Interfaz de usuario intuitiva y moderna
- ✅ Responsive design
- ✅ Animaciones y transiciones suaves
- ✅ Manejo de estado local
- ✅ Sin dependencias de backend
- ✅ Código limpio y documentado

## 📝 Licencia

Este proyecto está bajo la licencia MIT - ver el archivo LICENSE para más detalles.

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

N2AGames - GitHub: [@N2AGames](https://github.com/N2AGames)

Link del Proyecto: [https://github.com/N2AGames/Intro_Felp_Cartas](https://github.com/N2AGames/Intro_Felp_Cartas)
