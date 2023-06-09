import LambertVS from '../shaders/LambertVS.glsl'
import PhongFS from '../shaders/PhongFS.glsl'
import {initCubeBuffers, initColorBuffer} from "./initCubeBuffers";
import {initMeshBuffers} from "./initMeshBuffers";
import {drawCube} from "./drawCube.js";
import {drawMesh} from "./drawMesh.js";
import ufo_texture from "../textures/ufo_diffuse.png"
import cow_texture from "../textures/cow.png"
import grass_texture from "../textures/grass.jpg"
import {vec3} from "gl-matrix";

const canvas = document.querySelector('canvas');
const textLight = document.getElementById('light-overlay');
const textShade = document.getElementById('shade-overlay');
let gl;

let controls = {
    pedestal_center: [],
    current_rotator: "cow1_y",
    current_controller: "ambient",
    rotation_angle_gold: Math.PI,
    object_position: [0.0, 0.0, -16.0],
    headlight_direction: [0.0, -1.0, 0.0],
    movement_speed: 0.5,
    object_rotation: 0.0,
    position_cow1: [-10.0, -4.0, -20.0],
    rotation_cow1: [0.0, -0.7, 0.0],
    current_frame_cow1: 0,
    rotation_angle_bronze: 0.0,
    rotation_angle_pedestal_2itself: 0.0,
    rotation_angle_pedestal_2scene: 0.0,
    attenuation_linear: 0.0,
    attenuation_quadratic: 0.0,
    ambient_intensity: 2,
    spotlight_intensity: 1.0,
    spotlight_switch: 1,
    streetlight_switch: 1,
    streetlight_intensity: 1.0,
    current_vs: LambertVS,
    current_fs: PhongFS,
    fs_list: [PhongFS],
    fs_ind: 0,
    vs_list: [LambertVS],
    vs_ind: 0,
}


function initWebGL(canvas) {
    gl = null
    const names = ["webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    for (let ii = 0; ii < names.length; ++ii) {
        try {
            gl = canvas.getContext(names[ii]);
        } catch (e) {
        }
        if (gl) {
            break;
        }
    }

    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    return gl;
}

