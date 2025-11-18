# IG-S9-S10
Repositorio para la práctica de Informática Gráfica de la Semana 9 y 10

# Tarea a desarrollar
La tarea a realizar es la siguiente:
- Desarrollo de un shader de fragmentos con patrones generativo, asegurando que sea ejecutable de editor de The Book of Shaders. Se hará entrega de una versión tiny code aceptando propuestas de hasta 512 bytes. Todas aquellas que cumplan ambas condiciones, se utilizarán para componer un reel conjunto a mostrar en RRSS.
- En ambos casos, la documentación explicativa del shader debe incluir la motivación, y una detallada descripción de su desarrollo, con especial énfasis en el desarrollo y citando a las fuentes utilizadas.

# Desarrollo del Shader
El shader que pensé  en realizar es principalmente la textura de un [bloque de obsidiana oscura](https://github.com/guillecab7/IG-S9-S10/blob/main/Obsidiana.webp) del videojuego Minecraft. Dado que en el Minecraft es relativamente difícil obtener este bloque, y siempre me llamó la atención la obsidiana por su color negro oscuro, mezclado con el resaltado morado brillante, decidí crear un shader similando esta textura.

El código desarrollado en [Obsidiana_Oscura.frag](https://github.com/guillecab7/IG-S9-S10/blob/main/Obsidiana_Oscura.frag) y su versión [TinyCode](https://github.com/guillecab7/IG-S9-S10/blob/main/Obsidiana_Oscura_tiny.frag) en 1 línea.

Ahora pasaré a explicar detalladamente como fue la realización de este shader.

```code
#ifdef GL_ES
precision mediump float;
#endif
```
- `#ifdef GL_ES / #endif`: directivas del preprocesador.

  - Solo se aplica este bloque si estás compilando para OpenGL ES (como en WebGL / The Book of Shaders).

- `precision mediump float;`: fija la precisión por defecto de los `float` a media (`mediump`).

  - Es obligatorio en GLSL ES para evitar errores de precisión no definida.

```code
uniform vec2 u_resolution;
uniform float u_time;
```
- `uniform vec2 u_resolution;`

  - Uniform (dato global) que viene desde fuera del shader.

  - Contiene la resolución de la pantalla: `x = ancho`, `y = alto` en píxeles.

- `uniform float u_time;`

  - Uniform con el tiempo en segundos (normalmente).

  - Lo usas para animar el shader (en este caso, hacer que la obsidiana “respire” un poco con el color medio).
