import {MaterialLibrary, OBJ} from "webgl-obj-loader";

const ufo_model = require("../models/ufo.obj");
const ufo_material = require("../models/ufo.mtl");
const cow_model = require("../models/cow.obj");
const cow_material = require("../models/cow.mtl");
const street_light_model = require("../models/street_light.obj");
const street_light_material = require("../models/street_light.mtl");
const street_light_pole_model = require("../models/street_light_pole.obj");
const street_light_pole_material = require("../models/street_light_pole.mtl");
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
            model = street_light_model;
            material = street_light_material;
            break;
        case "street_light_pole":
            model = street_light_pole_model;
            material = street_light_pole_material;
            break;
    }
    try {
        const obj = await fetch(model);
        const mtl = await fetch(material);
        const objData = await obj.text();
        const mtlData = await mtl.text();
        const mtl_lib = new MaterialLibrary(mtlData);
        const mesh = new OBJ.Mesh(objData);
        mesh.addMaterialLibrary(mtl_lib);

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