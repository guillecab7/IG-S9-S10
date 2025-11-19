#ifdef GL_ES
precision mediump float;
#endif
// Fijamos precisión media para los float en OpenGL ES

uniform vec2 u_resolution;
// Resolución de la ventana: (ancho, alto) en píxeles

uniform float u_time;
// Tiempo global (en segundos, normalmente), usado para animar el color

// Función pseudoaleatoria que, dada una coordenada 2D, devuelve un valor en [0,1)
float randomValue(vec2 sampleCoord) {
    // dot(sampleCoord, sampleCoord) = x*x + y*y
    // Usamos el dot consigo mismo solo como mezcla no lineal de la posición
    float combined = dot(sampleCoord, sampleCoord);

    // Aplicamos sin() para obtener un valor pseudo-caótico
    float sineValue = sin(combined);

    // Escalamos un poco y nos quedamos con la parte fraccionaria
    // fract() fuerza el resultado a estar en el rango [0,1)
    float random01 = fract(sineValue * 4.0);

    return random01;
}

void main() {
    // Coordenadas normalizadas del fragmento: (0,0) abajo-izquierda, (1,1) arriba-derecha
    vec2 normalizedUV = gl_FragCoord.xy / u_resolution;

    // Coordenada de “celda” (tipo pixel gordo) sobre una rejilla virtual de 16x16 en toda la pantalla
    vec2 cellCoord = floor(normalizedUV * 16.0);

    // Parte fraccionaria de la posición dentro de la pantalla (0–1 en cada eje)
    // En este shader se usa para oscurecer ligeramente los bordes, pero a escala de pantalla
    vec2 localUV = fract(normalizedUV);

    // Ruido base por celda: cada celda (cada “cuadradito” virtual) tendrá un valor fijo
    float baseNoise = randomValue(cellCoord);

    // Color base muy oscuro, casi negro con toque azulado (obsidiana de fondo)
    vec3 baseDarkColor = vec3(0.02, 0.01, 0.06);

    // Color morado más vivo, que se modula con el tiempo usando sin(u_time)
    // Esto hace que el tono morado “respire” o pulse suavemente
    vec3 animatedPurpleColor = vec3(0.2, 0.07, 0.5) * sin(u_time);

    // Factor de mezcla entre el color oscuro y el morado animado
    // En este caso, simplemente usamos el ruido base como factor de mezcla
    float mixFactor = baseNoise;

    // Distancia mínima al borde de la pantalla (no de la celda) en ambos ejes
    // Se usa después para oscurecer un poco los bordes y dar sensación de relieve
    float minDistX = min(localUV.x, 1.0 - localUV.x);
    float minDistY = min(localUV.y, 1.0 - localUV.y);
    float edgeDistance = min(minDistX, minDistY);

    // Color actual del material mezclando el fondo oscuro con el morado animado
    // mixFactor controla cuánto tiramos hacia cada uno de los dos colores
    vec3 finalColor = mix(baseDarkColor, animatedPurpleColor, mixFactor);

    // Segundo valor pseudoaleatorio por celda, desplazando la coordenada con +9
    // Sirve para decidir qué celdas tendrán “manchas” moradas más brillantes
    float speckleNoise = randomValue(cellCoord + 9.0);

    // Patrón de vetas/bandas: combinación senoidal de la posición de la celda
    // 0.5 + 0.5 * sin(...) remapea el seno de [-1,1] a [0,1]
    float stripePattern = 0.5 + 0.5 * sin(cellCoord.x * 0.8 + cellCoord.y * 0.4);

    // Mezclamos el color actual con un morado intenso (highlight) solo en algunas celdas
    // step(0.9, speckleNoise) devuelve:
    //   0.0 si speckleNoise < 0.9  → sin highlight
    //   1.0 si speckleNoise >= 0.9 → celda con highlight
    vec3 highlightColor = vec3(0.45, 0.18, 0.75);
    finalColor = mix(finalColor, highlightColor, step(0.9, speckleNoise));

    // Aplicamos variación de brillo basada en el patrón de vetas:
    // mix(0.75, 1.25, stripePattern * 0.6) da un factor entre ~0.75 y ~1.25
    // Esto hace que unas zonas se vean más claras y otras más oscuras, simulando vetas
    float stripeBrightnessFactor = mix(0.75, 1.25, stripePattern * 0.6);
    finalColor *= stripeBrightnessFactor;

    // Aplicamos sombreado en los bordes:
    // edgeDistance pequeño cerca de los bordes, grande en el centro
    // edgeDistance / 0.15 normaliza un poco ese valor para usarlo en la mezcla
    // El factor de mezcla va entre 0.4 (más oscuro) y 1.1 (un poco más brillante)
    float edgeBrightnessFactor = mix(0.4, 1.1, edgeDistance / 0.15);
    finalColor *= edgeBrightnessFactor;

    // Asignamos el color final del fragmento con alfa = 1.0 (totalmente opaco)
    gl_FragColor = vec4(finalColor, 1.0);
}
