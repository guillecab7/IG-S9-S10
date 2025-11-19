# IG-S9-S10
Repositorio para la práctica de Informática Gráfica de la Semana 9 y 10

# Tarea a desarrollar
La tarea a realizar es la siguiente:
- Desarrollo de un shader de fragmentos con patrones generativo, asegurando que sea ejecutable de editor de The Book of Shaders. Se hará entrega de una versión tiny code aceptando propuestas de hasta 512 bytes. Todas aquellas que cumplan ambas condiciones, se utilizarán para componer un reel conjunto a mostrar en RRSS.
- En ambos casos, la documentación explicativa del shader debe incluir la motivación, y una detallada descripción de su desarrollo, con especial énfasis en el desarrollo y citando a las fuentes utilizadas.

# Desarrollo del Shader
El shader que pensé  en realizar es principalmente la textura de un [bloque de obsidiana oscura](https://github.com/guillecab7/IG-S9-S10/blob/main/Obsidiana.webp) del videojuego Minecraft. Dado que en el Minecraft es relativamente difícil obtener este bloque, y siempre me llamó la atención la obsidiana por su color negro oscuro, mezclado con el resaltado morado brillante, decidí crear un shader similando esta textura.

El código desarrollado en [Obsidiana_Oscura.frag](https://github.com/guillecab7/IG-S9-S10/blob/main/Obsidiana_Oscura.frag) y su versión [TinyCode](https://github.com/guillecab7/IG-S9-S10/blob/main/Obsidiana_Oscura_Tiny.frag) en 1 línea.

Ahora pasaré a explicar detalladamente como fue la realización de este shader.

## Header iniciales y uniforms
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

## Función pseudoaleatoria
Usamos una función pseudoaleatoria que, dada una coordenada 2D, devuelve un valor en [0,1)

```code
float randomValue(vec2 sampleCoord) {
```
- Declaras una función auxiliar que recibe un `vec2` y devuelve un `float`.

- La vas a usar como generador de ruido pseudoaleatorio.

```code
    float combined = dot(sampleCoord, sampleCoord);
```
- `dot(sampleCoord, sampleCoord)` = `x*x` + `y*y`.

-  Usamos el `dot` consigo mismo solo como mezcla no lineal de la posición

- `combined` es un único número que depende de la posición 2D.

```code
    float sineValue = sin(combined);
```
- Aplicamos sin() a ese valor combinado.

- El seno es periódico y no lineal, entonnces hace que pequeñas variaciones en sampleCoord den cambios caóticos.

```code
    float random01 = fract(sineValue * 4.0);
```
- Multiplicamos el seno por 4.0 para dispersar un poco el valor.

- fract(x) = Quedarnos con la parte fraccionaria de x, siempre en [0,1).

- Resultado: random01 es un número pseudoaleatorio entre 0 y 1 para cada sampleCoord.

```code
    return random01;
}
```
- Devuelvemos ese valor como resultado de la función randomValue.

## Función main

```code
void main() {
```
- Función principal del fragment shader.

- Se ejecuta una vez por cada píxel que se va a pintar.

```code
    vec2 normalizedUV = gl_FragCoord.xy / u_resolution;
```
- `gl_FragCoord.xy` es la posición del píxel en la pantalla, en píxeles.

- Dividiendo entre `u_resolution` lo pasas a coordenadas normalizadas:

  - `(0,0)` → esquina inferior izquierda.

  - `(1,1)` → esquina superior derecha.

- Esto te permite que el shader no dependa de la resolución concreta.

```code
    vec2 cellCoord = floor(normalizedUV * 16.0);
```
- `normalizedUV * 16.0` divide la pantalla en una rejilla de 16×16 “celdas grandes”.

- `floor(x)` se queda con la parte entera.

- `cellCoord` te dice en qué celda grande estás (como un súper-píxel).

- Cada celda compartirá el mismo ruido, color base, etc.

- Es básicamente convertir los píxeles a un tamaño mas grande como si fuesen celdas, simulando esos píxeles grandes del Minecraft.

```code
    vec2 localUV = fract(normalizedUV);
```
- `fract(normalizedUV)` coge solo la parte fraccionaria, pero como `normalizedUV` ya está en [0,1), en la práctica es lo mismo.

- Aquí `localUV` es simplemente una copia de `normalizedUV`.

- Lo usaremos más abajo para calcular la distancia a los bordes de la pantalla, y sombrearlos un poco.

```code
    float baseNoise = randomValue(cellCoord);
```
- Llamas a `randomValue` pasando `cellCoord`.

- Como `cellCoord` es entera por celda, todas las posiciones dentro de la misma celda dan el mismo valor.

- `baseNoise` es un ruido a bloques, hay una constante distinta por celda.

```code
    vec3 baseDarkColor = vec3(0.02, 0.01, 0.06);
```
- Definimos un color RGB muy oscuro, ligeramente azulado/morado.

- Este es el color piedra base de la obsidiana.

```code
    vec3 animatedPurpleColor = vec3(0.2, 0.07, 0.5) * sin(u_time);
```
- Definimos otro color RGB morado más brillante.

- Lo multiplicamos por `sin(u_time)` que oscila entre -1 y 1.

- Así el color morado se va aclarando/oscureciendo con el tiempo como si se tratara de una pulsación.

```code
    float mixFactor = baseNoise;
```
- Factor de mezcla entre el color oscuro y el morado animado.
- 
- Celdas con `mixFactor` alto serán más moradas/brillantes.

```code
    float minDistX = min(localUV.x, 1.0 - localUV.x);
    float minDistY = min(localUV.y, 1.0 - localUV.y);
    float edgeDistance = min(minDistX, minDistY);
```
- `min(localUV.x, 1.0 - localUV.x)`:

  - Distancia a los bordes izquierdo/derecho: cerca del borde → valor pequeño.

- `min(localUV.y, 1.0 - localUV.y)`:

  - Distancia a bordes inferior/superior.

- `edgeDistance` = la menor de todas:

  - Es la distancia al borde más cercano de la pantalla.

  - Si está cerca del borde es muy pequeña y en el centro se hace más grande.

- Se usará para oscurecer los a medida que te acercas del centro a los bordes.

```code
    vec3 finalColor = mix(baseDarkColor, animatedPurpleColor, mixFactor);
```
- La función `mix(a, b, t) = a*(1-t) + b*t` funciona así.

- Si `mixFactor = 0` entonces `finalColor = baseDarkColor` (oscuro).

- Si `mixFactor = 1` entonces `finalColor = animatedPurpleColor` (morado).

- Si mixfactor tiene valores intermedios entonces hará mezclas entre ambos, dando más énfasis al oscuro si está cerca de 0, y más énfasis al morado si está cerca de 1.

- El resultado es que cada celda tiene una intensidad morada distinta, animada con el tiempo.

```code
    float speckleNoise = randomValue(cellCoord + 9.0);
```
- Vuelves a calcular ruido, pero usando `cellCoord + 9.0` para cambiar el patrón.

- `speckleNoise` es otro ruido independiente del anterior.

- Lo usas para marcar qué celdas tienen puntos brillantes más especiales.

```code
    float stripePattern = 0.5 + 0.5 * sin(cellCoord.x * 0.8 + cellCoord.y * 0.4);
```
- Calculamos un patrón para generar bandas cuadradas:

- `cellCoord.x * 0.8 + cellCoord.y * 0.4` combina la posición en X e Y.

- Usamos la función sin para repartir las combinaciones generadas a lo largo de la imagen.

- Usamos este método de truncado para convertir los valores del seno `0.5 + 0.5 * sin(...)` y que pasen de valer [-1,1] a sólo valores positivos [0,1].

- Así obtenemos un patrón suave de bandas (claras/oscuras) en diagonal.

- Dado que con la explicación es difícil de imaginar, la siguiente imagen obtenida en el test ejecutado del editor [The Book of Shaders](http://editor.thebookofshaders.com/)nos muestra el resultado. A veces una imagen vale más que mil palabras.



```code
    // Mezclamos el color actual con un morado intenso (highlight) solo en algunas celdas
    // step(0.9, speckleNoise) devuelve:
    //   0.0 si speckleNoise < 0.9  → sin highlight
    //   1.0 si speckleNoise >= 0.9 → celda con highlight
    vec3 highlightColor = vec3(0.45, 0.18, 0.75);
    finalColor = mix(finalColor, highlightColor, step(0.9, speckleNoise));
```

```code
    // Aplicamos variación de brillo basada en el patrón de vetas:
    // mix(0.75, 1.25, stripePattern * 0.6) da un factor entre ~0.75 y ~1.25
    // Esto hace que unas zonas se vean más claras y otras más oscuras, simulando vetas
    float stripeBrightnessFactor = mix(0.75, 1.25, stripePattern * 0.6);
    finalColor *= stripeBrightnessFactor;
```

```code
    // Aplicamos sombreado en los bordes:
    // edgeDistance pequeño cerca de los bordes, grande en el centro
    // edgeDistance / 0.15 normaliza un poco ese valor para usarlo en la mezcla
    // El factor de mezcla va entre 0.4 (más oscuro) y 1.1 (un poco más brillante)
    float edgeBrightnessFactor = mix(0.4, 1.1, edgeDistance / 0.15);
    finalColor *= edgeBrightnessFactor;
```

```code
    // Asignamos el color final del fragmento con alfa = 1.0 (totalmente opaco)
    gl_FragColor = vec4(finalColor, 1.0);
}
```

```code

```














