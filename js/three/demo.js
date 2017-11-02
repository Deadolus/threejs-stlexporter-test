//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var scene, renderer, camera, container, animation ,mixer, plane, renderTarget;
var hasMorph = false;
var prevTime = Date.now();
var clock = new THREE.Clock();
var canvasTexture;
var UvLayout = {INSIDE: 1, OUTSIDE: 2, OUTSIDE_MIRRORED: 3};
var currentUvLayout = UvLayout.OUTSIDE;
function render() {
    //if(canvasTexture!==undefined)
    //renderer.render( scene, camera, canvasTexture );
    //renderer.render( scene, camera, renderTarget, true);
//else
renderer.render( scene, camera) ;
    //var mycanvas = canvasTexture;
    //var pixels = new self.Uint8Array(1024*500*4);
    //var rt = renderTarget;
    //var gl = renderer.context;
    ////var fb =renderTarget.__webglFramebuffer ;
    //var fb =gl.createFramebuffer();
    //var fb = gl.createFramebuffer();
    //gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, canvasTexture, 0);
    //if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
    //  var pixels = new Uint8Array(width * height * 4);
    //  gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    //}
//gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
//gl.readPixels(0, 0, 1024, 500, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
//canvasTexture.needsUpdate = true;
plane.material.needsUpdate = true;
plane.geometry.attributes.position.needsUpdate = true;

}

function animate() {

    requestAnimationFrame( animate );


    if ( mixer !== null ) {

        var delta = clock.getDelta();
        //mixer.update(delta);

    }
    render();


}

function onWindowResize() {

//    camera.aspect = container.offsetWidth / container.offsetHeight;
camera.aspect = 1024 / 500;
    camera.updateProjectionMatrix();

    //renderer.setSize( container.offsetWidth, container.offsetHeight );
renderer.setSize( 500, 1024 );

    render();

}

function setupLights() {

    var directionalLight = new THREE.DirectionalLight( 0xb8b8b8 );
    directionalLight.position.set(1, 1, 1).normalize();
    directionalLight.intensity = 1.0;
    scene.add( directionalLight );

    directionalLight = new THREE.DirectionalLight( 0xb8b8b8 );
    directionalLight.position.set(-1, 0.6, 0.5).normalize();
    directionalLight.intensity = 0.5;
    scene.add(directionalLight);

    directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(-0.3, 0.6, -0.8).normalize( 0xb8b8b8 );
    directionalLight.intensity = 0.45;
    scene.add(directionalLight);

}


function init(  ) {

    renderTarget = new THREE.WebGLRenderTarget(1024,500, {
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    stencilBuffer: false,
        depthBuffer: true 
    }
    );
renderTarget.generateMimpas = false;
    container = document.createElement( 'div' );
    container.id = 'viewport';
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true  } );
    renderer.setSize( container.offsetWidth, container.offsetHeight );
    renderer.setClearColor( 0x000000, 0 );
    container.appendChild( renderer.domElement );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    var aspect = container.offsetWidth / container.offsetHeight;
    camera = new THREE.PerspectiveCamera( 50, aspect, 0.01, 50 );
    orbit = new THREE.OrbitControls( camera, container );
    orbit.addEventListener( 'change', render );

    //orbit.autoRotate = true;
    camera.position.z = 5;
    camera.position.x = 5;
    camera.position.y = 5;
    var target = new THREE.Vector3( 0, 1, 0 );
    camera.lookAt( target );
    orbit.target = target;
    camera.updateProjectionMatrix();
scene = new THREE.Scene();

//canvasTexture = new THREE.Texture(parent.document.getElementById('imageCanvas'));
canvasTexture = new THREE.TextureLoader().load( "./bump-map.jpg",
	function ( texture ) {
        //render();
	},
);



canvasTexture.wrapS = canvasTexture.wrapT = THREE.RepeatWrapping;
canvasTexture.repeat.set(1,1);
var geometry = new THREE.PlaneBufferGeometry( 10, 2, 200, 100);
var material = new THREE.MeshPhongMaterial( {color: 0xffffff,
side: THREE.DoubleSide,
    //displacementMap: canvasTexture,
displacementScale: 0.5,
displacementBias: 0,
//bumpMap: canvasTexture,
map: canvasTexture,
bumpScale: 0.5,
skinning: true,
    wireframe: true
} );
plane = new THREE.Mesh( geometry, material );
plane.name = "plane";


plane.geometry.uvsNeedUpdate = true;
scene.add( plane );
setupLights();

scene.add( new THREE.GridHelper( 10, 10 ) );

    window.addEventListener( 'resize', onWindowResize, false );
onWindowResize();
render();
document.getElementById( "exportSTL" ).setAttribute( "onClick", "javascript: exportSTL(scene);" );


}

function exportSTL(scene) {
    console.log("Exporting model");
    //var exporter = new THREE.STLExporter();
    var exporter = new THREE.STLBinaryExporter();
    //var exporter = new THREE.OBJExporter();
    var object = scene.getObjectByName( "plane" );
    applyDisplacementMap(object, canvasTexture, 0, 0.5);
    var stlString = exporter.parse( object);
    var blob = new Blob([stlString], {type: 'text/plain'});

        saveAs(blob, "model.stl");
    //saveAs(blob, "model.obj");
}

function applyDisplacementMap(mesh, heightMap, minHeight, maxHeight) {
    var uvs = mesh.geometry.attributes.uv.array;
    var positions = mesh.geometry.attributes.position.array;
    var normals = mesh.geometry.attributes.normal.array;
    var position = new THREE.Vector3();
    var normal = new THREE.Vector3();
    var uv = new THREE.Vector2();
    var width = heightMap.image.width;
    var height = heightMap.image.height;
    var canvas = document.getElementById('imageCanvas');
    var context = canvas.getContext('2d');

    var buffer = context.getImageData(0, 0, width, height).data;
    for(var index = 0; index < positions.length; index+=3) {
        position.fromArray(positions,index);
        normal.fromArray(normals,index);
        uv.fromArray(uvs,(index/3)*2);
        var u = ((Math.abs(uv.x)*width)%width) | 0;
        var v = ((Math.abs(uv.y)*height)%height) | 0;
        var pos = (u+v*width) * 4;
        var r = buffer[pos] / 255.0;
        var g = buffer[pos + 1] / 255.0;
        var b = buffer[pos + 2] / 255.0;
        var gradient = r * 0.33 + g * 0.33 + b * 0.33;
        normal.normalize();
        normal.multiplyScalar(minHeight + (maxHeight - minHeight) * gradient);
        position = position.add(normal);
        position.toArray(positions, index);
    }
    mesh.geometry.needsUpdate = true;
    render();
    render();
}
