@echo off
rd /s /q build
rd /s /q dist
mkdir build
cd build
mkdir js
mkdir img
cd ..
copy background.js build\js
copy ..\..\Toolbox\toolbox.js build\js
copy ..\..\Dependencies\litegl\litegl.min.js build\js
copy ..\..\Dependencies\gl-matrix\gl-matrix-min-2.8.1.js build\js
copy ..\..\Dependencies\Canvas2DtoWebGL\Canvas2DtoWebGL.js build\js
copy noise.png build\img
copy demo.html build

mkdir dist
cd dist
mkdir js
mkdir img
cd ..
copy background.js dist\js
copy noise.png dist\img