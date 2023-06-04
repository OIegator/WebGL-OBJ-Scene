import {OBJ} from "webgl-obj-loader";

let model = require("../models/car.obj");

async function initMeshBuffers(gl) {
    try {
        const response = await fetch(model);
        const objData = await response.text();

        const mesh = new OBJ.Mesh(objData);

        console.log(mesh);
        OBJ.initMeshBuffers(gl, mesh);

        const positionBuffer = mesh.vertexBuffer;
        const textureCoordBuffer = mesh.textureBuffer;
        const indexBuffer = mesh.indexBuffer;
        const normalBuffer = mesh.normalBuffer;

        return {
            mesh: mesh,
            position: positionBuffer,
            normal: normalBuffer,
            textureCoord: textureCoordBuffer,
            indices: indexBuffer,
        };
    } catch (error) {
        console.error('Ошибка при загрузке файла .obj:', error);
    }
}

export function initColorBuffer(gl, color) {

    const faceColors = [
        color,
        color,
        color,
        color,
        color,
        color,
    ];

    // Convert the array of colors into a table for all the vertices.

    let colors = [];

    for (let j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return colorBuffer;
}

export {initMeshBuffers};