async function main() {
    gl = initWebGL(canvas);

    if (gl) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    const cubeBuffers = initCubeBuffers(gl);
    const ufoBuffers = await initMeshBuffers(gl, "ufo");
    const cowBuffers = await initMeshBuffers(gl, "cow");
    const streetLightBuffers = await initMeshBuffers(gl, "street_light");
    const streetLightPoleBuffers = await initMeshBuffers(gl, "street_light_pole");

    const grassTexture = loadTexture(gl, grass_texture);
    const ufoTexture = loadTexture(gl, ufo_texture);
    const cowTexture = loadTexture(gl, cow_texture);


    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)


    window.addEventListener("keydown", checkKeyPressed);

    function render() {

        let shaderProgram = initShaderProgram(gl, controls.current_vs, controls.current_fs);

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition:
                    gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                vertexNormal:
                    gl.getAttribLocation(shaderProgram, "aVertexNormal"),
                vertexColor:
                    gl.getAttribLocation(shaderProgram, "aVertexColor"),
                textureCoord:
                    gl.getAttribLocation(shaderProgram, "aTextureCoord"),
            },
            uniformLocations: {
                projectionMatrix:
                    gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                modelViewMatrix:
                    gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
                normalMatrix:
                    gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
                lightPosition:
                    gl.getUniformLocation(shaderProgram, "uLightPosition"),
                spotlightPosition:
                    gl.getUniformLocation(shaderProgram, "uSpotlightPosition"),
                spotlightDirection:
                    gl.getUniformLocation(shaderProgram, "uSpotlightDirection"),
                spotlightCutoff:
                    gl.getUniformLocation(shaderProgram, "uSpotlightCutoff"),
                spotlightOuterCutoff:
                    gl.getUniformLocation(shaderProgram, "uSpotlightOuterCutoff"),
                spotlightIntensity:
                    gl.getUniformLocation(shaderProgram, "uSpotlightIntensity"),
                streetlightIntensity:
                    gl.getUniformLocation(shaderProgram, "uStreetlightIntensity"),
                spotlightExponent:
                    gl.getUniformLocation(shaderProgram, "uSpotlightExponent "),
                ambientLightColor:
                    gl.getUniformLocation(shaderProgram, "uAmbientLightColor"),
                diffuseLightColor:
                    gl.getUniformLocation(shaderProgram, "uDiffuseLightColor"),
                specularLightColor:
                    gl.getUniformLocation(shaderProgram, "uSpecularLightColor"),
                attenuationLinear:
                    gl.getUniformLocation(shaderProgram, "uAttenuationLinear"),
                attenuationQuadratic:
                    gl.getUniformLocation(shaderProgram, "uAttenuationQuadratic"),
                ambientIntensity:
                    gl.getUniformLocation(shaderProgram, "uAmbientIntensity"),
                uSampler1:
                    gl.getUniformLocation(shaderProgram, "uSampler1"),
                uSampler2:
                    gl.getUniformLocation(shaderProgram, "uSampler2"),
            },

        };


        if (shaderProgram) {
            checkObjectPosition();
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.clearDepth(1.0);
            let colorBuffer = initColorBuffer(gl, [1.0, 0.85, 0.0, 1.0]);
            drawCube(gl, programInfo, cubeBuffers, grassTexture, null, colorBuffer, "grass1", controls);
            drawCube(gl, programInfo, cubeBuffers, grassTexture, null, colorBuffer, "grass2", controls);
            drawCube(gl, programInfo, cubeBuffers, grassTexture, null, colorBuffer, "grass3", controls);
            drawCube(gl, programInfo, cubeBuffers, grassTexture, null, colorBuffer, "grass4", controls);
            drawCube(gl, programInfo, cubeBuffers, grassTexture, null, colorBuffer, "grass5", controls);
            drawCube(gl, programInfo, cubeBuffers, grassTexture, null, colorBuffer, "grass6", controls);
            drawCube(gl, programInfo, cubeBuffers, grassTexture, null, colorBuffer, "grass7", controls);
            drawCube(gl, programInfo, cubeBuffers, grassTexture, null, colorBuffer, "grass8", controls);
            drawMesh(gl, programInfo, ufoBuffers, ufoTexture, null, colorBuffer, "gold1", controls);
            drawMesh(gl, programInfo, cowBuffers, cowTexture, null, colorBuffer, "cow1", controls);
            drawMesh(gl, programInfo, cowBuffers, cowTexture, null, colorBuffer, "cow2", controls);
            drawMesh(gl, programInfo, streetLightBuffers, ufoTexture, null, colorBuffer, "street_light1", controls);
            drawMesh(gl, programInfo, streetLightPoleBuffers, ufoTexture, null, colorBuffer, "street_light1", controls);
            drawMesh(gl, programInfo, streetLightBuffers, ufoTexture, null, colorBuffer, "street_light2", controls);
            drawMesh(gl, programInfo, streetLightPoleBuffers, ufoTexture, null, colorBuffer, "street_light2", controls);
        }
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture, so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 255, 0, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel
    );

    const image = new Image();

    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    };

    image.src = url;
    return texture;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;

}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function shader2string(shader) {
    switch (shader) {
        case PhongVS:
            return "Phong"
        case LambertVS:
            return "Lambert"
        case BlinnPhongVS:
            return "Blinn-Phong"
        case PhongFS:
            return "Phong"
        case GoureauFS:
            return "Goureau"
        case ToonShadingFS:
            return "Toon Shading"
    }
}

