var geo = new THREE.Geometry();

var i = 0, x = 0, line = 0;

for (i = 0; i < BOOK.length; i++) {

    var code = BOOK.charCodeAt(i); // This is the character code for the current letter.

    if (code > lettersPerSide * lettersPerSide) {
        code = 0; // Clamp character codes to letter map size.
    }

    var cx = code % lettersPerSide; // Cx is the x-index of the letter in the map.
    var cy = Math.floor(code / lettersPerSide); // Cy is the y-index of the letter in the map.

    // Add letter vertices to the geometry.
    var v, t;

    geo.vertices.push(
        new THREE.Vector3(x * 1.1 + 0.05, line * 1.1 + 0.05, 0),
        new THREE.Vector3(x * 1.1 + 1.05, line * 1.1 + 0.05, 0),
        new THREE.Vector3(x * 1.1 + 1.05, line * 1.1 + 1.05, 0),
        new THREE.Vector3(x * 1.1 + 0.05, line * 1.1 + 1.05, 0)
    );

    // Create faces for the letter.
    var face = new THREE.Face3(i * 4 + 0, i * 4 + 1, i * 4 + 2);
    geo.faces.push(face);

    face = new THREE.Face3(i * 4 + 0, i * 4 + 2, i * 4 + 3);
    geo.faces.push(face);

    // Compute texture coordinates for the letters.
    var tx = cx / lettersPerSide,
        ty = cy / lettersPerSide,
        off = 1 / lettersPerSide;
    var sz = lettersPerSide * fontSize;

    geo.faceVertexUvs[0].push([
        new THREE.Vector2(tx, ty + off),
        new THREE.Vector2(tx + off, ty + off),
        new THREE.Vector2(tx + off, ty)
    ]);
    
    geo.faceVertexUvs[0].push([
        new THREE.Vector2(tx, ty + off),
        new THREE.Vector2(tx + off, ty),
        new THREE.Vector2(tx, ty)
    ]);

    // On newline, move to the line below and move the cursor to the start of the line.
    // Otherwise move the cursor to the right.
    if (code == 10) {
        line--;
        x = 0;
    } else {
        x++;
    }
}