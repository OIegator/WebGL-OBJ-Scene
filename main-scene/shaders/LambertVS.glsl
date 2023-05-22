#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;
in vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

uniform vec3 uLightPosition;
uniform vec3 uViewPosition;
uniform vec3 uAmbientLightColor;
uniform vec3 uDiffuseLightColor;
uniform vec3 uSpecularLightColor;
uniform float uAmbientIntensity;
uniform float uAttenuationLinear;
uniform float uAttenuationQuadratic;

out vec4 vColor;
out vec3 vPosition;
out vec3 vNormal;
out vec3 vCameraPosition;

out highp vec3 vLightWeighting;
out highp vec2 vTextureCoord;

const float shininess = 32.0;

void main() {

    vec4 vertexPositionEye4 = uModelViewMatrix * vec4(aVertexPosition, 1.0);
    vec3 vertexPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;

    vec3 lightDirection = normalize(uLightPosition - vertexPositionEye3);

    vec3 normal = normalize(mat3(uNormalMatrix) * aVertexNormal);

    float diffuseLightDot = max(dot(normal, lightDirection), 0.0);

    vec3 reflectionVector = normalize(reflect(-lightDirection, normal));

    vec3 viewVectorEye = -normalize(vertexPositionEye3);

    float specularLightDot = max(dot(reflectionVector, viewVectorEye), 0.0);
    float specularLightParam = pow(specularLightDot, shininess);

    float attenuation = 1.0 / (1.0 + uAttenuationLinear * length(lightDirection) +
    uAttenuationQuadratic * length(lightDirection) * length(lightDirection));

    vLightWeighting = uAmbientLightColor * uAmbientIntensity +
    (uDiffuseLightColor * diffuseLightDot +
    uSpecularLightColor * specularLightParam) * attenuation;

    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    vPosition = vertexPositionEye3;
    vColor = aVertexColor;
    vNormal = normal;
    vCameraPosition = viewVectorEye;
    vTextureCoord = aTextureCoord;
}