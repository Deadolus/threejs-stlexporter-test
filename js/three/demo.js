//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var scene, renderer, camera, container, animation ,mixer, plane;
var hasMorph = false;
var prevTime = Date.now();
var clock = new THREE.Clock();
var canvasTexture;
var UvLayout = {INSIDE: 1, OUTSIDE: 2, OUTSIDE_MIRRORED: 3};
var currentUvLayout = UvLayout.OUTSIDE;
function render() {

renderer.render( scene, camera );
//canvasTexture.needsUpdate = true;
plane.material.needsUpdate = true;

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
render();
	},
);



canvasTexture.wrapS = canvasTexture.wrapT = THREE.RepeatWrapping;
canvasTexture.repeat.set(1,1);
//canvasTexture.needsUpdate = true;
var geometry = new THREE.PlaneGeometry( 10, 2, 100, 100);
//var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshPhongMaterial( {color: 0xffffff, 
side: THREE.DoubleSide, 
displacementMap: canvasTexture,
displacementScale: 0.5, 
displacementBias: 0,
//bumpMap: canvasTexture, 
map: canvasTexture, 
bumpScale: 0.5,
skinning: true, 
//wireframe: true
} );
plane = new THREE.Mesh( geometry, material );
plane.name = "plane";
/*var uvs = geometry.faceVertexUvs[ 0 ];
var w = 5 / 256;
var h = 5 / 256;
uvs[ 0 ][ 0 ].set( 0, h );
uvs[ 0 ][ 1 ].set( 0, 0 );
uvs[ 0 ][ 2 ].set( w, h );
uvs[ 1 ][ 0 ].set( 0, 0 );
uvs[ 1 ][ 1 ].set( w, 0 );
uvs[ 1 ][ 2 ].set( w, h );*/


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
    var exporter = new THREE.STLExporter();
    var object = scene.getObjectByName( "plane" );
    var stlString = exporter.parse( object);
    var blob = new Blob([stlString], {type: 'text/plain'});
    saveAs(blob, "model.stl");
}

