# Canvas Exif Orientation

draw a image on a canvas dependent on Exif Orientation.

```js
var CanvasExifOrientation = require('canvas-exif-orientation');
// drawn canvas element.
var canvas = CanvasExifOrientation.drawImage(img, orientation);
```

## install

```
npm install canvas-exif-orientation
```

## Orientation

* http://www.cipa.jp/std/documents/e/DC-008-2012_E.pdf
* http://www.cipa.jp/std/documents/j/DC-008-2012_J.pdf (Japanese)

### 1

The 0th row is at the visual top of the image, and the 0th column is the visual left-hand side.

![1](example/orientation/1.jpg)

### 2

The 0th row is at the visual top of the image, and the 0th column is the visual right-hand side.

![2](example/orientation/2.jpg)

### 3

The 0th row is at the visual bottom of the image, and the 0th column is the visual right-hand side.

![3](example/orientation/3.jpg)

### 4

The 0th row is at the visual bottom of the image, and the 0th column is the visual left-hand side.

![4](example/orientation/4.jpg)

### 5

The 0th row is the visual left-hand side of the image, and the 0th column is the visual top.

![5](example/orientation/5.jpg)

### 6

The 0th row is the visual right-hand side of the image, and the 0th column is the visual top.

![6](example/orientation/6.jpg)

### 7

The 0th row is the visual right-hand side of the image, and the 0th column is the visual bottom.

![7](example/orientation/7.jpg)

### 8

The 0th row is the visual left-hand side of the image, and the 0th column is the visual bottom.

![8](example/orientation/8.jpg)
