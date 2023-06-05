#version 300 es
#ifdef GL_ES
precision highp float;
#endif

in highp vec3 vLightDir;
in vec3 vNormal;
in vec4 vColor;
in vec3 vPosition;
in vec3 vCameraPosition;
in highp vec2 vTextureCoord;

uniform vec3 uSpotlightPosition;
uniform vec3 uSpotlightDirection;
uniform float uSpotlightCutoff;
uniform float uSpotlightOuterCutoff;
uniform float uSpotlightIntensity;
uniform float uStreetlightIntensity;

uniform vec3 uLightPosition;
uniform float uAttenuationLinear;
uniform float uAttenuationQuadratic;
uniform float uAmbientIntensity;
uniform vec3 uAmbientLightColor;
uniform vec3 uDiffuseLightColor;
uniform vec3 uSpecularLightColor;
out vec4 fragColor;

uniform sampler2D uSampler1;
uniform sampler2D uSampler2;

const float shininess = 32.0;

void main() {

    highp vec4 tColor1 = texture(uSampler1, vTextureCoord);
    highp vec4 tColor2 = texture(uSampler2, vTextureCoord);

    vec3 lightDirection = normalize(uLightPosition - vPosition);

    float diffuseLightDot = max(dot(vNormal, lightDirection), 0.0);

    vec3 reflectionVector = normalize(reflect(-lightDirection, vNormal));
    vec3 V = normalize(vCameraPosition - vPosition);
    vec3 halfwayDir = normalize(reflectionVector + V);

    vec3 spotlightDirection = normalize(uSpotlightPosition - vPosition);
    float spotlightDot = dot(spotlightDirection, normalize(-vec3(0.0, -1.0, 0.0)));
    float spotlightFactor = smoothstep(uSpotlightOuterCutoff, uSpotlightCutoff, spotlightDot);

    float diffuseLightDot2 = max(dot(vNormal, spotlightDirection), 0.0);
    vec3 reflectionVector2 = normalize(reflect(-spotlightDirection, vNormal));
    vec3 halfwayDir2 = normalize(reflectionVector2 + V);
    float specularLightDot2 = max(dot(reflectionVector2, halfwayDir2), 0.0);
    float specularLightParam2 = pow(specularLightDot2, shininess);

    //-------------------------------------
    vec3 streetLightDirection = normalize(vec3(12.0, 4.0, -22.0) - vPosition);
    float streetLightDot = dot(streetLightDirection, normalize(-vec3(0.0, -1.0, 0.0)));
    float streetLightFactor = smoothstep(uSpotlightOuterCutoff, uSpotlightCutoff, streetLightDot);
    float diffuseLightDot3 = max(dot(vNormal, streetLightDirection), 0.0);
    vec3 reflectionVector3 = normalize(reflect(-streetLightDirection, vNormal));
    vec3 halfwayDir3 = normalize(reflectionVector3 + V);
    float specularLightDot3 = max(dot(reflectionVector3, halfwayDir3), 0.0);
    float specularLightParam3 = pow(specularLightDot3, shininess);
    //-------------------------------------
    vec3 streetLightDirection2 = normalize(vec3(-12.0, 4.0, -22.0) - vPosition);
    float streetLightDot2 = dot(streetLightDirection2, normalize(-vec3(0.0, -1.0, 0.0)));
    float streetLightFactor2 = smoothstep(uSpotlightOuterCutoff, uSpotlightCutoff, streetLightDot2);
    float diffuseLightDot4 = max(dot(vNormal, streetLightDirection2), 0.0);
    vec3 reflectionVector4 = normalize(reflect(-streetLightDirection2, vNormal));
    vec3 halfwayDir4 = normalize(reflectionVector4 + V);
    float specularLightDot4 = max(dot(reflectionVector4, halfwayDir4), 0.0);
    float specularLightParam4 = pow(specularLightDot4, shininess);
    //-------------------------------------
    float specularLightDot = max(dot(reflectionVector, halfwayDir), 0.0);
    float specularLightParam = pow(specularLightDot, shininess);

    float attenuation = 1.0 / (1.0 + uAttenuationLinear * length(lightDirection) +
    uAttenuationQuadratic * length(lightDirection) * length(lightDirection));

    vec3 vLightWeighting = uAmbientLightColor * uAmbientIntensity +
    (vec3(0.0, 1.0, 0.0) * diffuseLightDot2 +
    vec3(0.0, 1.0, 0.0)* specularLightParam2) * attenuation * spotlightFactor * uSpotlightIntensity +
    (uDiffuseLightColor * diffuseLightDot3 +
    uSpecularLightColor * specularLightParam3 * 1.0) * attenuation * streetLightFactor * uStreetlightIntensity +
    (uDiffuseLightColor * diffuseLightDot4 +
    uSpecularLightColor * specularLightParam4 * 1.0) * attenuation * streetLightFactor2 * uStreetlightIntensity;


    fragColor = (tColor1) * vec4(vLightWeighting, 1);

}