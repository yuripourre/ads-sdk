#!/bin/bash

cd utils && yarn
cd ..
cd aframe && yarn && yarn run build
cd ..
cd babylonjs && yarn && yarn run build
cd ..
cd beacon && yarn && yarn run build
cd ..
cd r3f && yarn && yarn run build
cd ..
cd threejs && yarn && yarn run build
cd ..
cd web && yarn && yarn run build
cd ..
cd utils && yarn && yarn run build
cd ..

cp -R aframe/dist dist
cp -R babylonjs/dist/* dist
cp -R beacon/dist* dist
cp -R r3f/dist/* dist
cp -R threejs/dist/* dist
cp unity/zesty-unity-sdk.unitypackage dist
cp -R web/dist/* dist
cp -R wonderland/src/index.js dist/zesty-wonderland-sdk.js
cp -R utils/dist/* dist
cp -R assets dist