# Mundial FIFA 2026 - Juego de Predicciones (Porra)

Una aplicación web desarrollada con IA para pasar un buen rato con amigos haciendo predicciones sobre el Mundial de la FIFA 2026.

## ¿Qué permite hacer la aplicación?

Esta plataforma es ideal para organizar una "porra" del Mundial 2026 con tu grupo de amigos. Cada participante puede hacer sus pronósticos completos sobre el torneo y competir para ver quién acierta más.

Características principales:
- **Fase de Grupos**: Permite pronosticar los resultados de cada grupo y determinar cómo quedarán las clasificaciones.
- **Mejores Terceros**: Calcula y organiza los mejores terceros basándose en los resultados de la fase de grupos.
- **Rondas Eliminatorias**: Completa el cuadro (bracket) de las rondas eliminatorias hasta decidir el ganador de la final.
- **Premios Individuales**: Apuesta por los ganadores de la Bota de Oro y el Balón de Oro (primer, segundo y tercer puesto).
- **Ranking de Jugadores**: Visualiza una tabla de clasificación donde se comparan las puntuaciones y aciertos de todos los participantes.
- **Integración con Google Sheets**: Los datos de las predicciones se guardan y leen desde un Google Sheet para gestionar las apuestas del grupo de manera sencilla y sin necesidad de servidor (backend).

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)

## Cómo montar tu propio grupo de predicciones

Si quieres usar esta aplicación con tus amigos, sigue estos pasos:

### 1. Haz un Fork del repositorio
Copia este proyecto a tu propia cuenta de GitHub para tener control sobre el código.

### 2. Crea tu propio Google Sheet
Prepara una hoja de cálculo de Google Sheets manteniendo la estructura de datos que utiliza la aplicación.
A continuación, ve a `Archivo` -> `Compartir` -> `Publicar en la web` y publícalo en formato **CSV**.

### 3. Vincula tu hoja de cálculo
Busca en el código JavaScript la URL que hace referencia al documento original de Google Sheets y sustitúyela por el enlace CSV público de tu nueva hoja de cálculo.

## Licencia

Puedes utilizar, modificar y hacer fork de este proyecto libremente para organizar tus propias predicciones del Mundial.