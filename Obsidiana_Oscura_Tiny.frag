#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;uniform float u_time;float f(vec2 s){return fract(sin(dot(s,s))*4.);}void main(){vec2 u=gl_FragCoord.xy/u_resolution;vec2 p=floor(u*16.),F=fract(u);float a=f(p);vec3 x=vec3(.02,.01,.06),y=vec3(.2,.07,.5)*sin(u_time);float v=a,e=min(min(F.x,1.-F.x),min(F.y,1.-F.y));vec3 l=mix(x,y,v);float
d=f(p+9.),s=.5+.5*sin(p.x*.8+p.y*.4);l=mix(l,vec3(.45,.18,.75),step(.9,d));l*=mix(.75,1.25,s*.6);l*=mix(.4,1.1,e/.15);gl_FragColor=vec4(l,1.);}