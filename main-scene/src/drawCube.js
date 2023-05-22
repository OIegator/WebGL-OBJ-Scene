import {mat4} from "gl-matrix";

function drawCube(gl, programInfo, buffers, texture1, texture2, colorBuffer, cube_type, controls) {

    const fieldOfView = (60 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();

    switch (cube_type) {
        case "grass1":
            mat4.translate(modelViewMatrix, modelViewMatrix, [0, -10.0, -12.0]);
            break;
        case "grass2":
            mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, -10.0, -22.0]);

            break;
        case "grass3":
            mat4.translate(modelViewMatrix, modelViewMatrix, [12.0, -10.0, -22.0]);
            break;
        case "grass4":
            mat4.translate(modelViewMatrix, modelViewMatrix, [12.0, -10.0, -10]);
            break;
        case "grass5":
            mat4.translate(modelViewMatrix, modelViewMatrix, [-12.0, -10.0, -22]);
            break;
        case "grass6":
            mat4.translate(modelViewMatrix, modelViewMatrix, [-11.0, -10.0, -10]);
            break;
    }

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    setPositionAttribute(gl, buffers, programInfo);

    setTextureAttribute(gl, buffers, programInfo);

    //setColorAttribute(gl, colorBuffer, programInfo);

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    setNormalAttribute(gl, buffers, programInfo);

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix
    );

    gl.uniform1f(
        programInfo.uniformLocations.attenuationLinear,
        controls.attenuation_linear);

    gl.uniform1f(
        programInfo.uniformLocations.attenuationQuadratic,
        controls.attenuation_quadratic);

    gl.uniform1f(
        programInfo.uniformLocations.ambientIntensity,
        controls.ambient_intensity);

    const lightPositionValue = [0, 5, 2];

    gl.uniform3fv(
        programInfo.uniformLocations.lightPosition,
        lightPositionValue
    );

    gl.uniform3fv(
        programInfo.uniformLocations.spotlightPosition,
        controls.object_position
    );

    gl.uniform3fv(
        programInfo.uniformLocations.spotlightDirection,
        controls.headlight_direction
    );

    gl.uniform1f(
        programInfo.uniformLocations.spotlightCutoff,
        Math.cos(Math.PI / 4)
    );

    gl.uniform1f(
        programInfo.uniformLocations.spotlightOuterCutoff,
        Math.cos(Math.PI / 2)
    );

    gl.uniform3fv(
        programInfo.uniformLocations.ambientLightColor,
        [0.1, 0.1, 0.1]
    );


    gl.uniform3fv(
        programInfo.uniformLocations.diffuseLightColor,
        [0.7, 0.7, 0.7]
    );

    gl.uniform3fv(
        programInfo.uniformLocations.specularLightColor,
        [1.0, 1.0, 1.0]
    );

    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture1);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler1, 0);

    if (texture2 != null) {
        gl.activeTexture(gl.TEXTURE1);

        // Bind the texture to texture unit 1
        gl.bindTexture(gl.TEXTURE_2D, texture2);

        // Tell the shader we bound the texture to texture unit 1
        gl.uniform1i(programInfo.uniformLocations.uSampler2, 1);
    }

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(gl, buffers, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

// Tell WebGL how to pull out the colors from the color buffer
// into the vertexColor attribute.
function setColorAttribute(gl, colorBuffer, programInfo) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

function setTextureAttribute(gl, buffers, programInfo) {
    const num = 2; // every coordinate composed of 2 values
    const type = gl.FLOAT; // the data in the buffer is 32-bit float
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        num,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

// Tell WebGL how to pull out the normals from
// the normal buffer into the vertexNormal attribute.
function setNormalAttribute(gl, buffers, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}

export {drawCube};