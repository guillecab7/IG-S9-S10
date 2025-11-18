#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;

    // Repetimos el bloque 4x4 veces en pantalla
    vec2 blockUV = fract(uv * 4.0);

    // “Pixelado” tipo 16x16 del bloque
    vec2 pix = blockUV * 16.0;
    vec2 cell = floor(pix);
    vec2 f = fract(pix);

    float n1 = random(cell);
    float n2 = random(cell + 17.3);
    float n3 = random(cell + 42.7);

    // Colores base de obsidiana
    vec3 deep   = vec3(0.02, 0.01, 0.06);  // casi negro azulado
    vec3 mid    = vec3(0.202,0.067,0.540) * sin(u_time);  // morado oscuro
    vec3 highlight = vec3(0.45, 0.18, 0.75); // brillo morado

    // Mezcla base oscura
    float v = clamp(n1 * 0.6 + n2 * 0.4, 0.0, 1.0);
    vec3 col = mix(deep, mid, v);

    // Vetas / bandas suaves
    float stripe = 0.5 + 0.5 * sin((cell.x * 0.8 + cell.y * 0.4));
    col *= mix(0.75, 1.25, stripe * 0.6);

    // Manchas moradas brillantes
    float speckMask = step(0.88, n3);
    float speckIntensity = 0.3 + 0.7 * v;
    col = mix(col, highlight, speckMask * speckIntensity);

    // Oscurecer un poco los bordes de cada “pixel” para dar textura
    float edge = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
    float edgeMask = smoothstep(0.0, 0.15, edge);
    col *= mix(0.4, 1.1, edgeMask);

    col = clamp(col, 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
}
