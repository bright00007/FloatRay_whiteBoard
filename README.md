# FloatRay_whiteBoard
在线白板，实时互动~

## 导入floatrayBoard.js
import FloatrayBoard from "./library/floatRayBoard.js";

## 初始化
const draw = new FloatrayBoard("selector");

## functions
### 重置canvas大小，获取父元素宽高，重新赋值
draw.resetSize();
### 设置画布是否选择模式（开发中）
draw.setCanvasSelect(boolean);
### 设置画笔颜色，仅支持HTML 6位（#000000）
draw.setBrushColor("#000000");
### 设置画笔大小
draw.setBrushSize(number);
### 设置画笔类型
draw.setBrushType(type);
* type
1. 画笔涂鸦
2. 直线
3. 虚线
4. 箭头直线
5. 箭头虚线
6. 矩形框
7. 矩形填充
8. 圆环
9. 圆形填充
10. 文本
### 删除画笔路径
draw.deleteBrushPath(index);