function checkKeyPressed(e) {

    if (e.key === "f") {
        controls.current_fs = controls.fs_list[++controls.fs_ind % controls.fs_list.length];
        textShade.innerText = "Shading Model: " + shader2string(controls.fs_list[controls.fs_ind % controls.fs_list.length]);
    }

    if (e.key === "v") {
        controls.current_vs = controls.vs_list[++controls.vs_ind % controls.vs_list.length];
        textLight.innerText = "Light Model: " + shader2string(controls.vs_list[controls.vs_ind % controls.vs_list.length]);
    }
    if (e.key === "1") {
        controls.ambient_intensity = 0.0;
    }

    if (e.key === "2") {
        if(controls.spotlight_switch) {
            controls.spotlight_intensity = 0.0;
            controls.spotlight_switch = 0;
        } else {
            controls.spotlight_intensity = 1.0;
            controls.spotlight_switch = 1;
        }
    }

    if (e.key === "3") {
        if(controls.streetlight_switch) {
            controls.streetlight_intensity = 0.0;
            controls.streetlight_switch = 0;
        } else {
            controls.streetlight_intensity = 1.0;
            controls.streetlight_switch = 1;
        }
    }

    if (e.key === "4") {
        controls.current_rotator = "cow1_y";
    }

    if (e.key === "5") {
        controls.current_rotator = "cow1_x";
    }

    if (e.key === "6") {
        cow1_anim();
    }

    if (e.key === "7") {
        controls.rotation_cow1[2] += 0.3;
    }
    if (e.key === "8") {

        controls.rotation_cow1[2] -= 0.3;
    }
    if (e.key === "9") {
        controls.rotation_cow1[0] -= 0.4;
        controls.rotation_cow1[1] += 0.6;
    }


    if (e.key === "q") {
        controls.headlight_x -= 1.0;
    }

    if (e.key === "e") {
        controls.headlight_x += 1.0;
    }


    if (e.key === "w") {
        const frontVector = vec3.fromValues(
            -Math.sin(Math.PI),
            0.0,
            -Math.cos(Math.PI)
        );
        controls.rotation_angle_gold += 0.1;
        vec3.scaleAndAdd(controls.object_position, controls.object_position, frontVector, -controls.movement_speed);
        vec3.scaleAndAdd(controls.headlight_direction, controls.headlight_direction, frontVector, -controls.movement_speed);
    }

    if (e.key === "s") {
        const backVector = vec3.fromValues(
            Math.sin(Math.PI),
            0.0,
            Math.cos(Math.PI)
        );
        controls.rotation_angle_gold -= 0.1;
        vec3.scaleAndAdd(controls.object_position, controls.object_position, backVector, -controls.movement_speed);
        vec3.scaleAndAdd(controls.headlight_direction, controls.headlight_direction, backVector, -controls.movement_speed);
    }

    if (e.key === "a") {
        const leftVector = vec3.fromValues(
            -Math.cos(Math.PI),
            0.0,
            Math.sin(Math.PI)
        );
        controls.rotation_angle_gold += 0.1;
        vec3.scaleAndAdd(controls.object_position, controls.object_position, leftVector, -controls.movement_speed);
        vec3.scaleAndAdd(controls.headlight_direction, controls.headlight_direction, leftVector, -controls.movement_speed);
    }

    if (e.key === "d") {
        const rightVector = vec3.fromValues(
            Math.cos(Math.PI),
            0.0,
            -Math.sin(Math.PI)
        );
        controls.rotation_angle_gold -= 0.1;
        vec3.scaleAndAdd(controls.object_position, controls.object_position, rightVector, -controls.movement_speed);
        vec3.scaleAndAdd(controls.headlight_direction, controls.headlight_direction, rightVector, -controls.movement_speed);
    }

    if (e.key === "ArrowLeft") {
        switch (controls.current_rotator) {
            case "gold":
                controls.rotation_angle_gold += 0.1;
                controls.headlight_direction[0] -= 1;
                break;
            case "cow1_y":
                controls.rotation_cow1[1] -= 0.1;
                break;
            case "cow1_x":
                controls.rotation_cow1[0] -= 0.1;
                break;
            case "pedestal":
                controls.rotation_angle_pedestal_2itself -= 0.1;
                break;
            case "center":
                controls.rotation_angle_pedestal_2scene -= 0.1;
                break;
        }
    }

    if (e.key === "ArrowRight") {
        switch (controls.current_rotator) {
            case "gold":
                controls.rotation_angle_gold -= 0.1;
                controls.headlight_direction[0] += 1;
                break;
            case "cow1_y":
                controls.rotation_cow1[1] += 0.1;
                break;
            case "cow1_x":
                controls.rotation_cow1[0] += 0.1;
                break;
            case "pedestal":
                controls.rotation_angle_pedestal_2itself += 0.1;
                break;
            case "center":
                controls.rotation_angle_pedestal_2scene += 0.1;
                break;
        }
    }

    if (e.key === "ArrowUp") {
        switch (controls.current_controller) {
            case "lin":
                controls.attenuation_linear -= 0.1;
                break;
            case "quad":
                controls.attenuation_quadratic -= 0.1;
                break;
            case "ambient":
                controls.ambient_intensity += 1;
                break;
        }
    }

    if (e.key === "ArrowDown") {
        switch (controls.current_controller) {
            case "lin":
                controls.attenuation_linear += 0.1;
                break;
            case "quad":
                controls.attenuation_quadratic += 0.1;
                break;
            case "ambient":
                controls.ambient_intensity -= 1;
                break;
        }
    }


}

