import {MaterialLibrary, OBJ} from "webgl-obj-loader";

const ufo_model = require("../models/ufo.obj");
const ufo_material = require("../models/ufo.mtl");
const cow_model = require("../models/cow.obj");
const cow_material = require("../models/cow.mtl");
let model = null;
let material = null;

async function initMeshBuffers(gl, type) {
    switch (type) {
        case "cow":
            model = cow_model;
            material = cow_material;
            break;
        case "ufo":
            model = ufo_model;
            material = ufo_material;
            break;
        case "street_light":
            model = cow_model;
            material = cow_material;
            break;
    }
    try {
        const obj = await fetch(model);
        const mtl = await fetch(material);
        const objData = await obj.text();
        const mtlData = await mtl.text();
        const mtl_lib = new MaterialLibrary(mtlData);
        console.log(mtl_lib);
        const mesh = new OBJ.Mesh(objData);
        mesh.addMaterialLibrary(mtl_lib);

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

export {initMeshBuffers};