function checkObjectPosition() {
    const objectX = controls.object_position[0];
    const objectY = controls.object_position[1];
    const cowX = controls.position_cow1[0];
    const cowY = controls.position_cow1[1];

    const distance = Math.sqrt(Math.pow(objectX - cowX, 2) + Math.pow(objectY - cowY, 2));

    if (distance <= 4.5) {
        cow1_anim();
    } else {
        controls.rotation_cow1 = [0.0, -0.7, 0.0];
    }
}

function cow1_anim() {
    switch (controls.current_frame_cow1) {
        case 0:
            controls.rotation_cow1[0] = 0.0;
            controls.rotation_cow1[1] = -0.7;
            controls.rotation_cow1[2] = 0.0;
            controls.current_frame_cow1++;
            break;
        case 20:
            controls.rotation_cow1[0] = 0.2;
            controls.rotation_cow1[1] = -1.0;
            controls.current_frame_cow1++;
            break;
        case 60:
            controls.rotation_cow1[2] = 0.3;
            controls.rotation_cow1[1] = -0.8;
            controls.current_frame_cow1++;
            break;
        case 100:
            controls.rotation_cow1[2] = 0.0;
            controls.rotation_cow1[1] = -1.0;
            controls.current_frame_cow1++;
            break;
        case 140:
            controls.rotation_cow1[2] = 0.3;
            controls.rotation_cow1[1] = -0.8;
            controls.current_frame_cow1++;
            break;
        case 180:
            controls.rotation_cow1[2] = 0.0;
            controls.rotation_cow1[1] = -1.0;
            controls.current_frame_cow1++;
            break;
        case 200:
            controls.rotation_cow1[0] = -0.2;
            controls.rotation_cow1[1] = -0.4;
            controls.current_frame_cow1++;
            break;
        case 240:
            controls.rotation_cow1[2] = 0.3;
            controls.rotation_cow1[1] = -0.2;
            controls.current_frame_cow1++;
            break;
        case 280:
            controls.rotation_cow1[2] = 0.0;
            controls.rotation_cow1[1] = -0.4;
            controls.current_frame_cow1++;
            break;
        case 320:
            controls.rotation_cow1[2] = 0.3;
            controls.rotation_cow1[1] = -0.2;
            controls.current_frame_cow1++;
            break;
        case 360:
            controls.rotation_cow1[2] = 0.0;
            controls.rotation_cow1[1] = -0.4;
            controls.current_frame_cow1 = 0;
            break;
        default:
            controls.current_frame_cow1++;
    }
}

main();

